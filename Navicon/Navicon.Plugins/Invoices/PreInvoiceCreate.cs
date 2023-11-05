using Microsoft.Xrm.Sdk;
using Navicon.Plugins.Invoices.Handlers;
using Navicon.Repository.Entities;
using System;

namespace Navicon.Plugins.Invoices
{
    public class PreInvoiceCreate : BasePlugin, IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            var traceService = GetTrace(serviceProvider);
            try
            {
                var target = GetTarget<nav_invoice>(serviceProvider);
                var service = GetService(serviceProvider);
                var invoiceService = new InvoiceService(service);
                invoiceService.CheckInvoiceType(target);

                if (target.nav_fact == true && target.nav_amount != null)
                {
                    invoiceService.RecalculateTotalAmount(target);
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
