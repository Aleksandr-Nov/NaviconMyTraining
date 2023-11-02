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
                var service = GetService(serviceProvider);
                CommunicationService CommunicationService = new CommunicationService(service);
                CommunicationService.CheckCommunication(GetTarget<nav_communication>(serviceProvider));
            }
            catch (Exception exc)
            {
                traceService.Trace(exc.ToString());
                throw new InvalidPluginExecutionException(exc.Message);
            }
        }
    }
}
