using Microsoft.Xrm.Sdk;
using System;

namespace Navicon.Plugins
{
    public class BasePlugin
    {
        public ITracingService GetTrace(IServiceProvider serviceProvider)
        {
            return (ITracingService)serviceProvider.GetService(typeof(ITracingService));
        }

        public T GetTarget<T>(IServiceProvider serviceProvider) where T : Entity
        {
            var pluginContext = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            if (pluginContext.InputParameters.Contains("Target"))
            {
                var targetEntity = (Entity)pluginContext.InputParameters["Target"];
                return targetEntity.ToEntity<T>();
            }

            throw new Exception("Обьект target отсутствует");
        }

        public T GetPreEntity<T>(IServiceProvider serviceProvider) where T : Entity
        {
            var pluginContext = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            if (pluginContext.PreEntityImages.Contains("PreEntityImage"))
            {
                var preImages = (Entity)pluginContext.PreEntityImages["PreEntityImage"];
                return preImages.ToEntity<T>();
            }

            throw new Exception("Обьект PreEntityImage отсутствует");
        }

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

        public IPluginExecutionContext GetContext(IServiceProvider serviceProvider)
        {
            return (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
        }
    }
}
