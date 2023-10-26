using Microsoft.Xrm.Sdk;
using Navicon.Plugins.Invoices.Handlers;
using Navicon.Repository.Entities;
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
                InvoiceService invoiceService = new InvoiceService(GetService(serviceProvider));
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
