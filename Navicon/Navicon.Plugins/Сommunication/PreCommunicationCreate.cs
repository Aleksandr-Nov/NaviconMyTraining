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
                CommunicationService CommunicationService = new CommunicationService(GetService(serviceProvider));
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
