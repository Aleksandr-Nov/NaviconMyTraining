using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Navicon.Repository.Entities;
using System;
using System.Activities;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Navicon.Workflows.AgreementActives.Handlers
{
    public class AgreementService
    {
        private readonly IOrganizationService _service;
        private readonly EntityReference _agreementRef;

        public AgreementService(IOrganizationService service, EntityReference agreementRef)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
            _agreementRef = agreementRef ?? throw new ArgumentNullException(nameof(_agreementRef));
            if (agreementRef.Id == null)
            {
                throw new ArgumentNullException(nameof(agreementRef), "AgreementId not found");
            }
        }
        /// <summary>
        /// Поиск связанного с договором счета.
        /// Задание 6 п.1-2
        /// </summary>
        /// <param name="checkInvoiceStatus">type bool добавить фильтр "счет со статусом Оплачено"</param>
        /// <param name="checkInvoiceType">type bool добавить фильтр "счет с типом Вручную"</param>
        public bool CheckLinkedInvoice(bool checkInvoiceStatus = false, bool checkInvoiceType = false)
        {
            QueryExpression query = new QueryExpression(nav_invoice.EntityLogicalName);
            query.NoLock = true;
            query.TopCount = 1;
            query.Criteria.AddCondition(nav_invoice.Fields.nav_dogovorid, ConditionOperator.Equal, _agreementRef.Id);
            if(checkInvoiceStatus)
            {
                query.Criteria.AddCondition(nav_invoice.Fields.nav_fact, ConditionOperator.Equal, true);
            }

            if (checkInvoiceType)
            {
                query.Criteria.AddCondition(nav_invoice.Fields.nav_type, ConditionOperator.Equal, (int)nav_type.Ruchnoe_sozdanie);
            }

            var invoice = _service.RetrieveMultiple(query);
            return invoice.Entities.Count() == 0;
        }

        /// <summary>
        /// Получить Entity обьекта Договор
        /// </summary>
        public nav_agreement GetAgreement()
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
            QueryExpression query = new QueryExpression(nav_invoice.EntityLogicalName);
            query.NoLock = true;
            query.Criteria.AddCondition(nav_invoice.Fields.nav_dogovorid, ConditionOperator.Equal, _agreementRef.Id);
            query.Criteria.AddCondition(nav_invoice.Fields.nav_type, ConditionOperator.Equal, (int)nav_type.Avtomaticheskoe_sozdanie);
            var invoices = _service.RetrieveMultiple(query);

            if (invoices.Entities.Count() != 0)
            {
                foreach (var invoice in invoices.Entities)
                {
                    _service.Delete(invoice.LogicalName, invoice.Id);
                }
            }
        }

        /// <summary>
        /// Установить на договоре поле [Дата графика платежей] =Текущей датой + 1 день
        /// Задание 6 п.2 C-3
        /// </summary>
        public void SetPaymentplandateInAgreement()
        {
            nav_agreement nav_Agreement = new nav_agreement();
            nav_Agreement.Id = _agreementRef.Id;
            nav_Agreement.nav_paymentplandate = DateTime.Now.AddDays(1);

            _service.Update(nav_Agreement);
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
                throw new ArgumentNullException(nameof(agreement), "Agreement not found");
            }

            if (agreement.nav_creditamount == null)
            {
                throw new ArgumentNullException(nameof(agreement.nav_creditamount), "Creditamount not found");
            }

            if (agreement.nav_creditperiod == null)
            {
                throw new ArgumentNullException(nameof(agreement.nav_creditperiod), "Creditperiod not found");
            }

            if (agreement.nav_name == null)
            {
                throw new ArgumentNullException(nameof(agreement.nav_name), "Name not found");
            }

            int creditperiodInMonth = (int)agreement.nav_creditperiod * 12;
            decimal paymentInMonth = agreement.nav_creditamount.Value / creditperiodInMonth;

            DateTime now = DateTime.Now;
            DateTime firstPaymentDay = new DateTime(now.Year, now.Month + 1, 1);

            for (int i = 0; i < creditperiodInMonth; i++)
			{
                nav_invoice invoice = new nav_invoice()
                {
                    nav_name = agreement.nav_name 
                    + " " + firstPaymentDay.ToString("MMMM", new CultureInfo("ru-RU"))
                    + " " + firstPaymentDay.Year.ToString(),
                    nav_date = now,
                    nav_paydate = firstPaymentDay,
                    nav_dogovorid = _agreementRef,
                    nav_fact = false,
                    nav_type = nav_type.Avtomaticheskoe_sozdanie,
                    nav_amount = new Money(paymentInMonth)
                };

                _service.Create(invoice);
                firstPaymentDay = firstPaymentDay.AddMonths(1);
            }
        }
    }
}
