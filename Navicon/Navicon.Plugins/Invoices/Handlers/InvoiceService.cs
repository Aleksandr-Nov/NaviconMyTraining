using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Navicon.Repository.Entities;
using System;

namespace Navicon.Plugins.Invoices.Handlers
{
    public class InvoiceService
    {
        private readonly IOrganizationService _service;

        public InvoiceService(IOrganizationService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        /// <summary>
        /// Проверяет заполненность поля 
        /// Тип Счета. Если [Тип счета] не задан, устанавливать значение Тип счета = [Вручную].
        /// Задание 5 п.1
        /// </summary>
        public void CheckInvoiceType(nav_invoice target)
        {        
            if (target == null)
            {
                throw new ArgumentNullException(nameof(target), "Обьект target отсутствует");
            }

            if (target.nav_type == null)
            {
                target.nav_type = nav_type.Ruchnoe_sozdanie; 
            }
        }

        /// <summary>
        /// Пересчитывает поле [Оплаченная Сумма] в объекте Договор при создании счета со статусом оплачено.
        /// Если сохранение успешно, проставлять в поле Дата Оплаты текущую дату.
        /// Задание 5 п.3
        /// </summary>
        /// <param name="thisUpdate">true при опреации update</param>
        public void RecalculateTotalAmount(nav_invoice target, bool thisUpdate = false)
        {
            if (target == null)
            {
                throw new ArgumentNullException(nameof(target), "Обьект target отсутствует");
            }

            if (thisUpdate)
            {
                ActionWhenUpdate(target);
            }

            if (target.nav_dogovorid == null)
            {
                throw new ArgumentNullException(nameof(target.nav_dogovorid), "Обьект target.nav_dogovorid отсутствует");
            }

            var agreement = AgreementAmountOperation(target);
            CheckTotalSum(target, agreement);          
        }

        /// <summary>
        /// Пересчитывает поле [Оплаченная Сумма] в объекте Договор при удалении счета со статусом оплачено.
        /// Задание 5 п.3
        /// </summary>
        public void WithdrawTotalAmount(IPluginExecutionContext context)
        {
            if (context == null)
            {
                throw new ArgumentNullException(nameof(context), "Обьект context отсутствует");
            }

            if (context.PrimaryEntityId == null)
            {
                throw new ArgumentNullException(nameof(context.PrimaryEntityId), "Обьект context.PrimaryEntityId отсутствует");
            }

            var invoice = _service.Retrieve(
                nav_invoice.EntityLogicalName,
                context.PrimaryEntityId,
                new ColumnSet(
                    nav_invoice.Fields.nav_dogovorid,
                    nav_invoice.Fields.nav_amount,
                    nav_invoice.Fields.nav_fact))
                .ToEntity<nav_invoice>();

            if (invoice.nav_fact == true)
            {
                var agreement = new nav_agreement();
                AgreementAmountOperation(invoice, false);
            }
        }

        /// <summary>
        /// Пересчитывает поле [Оплаченная Сумма] в объекте Договор при создании счета со статусом оплачено.
        /// Задание 5 п.3
        /// </summary>
        /// <param name="isAddition">True = Пополнение счета. False = Списание со счета (при удалении счета)</param>
        public nav_agreement AgreementAmountOperation(nav_invoice invoice, bool isAddition = true)
        {
            var agreement = _service.Retrieve(
                nav_agreement.EntityLogicalName,
                invoice.nav_dogovorid.Id,
                new ColumnSet(
                    nav_agreement.Fields.nav_factsumma,
                    nav_agreement.Fields.nav_summa))
                .ToEntity<nav_agreement>();

            if (agreement == null)
            {
                throw new ArgumentNullException(nameof(agreement), "Обьект agreement отсутствует");
            }

            if (agreement.nav_factsumma == null)
            {
                agreement.nav_factsumma = new Money(0);
            }

            if (!isAddition)
            {
                invoice.nav_amount.Value = invoice.nav_amount.Value * -1;
            }

            agreement.nav_factsumma = new Money(invoice.nav_amount.Value + agreement.nav_factsumma.Value);
            _service.Update(agreement);
            return agreement;
        }

        /// <summary>
        /// Если значение в поле оплаченная сумма равна значению в поле Сумма на договоре – автоматически проставлять значение = Да в поле оплачен.
        /// Если сохранение успешно, проставлять в поле Дата Оплаты текущую дату.
        /// Задание 5 п.5
        /// Задание 5 п.4.2
        /// </summary>
        public void CheckTotalSum (nav_invoice target, nav_agreement agreement)
        {
            if (agreement == null)
            {
                throw new ArgumentNullException(nameof(agreement), "Обьект agreement отсутствует");
            }

            if (agreement.nav_factsumma == null || agreement.nav_summa == null)
            {
                throw new ArgumentNullException("Обьект agreement.nav_factsumma или agreement.nav_summa отсутствует");
            }

            if (agreement.nav_factsumma.Value > agreement.nav_summa.Value)
            {
                throw new Exception("Сумма всех оплаченных счетов превышает общую сумму договора");
            }

            if (agreement.nav_factsumma.Value == agreement.nav_summa.Value)
            {
                agreement.nav_fact = true;
                _service.Update(agreement);
            }

            target.nav_paydate = DateTime.Now;
        }

        /// <summary>
        /// ЗАполнение полей при операции Update
        /// </summary>
        public void ActionWhenUpdate(nav_invoice target)
        {
            var OldTarget = _service.Retrieve(
                nav_invoice.EntityLogicalName,
                target.Id,
                new ColumnSet(
                    nav_invoice.Fields.nav_dogovorid,
                    nav_invoice.Fields.nav_amount,
                    nav_invoice.Fields.nav_paydate))
                .ToEntity<nav_invoice>();
            if (target.nav_dogovorid == null)
            {
                target.nav_dogovorid = OldTarget.nav_dogovorid;
            }

            if (target.nav_amount == null)
            {
                target.nav_amount = OldTarget.nav_amount;
            }

            if (target.nav_paydate == null)
            {
                target.nav_paydate = OldTarget.nav_paydate;
            }
        }
    }
}
