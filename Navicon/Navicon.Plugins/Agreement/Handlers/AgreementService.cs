using Microsoft.Xrm.Sdk;
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

            using(CrmServiceContext dbContext = new CrmServiceContext(_service))
            {
                var agreement = dbContext.nav_agreementSet.FirstOrDefault(x => x.nav_contact.Id == contactId);
                return agreement == null;
            }
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

            using (CrmServiceContext dbContext = new CrmServiceContext(_service))
            {
                var contact = dbContext.ContactSet.FirstOrDefault(x => x.Id == contactId); 
                if (contact == null) 
                {
                    throw new ArgumentNullException(nameof(contact), "Contact not found");
                }
                
                contact.nav_date = agreementDate;    
                dbContext.UpdateObject(contact);
                dbContext.SaveChanges();
            }
        }
    }
}
