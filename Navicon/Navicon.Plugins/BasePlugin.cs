using Microsoft.Xrm.Sdk;
using System;

namespace Navicon.Plugins
{
    public class BasePlugin
    {
        /// <summary>
        /// Ведение журнала трассировки. Извлекает службу трассировки для использования при отладке изолированных плагинов.
        /// </summary>
        /// <param name="serviceProvider">Объект получаемый при вызове плагина</param>
        public ITracingService GetTrace(IServiceProvider serviceProvider)
        {
            return (ITracingService)serviceProvider.GetService(typeof(ITracingService));
        }

        /// <summary>
        /// Определяет контекстную информацию, передаваемую подключаемому модулю во время выполнения.
        /// </summary>
        /// <param name="serviceProvider">Объект получаемый при вызове плагина</param>
        /// <returns>Объект приведенный к типу Entity с информацией переданой плагину при его вызове</returns>
        public T GetTarget<T>(IServiceProvider serviceProvider) where T : Entity
        {
            var pluginContext = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            if (!pluginContext.InputParameters.Contains("Target"))
            {
                throw new Exception("Обьект target отсутствует");
            }
            
            var targetEntity = (Entity)pluginContext.InputParameters["Target"];
            return targetEntity.ToEntity<T>();

        }

        /// <summary>
        /// Определяет контекстную информацию, передаваемую подключаемому модулю во время выполнения.
        /// </summary>
        /// <param name="serviceProvider">Объект получаемый при вызове плагина</param>
        /// <returns>Объект приведенный к типу Entity с информацией переданой плагину при его вызове. До изменения полей.</returns>
        public T GetPreEntity<T>(IServiceProvider serviceProvider) where T : Entity
        {
            var pluginContext = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            if (!pluginContext.PreEntityImages.Contains("PreEntityImage"))
            {
                throw new Exception("Обьект PreEntityImage отсутствует");
            }
            
            var preImages = (Entity)pluginContext.PreEntityImages["PreEntityImage"];
            return preImages.ToEntity<T>();

        }

        /// <summary>
        /// Получение объекта Service для доступа к бд.
        /// </summary>
        /// <param name="serviceProvider">Объект получаемый при вызове плагина</param>
        /// <returns>Возвращает экземпляр IOrganizationService для организации, членом которой является указанный пользователь.</returns>
        public IOrganizationService GetService(IServiceProvider serviceProvider)
        {
            var serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            var service = serviceFactory.CreateOrganizationService(Guid.Empty);
            if(service != null && service is IOrganizationService)
            {
                return service;
            }
                    
            throw new Exception("Service not found");  
        }
    }
}
