using Microsoft.Xrm.Sdk;
using Navicon.Plugins.Agreement.Handlers;
using Navicon.Repository.Entities;
using System;

namespace Navicon.Plugins.Agreement
{
    public class PreAgreementCreate : BasePlugin , IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            var traceService = GetTrace(serviceProvider);
            try
            {
                AgreementService agreementService = new AgreementService(GetService(serviceProvider));
                agreementService.AutoSetDate(GetTarget<nav_agreement>(serviceProvider));
            }
            catch (Exception exc)
            {
                traceService.Trace(exc.ToString());
                throw new InvalidPluginExecutionException(exc.Message);
            }
        }
    }
}
