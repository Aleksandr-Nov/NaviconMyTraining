using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Navicon.Repository.Entities;
using System;

namespace Navicon.Plugins.Сommunication.Handlers
{
    public class CommunicationService
    {
        private readonly IOrganizationService _service;

        public CommunicationService(IOrganizationService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
        }

        /// <summary>
        /// Проверяет что обьект средства связи с типом [Основной] является единственным для контакта
        /// Задание 5 п.6
        /// </summary>
        /// <param name="target">Объект типа nav_communication</param>
        public void CheckCommunication(nav_communication target)
        {
            if (target == null)
            {
                throw new ArgumentNullException(nameof(target), "Обьект target отсутствует");
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
        /// <param name="target">Объект типа nav_communication. Обязательные поля nav_type и nav_contactid</param>
        public void CheckMainCommunication(nav_communication target)
        {
            if (target?.nav_type == null || target.nav_contactid == null)
            {
                return;
            }

            var query = new QueryExpression(nav_communication.EntityLogicalName)
            {
                NoLock = true,
                TopCount = 1,
                Criteria =
                    {
                        Conditions =
                        {
                            new ConditionExpression(nav_communication.Fields.nav_contactid, ConditionOperator.Equal, target.nav_contactid.Id),
                            new ConditionExpression(nav_communication.Fields.nav_type, ConditionOperator.Equal, (int)target.nav_type.Value),
                            new ConditionExpression(nav_communication.Fields.nav_main, ConditionOperator.Equal, true)
                        }
                    }

            };

            var communication = _service.RetrieveMultiple(query).Entities;

            if (communication.Count > 0)
            {
                throw new Exception("Для этого контакта уже существует оснвное средство связи c типом: " +
                    Enum.GetName(typeof(nav_communication_type), target.nav_type));
            }          
        }
    }
}
