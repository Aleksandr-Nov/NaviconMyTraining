using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
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

            QueryExpression query = new QueryExpression(nav_communication.EntityLogicalName);
            query.NoLock = true;
            query.TopCount = 1;
            query.Criteria.AddCondition(nav_communication.Fields.nav_contactid, ConditionOperator.Equal, target.nav_contactid.Id);
            query.Criteria.AddCondition(nav_communication.Fields.nav_type, ConditionOperator.Equal, (int)target.nav_type.Value);
            query.Criteria.AddCondition(nav_communication.Fields.nav_main, ConditionOperator.Equal, true);
            var Communication = _service.RetrieveMultiple(query);

            if (Communication.Entities.Count() > 0)
            {
                throw new Exception("Для этого контакта уже существует оснвное средство связи c типом: " +
                    Enum.GetName(typeof(nav_communication_type), target.nav_type));
            }          
        }
    }
}
