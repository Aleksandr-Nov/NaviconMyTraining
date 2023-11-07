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
            _service = service ?? throw new ArgumentNullException(nameof(service));
        }

        /// <summary>
        /// Проверяет заполненность поля 
        /// Тип Счета. Если [Тип счета] не задан, устанавливать значение Тип счета = [Вручную].
        /// Задание 5 п.1
        /// </summary>
        /// <param name="target">Используется для установки значения поля [Тип счета]</param>
        public void SetEmptyInvoiceType(nav_invoice target)
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
        /// <param name="target">Используется для проверки наличия договора и для передачи в другие методы</param>
        /// <param name="preTarget">В том случае если метод вызывается на плагине Update объект заполняетя данными до обновления</param>
        public void RecalculateTotalAmount(nav_invoice target, nav_invoice preTarget = null)
        {
            if (target == null)
            {
                throw new ArgumentNullException(nameof(target), "Обьект target отсутствует");
            }

            if (preTarget != null)
            {
                ActionWhenUpdate(target, preTarget);
            }

            if (target.nav_dogovorid == null)
            {
                return;
            }

            var agreement = AgreementAmountOperation(target);
            CheckTotalSum(target, agreement);          
        }

        /// <summary>
        /// Пересчитывает поле [Оплаченная Сумма] в объекте Договор при удалении счета со статусом оплачено.
        /// Задание 5 п.3
        /// </summary>
        /// <param name="preImage">Объект содержащий данные до удаления объекта.</param>
        public void WithdrawTotalAmount(nav_invoice preImage)
        {
            if (preImage == null)
            {
                throw new ArgumentNullException(nameof(preImage), "Обьект preImage отсутствует");
            }

            if (preImage.Id == Guid.Empty)
            {
                throw new ArgumentNullException(nameof(preImage.Id), "Обьект preImage.Id отсутствует");
            }

            if (preImage.nav_fact == true)
            {
                AgreementAmountOperation(preImage, false);
            }
        }

        /// <summary>
        /// Пересчитывает поле [Оплаченная Сумма] в объекте Договор при создании счета со статусом оплачено.
        /// Задание 5 п.3
        /// </summary>
        /// <param name="invoice">Используется для получение объекта [Договор] и записи суммы счета</param>
        /// <param name="isAddition">True = Пополнение счета. False = Списание со счета (при удалении счета)</param>
        /// <returns>Объект типа nav_agreement с рассчитанным полем [Оплаченная Сумма]</returns>
        public nav_agreement AgreementAmountOperation(nav_invoice invoice, bool isAddition = true)
        {
            if (invoice?.nav_dogovorid == null || invoice.nav_amount == null)
            {
                return new nav_agreement();
            }
            
            if (invoice.nav_dogovorid.Id == Guid.Empty || invoice.nav_amount == null)
            {
                return new nav_agreement();
            }
            
            var agreementQuery = _service.Retrieve(
                nav_agreement.EntityLogicalName,
                invoice.nav_dogovorid.Id,
                new ColumnSet(
                    nav_agreement.Fields.nav_factsumma));

            if (agreementQuery == null)
            {
                throw new ArgumentNullException(nameof(agreementQuery), "Обьект agreement отсутствует");
            }

            var agreement = agreementQuery.ToEntity<nav_agreement>();

            if (agreement.nav_factsumma == null)
            {
                agreement.nav_factsumma = invoice.nav_amount;
            }
            else
            {
                var navAmount = invoice.nav_amount.Value;
                if (!isAddition)
                {
                    navAmount *= -1;
                }

                agreement.nav_factsumma.Value += navAmount;
            }

            _service.Update(agreement);
            return agreement;
        }

        /// <summary>
        /// Если значение в поле оплаченная сумма равна значению в поле Сумма на договоре – автоматически проставлять значение = Да в поле оплачен.
        /// Если сохранение успешно, проставлять в поле Дата Оплаты текущую дату.
        /// Задание 5 п.5
        /// Задание 5 п.4.2
        /// </summary>
        /// <param name="target">Используется для проверки наличия значение в поле  [nav_paydate] и его обновления</param>
        /// <param name="agreement">Объект типа nav_agreement с заполненными полями nav_factsumma и nav_summa</param>
        public void CheckTotalSum (nav_invoice target, nav_agreement agreement)
        {
            if (agreement?.nav_factsumma == null || agreement.nav_summa == null)
            {
                return;
            }

            if (agreement.nav_factsumma.Value > agreement.nav_summa.Value)
            {
                throw new Exception("Сумма всех оплаченных счетов превышает общую сумму договора");
            }

            if (agreement.nav_factsumma.Value == agreement.nav_summa.Value)
            {
                var agreementUpdate = new nav_agreement()
                {
                    Id = agreement.Id,
                    nav_fact = true
                };
                _service.Update(agreementUpdate);
            }

            if (target?.nav_paydate != null)
            {
                target.nav_paydate = DateTime.Now;
            }
        }

        /// <summary>
        /// Заполнение полей при операции Update
        /// </summary>
        /// <param name="target">Объект типа nav_invoice для заполнения полей нужными данными</param>
        /// <param name="oldTarget">Данные до вызова плагина</param>
        public void ActionWhenUpdate(nav_invoice target, nav_invoice oldTarget)
        {
            if (target.nav_dogovorid == null)
            {
                target.nav_dogovorid = oldTarget.nav_dogovorid;
            }

            if (target.nav_amount == null)
            {
                target.nav_amount = oldTarget.nav_amount;
            }

            if (target.nav_paydate == null)
            {
                target.nav_paydate = oldTarget.nav_paydate;
            }
        }
    }
}
