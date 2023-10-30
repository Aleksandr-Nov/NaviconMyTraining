using Microsoft.Xrm.Sdk;
using Navicon.Repository.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Navicon.Plugins.Сommunication.Handlers
{
    public class CommunicationService
    {
        private readonly IOrganizationService _service;

        public CommunicationService(IOrganizationService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        /// <summary>
        /// Проверяет что обьект средства связи с типом [Основной] является единственным для контакта
        /// Задание 5 п.6
        /// </summary>
        /// <param name="target">type Entity</param>
        public void CheckCommunication(nav_communication target)
        {
            if (target == null)
            {
                throw new ArgumentNullException(nameof(target), "Target not found");
            }

            if (target.nav_main == false)
            {
                return;
            }

            CheckMainCommunication(target);
        }

        /// <summary>
        /// Обращение к бд для поиска повторяющихся записей.
        /// Задание 5 п.6
        /// </summary>
        /// <param name="target">type Entity</param>
        public void CheckMainCommunication(nav_communication target)
        {
            if (target.nav_type == null)
            {
                throw new ArgumentNullException(nameof(target), "Укажите тип средства связи");
            }

            if (target.nav_contactid == null)
            {
                throw new ArgumentNullException(nameof(target), "Заполните поле Контакт");
            }

            using (CrmServiceContext dbContext = new CrmServiceContext(_service))
            {
                var Communication = dbContext.nav_communicationSet
                    .Where(x => x.nav_contactid == target.nav_contactid
                        && x.nav_type == target.nav_type
                        && x.nav_main == true).ToList(); 

                if(Communication.Count > 0)
                {
                    throw new Exception("Для этого контакта уже существует оснвное средство связи c типом: " +
                        Enum.GetName(typeof(nav_communication_type), target.nav_type));
                }
            }
        }
    }
}
