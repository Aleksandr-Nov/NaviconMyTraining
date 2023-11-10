using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Workflow;
using System;
using System.Activities;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Navicon.Workflows
{
    public class BaseWorkflow : CodeActivity
    {
        protected override void Execute(CodeActivityContext context)
        {
            throw new NotImplementedException();
        }
        public IOrganizationService GetService(CodeActivityContext context)
        {
            var serviceFactory = context.GetExtension<IOrganizationServiceFactory>();
            var service = serviceFactory.CreateOrganizationService(Guid.Empty);
            if (service != null && service is IOrganizationService)
            {
                return service;
            }

            throw new Exception("Service не найден");
        }

        public IWorkflowContext GetWfContext(CodeActivityContext context)
        {
            return context.GetExtension<IWorkflowContext>(); ;
        }
    }
}
