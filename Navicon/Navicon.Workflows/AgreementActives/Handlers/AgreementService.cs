﻿using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Navicon.Repository.Entities;
using System;
using System.Globalization;
using System.Linq;
using Microsoft.Xrm.Sdk.Messages;

namespace Navicon.Workflows.AgreementActives.Handlers
{
    public class AgreementService
    {
        /// <summary>
        /// Используется для установки региональных параметров.
        /// </summary>
        private static readonly CultureInfo Culture = new CultureInfo("ru-RU");
        
        private readonly IOrganizationService _service;
        private readonly EntityReference _agreementRef;

        /// <summary>
        /// Конструктор инициализирующий _service для доступа к данным и _agreementRef для получения данных об объекте
        /// </summary>
        /// <param name="service">Обеспечивает доступ к БД</param>
        /// <param name="agreementRef">Объект в рамках которого был применен бизнес процесс</param>
        public AgreementService(IOrganizationService service, EntityReference agreementRef)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
            _agreementRef = agreementRef ?? throw new ArgumentNullException(nameof(agreementRef));
        }

        /// <summary>
        /// Проверка на существование связанного с договором счета.
        /// Задание 6 п.1-2
        /// </summary>
        /// <param name="checkInvoiceStatusOrType">добавить фильтр "счет со статусом Оплачено" или "счет с типом Вручную"</param>
        /// <returns>true в случае если по заданным параметрам ничего не найдено</returns>
        public bool ExistLinkedInvoice(bool checkInvoiceStatusOrType = false)
        {
            var query = new QueryExpression(nav_invoice.EntityLogicalName)
            {
                NoLock = true,
                TopCount = 1,
                Criteria =
                {
                    Conditions =
                    {
                        new ConditionExpression(nav_invoice.Fields.nav_dogovorid, ConditionOperator.Equal, _agreementRef.Id)
                    }
                }
            };

            if (checkInvoiceStatusOrType)
            {
                var filter = query.Criteria.AddFilter(LogicalOperator.Or);
                filter.Conditions.Add(new ConditionExpression(nav_invoice.Fields.nav_fact, ConditionOperator.Equal, true));
                filter.Conditions.Add(new ConditionExpression(nav_invoice.Fields.nav_type, ConditionOperator.Equal, (int)nav_type.Ruchnoe_sozdanie));
            }
            
            var invoice = _service.RetrieveMultiple(query).Entities;
            return invoice.Count == 0;
        }

        /// <summary>
        /// Получить Entity обьекта Договор
        /// </summary>
        private nav_agreement GetAgreement()
        {
            return _service.Retrieve(
                nav_agreement.EntityLogicalName,
                _agreementRef.Id,
                new ColumnSet(
                    nav_agreement.Fields.nav_paymentplandate,
                    nav_agreement.Fields.nav_creditperiod,
                    nav_agreement.Fields.nav_creditamount,
                    nav_agreement.Fields.nav_name))
                    .ToEntity<nav_agreement>();
        }

        /// <summary>
        /// Удалить все связанные с договором счета с типом=[Автоматически].
        /// Задание 6 п.2 C-1
        /// </summary>
        public void DeleteAutoInvoice()
        {
            var query = new QueryExpression(nav_invoice.EntityLogicalName)
            {
                NoLock = true,
                Criteria =
                {
                    Conditions =
                    {
                        new ConditionExpression(nav_invoice.Fields.nav_dogovorid, ConditionOperator.Equal, _agreementRef.Id),
                        new ConditionExpression(nav_invoice.Fields.nav_type, ConditionOperator.Equal, (int)nav_type.Avtomaticheskoe_sozdanie)
                    }
                }
            };
            
            var invoices = _service.RetrieveMultiple(query).Entities;
            var multipleDeleteRequest = new ExecuteMultipleRequest()
            {
                Settings = new ExecuteMultipleSettings()
                {
                    ContinueOnError = true,
                    ReturnResponses = false
                },
                Requests = new OrganizationRequestCollection()
            };
            
            multipleDeleteRequest.Requests.AddRange(invoices.Select(e => new DeleteRequest() { Target = e.ToEntityReference() }));

            _service.Execute(multipleDeleteRequest);
        }
        

        /// <summary>
        /// Установить на договоре поле [Дата графика платежей] =Текущей датой + 1 день
        /// Задание 6 п.2 C-3
        /// </summary>
        public void SetPaymentPlanDateInAgreement()
        {
            var navAgreement = new nav_agreement()
            {
                Id = _agreementRef.Id,
                nav_paymentplandate = DateTime.Now.AddDays(1)
            };

            _service.Update(navAgreement);
        }

        /// <summary>
        /// Формирование графика платежей. Создание счетов.
        /// Задание 6 п.2 C-3
        /// </summary>
        public void CreatePaymentSchedule()
        {
            var agreement = GetAgreement();
            if (agreement == null)
            {
                throw new ArgumentNullException(nameof(agreement), "Agreement не найден");
            }

            if (agreement.nav_creditamount == null)
            {
                throw new ArgumentNullException(nameof(agreement.nav_creditamount), 
                    "Creditamount не найден. Заполните поле [Сумма кредита]");
            }

            if (agreement.nav_creditperiod == null)
            {
                throw new ArgumentNullException(nameof(agreement.nav_creditperiod), 
                    "Creditperiod не найден. Заполните поле [Срок кредита]");
            }

            var creditPeriodInMonth = agreement.nav_creditperiod.Value * 12;
            var paymentInMonth = new Money(agreement.nav_creditamount.Value / creditPeriodInMonth);

            var now = DateTime.Now;
            var firstPaymentDay = new DateTime(now.Year, now.Month + 1, 1);

            
            var multipleCreateRequest = new ExecuteMultipleRequest()
            {
                Settings = new ExecuteMultipleSettings()
                {
                    ContinueOnError = true,
                    ReturnResponses = false
                },
                Requests = new OrganizationRequestCollection()
            };
            
            var navName = agreement.nav_name + " ";
            for (var i = 0; i < creditPeriodInMonth; i++)
            {
                var invoice = new nav_invoice()
                {
                    nav_date = now,
                    nav_dogovorid = _agreementRef,
                    nav_fact = false,
                    nav_type = nav_type.Avtomaticheskoe_sozdanie,
                    nav_amount = paymentInMonth,
                    nav_name = navName + firstPaymentDay.ToString("MMMM yyyy", Culture),
                    nav_paydate = firstPaymentDay
                };

                multipleCreateRequest.Requests.Add(new CreateRequest() { Target = invoice });
                firstPaymentDay = firstPaymentDay.AddMonths(1);
            }
            _service.Execute(multipleCreateRequest);
        }
    }
}
