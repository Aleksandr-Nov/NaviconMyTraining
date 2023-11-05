using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Navicon.Repository.Entities;
using System;

namespace Navicon.Plugins.Agreement.Handlers
{
    public class AgreementService
    {
        private readonly IOrganizationService _service;

        public AgreementService(IOrganizationService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
        }

        /// <summary>
        /// Автоматическое заполнение поля [Дата первого договора] на объекте Контакт.
        /// Задание 5 п.2
        /// </summary>
        /// <param name="target">Объект типа nav_agreement. Обязательные поля nav_contact.Id и nav_date</param>
        public void AutoSetDate(nav_agreement target)
        {
            if (target == null)
            {
                throw new ArgumentNullException(nameof(target), "Обьект target отсутствует");
            }

            if (target.nav_contact == null || target.nav_contact.Id == Guid.Empty || target.nav_date == null)
            {
                return;
            }

            if (IsFirstAgreement(target.nav_contact.Id))
            {
                SetFirstDateAgreement(target.nav_contact.Id, target.nav_date);
            }
            
        }

        /// <summary>
        /// Проверка существует ли у клиента договор.
        /// </summary>
        /// <param name="contactId">Id объекта Контакт для проверки наличия договора</param>
        /// <returns>True если у объекта Контакт нет связанных с ним договоров</returns>
        public bool IsFirstAgreement(Guid contactId)
        {
            if (contactId == Guid.Empty)
            {
                throw new ArgumentNullException(nameof(contactId), "Обьект contactId отсутствует");
            }

            var query = new QueryExpression(nav_agreement.EntityLogicalName)
            {
                NoLock = true,
                TopCount = 1,
                Criteria =
                {
                    Conditions =
                    {
                        new ConditionExpression(nav_agreement.Fields.nav_contact, ConditionOperator.Equal, contactId)
                    }
                }               
            };

            var agreements = _service.RetrieveMultiple(query).Entities;
            
            return agreements.Count == 0;
        }

        /// <summary>
        /// Установка даты на обьекте Контакт.
        /// </summary>
        /// <param name="contactId">Id объекта Контакт для установки даты</param>
        /// <param name="agreementDate">Дата договора</param>
        public void SetFirstDateAgreement(Guid contactId, DateTime? agreementDate)
        {
            if (contactId == Guid.Empty || agreementDate == null)
            {
                return ;
            }

            var contact = _service.Retrieve(Contact.EntityLogicalName, contactId, new ColumnSet(false));
            if (contact == null)
            {
                return;
            }

            var contactToUpdate = new Contact()
            {
                Id = contact.Id,
                nav_date = agreementDate
            };

            _service.Update(contactToUpdate);
        }
    }
}
