using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Navicon.Repository.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Navicon.Plugins.Agreement.Handlers
{
    public class AgreementService
    {
        private readonly IOrganizationService _service;

        public AgreementService(IOrganizationService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        /// <summary>
        /// Автоматическое заполнение поля [Дата первого договора] на объекте Контакт.
        /// Задание 5 п.2
        /// </summary>
        /// <param name="target">type nav_agreement</param>
        public void AutoSetDate(nav_agreement target)
        {
            if (target == null)
            {
                throw new ArgumentNullException(nameof(target), "Target not found");
            }

            if(IsFirstAgreement(target.nav_contact.Id))
            {
                SetFirstDateAgreement(target.nav_contact.Id, target.nav_date);
            }
            
        }

        /// <summary>
        /// Проверка существует ли у клиента договор.
        /// </summary>
        /// <param name="contactId">type Guid</param>
        /// <returns>bool</returns>
        public bool IsFirstAgreement(Guid contactId)
        {
            if (contactId == Guid.Empty)
            {
                throw new ArgumentNullException(nameof(contactId), "ContactId not found");
            }

            QueryExpression query = new QueryExpression(nav_agreement.EntityLogicalName);
            query.NoLock = true;
            query.TopCount = 1;
            query.Criteria.AddCondition(nav_agreement.Fields.nav_contact, ConditionOperator.Equal, contactId);
            var agreement = _service.RetrieveMultiple(query);
            
            return agreement.Entities.Count() == 0;
        }

        /// <summary>
        /// Установка даты на обьекте Контакт.
        /// </summary>
        /// <param name="contactId">type Guid</param>
        /// <param name="agreementDate">type DateTime?</param>
        public void SetFirstDateAgreement(Guid contactId, DateTime? agreementDate)
        {
            if (contactId == Guid.Empty)
            {
                throw new ArgumentNullException(nameof(contactId), "ContactId not found");
            }

            if (agreementDate == null)
            {
                throw new ArgumentNullException(nameof(agreementDate), "AgreementDate not found");
            }

            var contact = _service.Retrieve(Contact.EntityLogicalName, contactId, new ColumnSet(false));
            if (contact == null)
            {
                throw new ArgumentNullException(nameof(contact), "Contact not found");
            }

            Contact contactToUpdate = new Contact();
            contactToUpdate.Id = contact.Id;
            contactToUpdate.nav_date = agreementDate;

            _service.Update(contactToUpdate);
        }
    }
}
