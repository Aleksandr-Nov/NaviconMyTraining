using Microsoft.Xrm.Sdk;
using Navicon.Plugins.Сommunication.Handlers;
using Navicon.Repository.Entities;
using System;

namespace Navicon.Plugins.Сommunication
{
    public class PreCommunicationCreate : BasePlugin, IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            var traceService = GetTrace(serviceProvider);
            try
            {
                var target = GetTarget<nav_communication>(serviceProvider);
                var service = GetService(serviceProvider);
                var communicationService = new CommunicationService(service);
                communicationService.CheckCommunication(target);
            }
            catch (Exception exc)
            {
                traceService.Trace(exc.ToString());
                throw new InvalidPluginExecutionException(exc.Message);
            }
        }
    }
}
