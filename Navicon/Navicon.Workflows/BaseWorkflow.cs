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
    public abstract class BaseWorkflow : CodeActivity
    {
        protected override void Execute(CodeActivityContext context)
        {
            throw new NotImplementedException();
        }
        
        /// <summary>
        /// Получение объекта service для связи с базой данных.
        /// Без указания системного пользователя для которого выполняются вызовы
        /// </summary>
        /// <param name="context">Объект приходящий при вызове бизнес процесса</param>
        protected IOrganizationService GetService(CodeActivityContext context)
        {
            var serviceFactory = context.GetExtension<IOrganizationServiceFactory>();
            var workflowContext = context.GetExtension<IWorkflowContext>();
            if (workflowContext == null || workflowContext.UserId == Guid.Empty)
            {
                throw new Exception("workflowContext не найден");
            }
            
            var service = serviceFactory.CreateOrganizationService(workflowContext.UserId);
            if (service != null)
            {
                return service;
            }

            throw new Exception("Service не найден");
        }
    }
}
