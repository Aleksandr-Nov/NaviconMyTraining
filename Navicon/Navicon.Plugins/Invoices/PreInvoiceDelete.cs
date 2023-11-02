using Microsoft.Xrm.Sdk;
using Navicon.Plugins.Invoices.Handlers;
using System;

namespace Navicon.Plugins.Invoices
{
    public class PreInvoiceDelete : BasePlugin , IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            var traceService = GetTrace(serviceProvider);
            try
            {
                var service = GetService(serviceProvider);
                InvoiceService invoiceService = new InvoiceService(service);
                invoiceService.WithdrawTotalAmount(GetContext(serviceProvider));              
            }
            catch (Exception exc)
            {
                traceService.Trace(exc.ToString());
                throw new InvalidPluginExecutionException(exc.Message);
            }
        }
    }
}
