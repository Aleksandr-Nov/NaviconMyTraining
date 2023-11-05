using Microsoft.Xrm.Sdk;
using Navicon.Plugins.Invoices.Handlers;
using Navicon.Repository.Entities;
using System;

namespace Navicon.Plugins.Invoices
{
    public class PreInvoiceUpdate :BasePlugin , IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            var traceService = GetTrace(serviceProvider);
            try
            {
                var target = GetTarget<nav_invoice>(serviceProvider);
                var service = GetService(serviceProvider);
                var invoiceService = new InvoiceService(service);
                if (target.nav_fact == true)
                {
                    invoiceService.RecalculateTotalAmount(target, true);
                }
            }
            catch (Exception exc)
            {
                traceService.Trace(exc.ToString());
                throw new InvalidPluginExecutionException(exc.Message);
            }
        }
    }
}
