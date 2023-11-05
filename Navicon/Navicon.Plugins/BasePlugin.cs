﻿using Microsoft.Xrm.Sdk;
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
            if (!pluginContext.InputParameters.Contains("Target"))
            {
                throw new Exception("Обьект target отсутствует");
            }
            
            var targetEntity = (Entity)pluginContext.InputParameters["Target"];
            return targetEntity.ToEntity<T>();

        }

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
