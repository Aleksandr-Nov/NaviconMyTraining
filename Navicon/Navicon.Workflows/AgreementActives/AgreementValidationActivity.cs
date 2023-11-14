using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Workflow;
using Navicon.Workflows.AgreementActives.Handlers;
using System;
using System.Activities;


namespace Navicon.Workflows.AgreementActives
{
    public class AgreementValidationActivity : BaseWorkflow
    {
        [Input("nav_agreement")]
        [RequiredArgument]
        [ReferenceTarget("nav_agreement")]
        public InArgument<EntityReference> AgreementReference { get; set; }

        [Output("Invoice exist")]
        public OutArgument<bool> IsValid { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var agreementRef = AgreementReference.Get(context);
            if (agreementRef == null || agreementRef.Id == Guid.Empty)
            {
                throw new ArgumentNullException(nameof(agreementRef), "AgreementRef (входящие значения бизнес процесса) не найден");
            }
            
            var service = GetService(context);
            var agreementService = new AgreementService(service, agreementRef);
            IsValid.Set(context, agreementService.ExistLinkedInvoice());
        }
    }
}
