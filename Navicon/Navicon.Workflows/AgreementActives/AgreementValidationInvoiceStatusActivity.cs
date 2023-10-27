using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Workflow;
using Navicon.Workflows.AgreementActives.Handlers;
using System;
using System.Activities;


namespace Navicon.Workflows.AgreementActives
{
    public class AgreementValidationInvoiceStatusActivity : BaseWorkflow
    {
        [Input("nav_agreement")]
        [RequiredArgument]
        [ReferenceTarget("nav_agreement")]
        public InArgument<EntityReference> AgreementReference { get; set; }

        [Output("Invoice status")]
        public OutArgument<bool> IsValid { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var agreementRef = AgreementReference.Get(context);
                AgreementService agreementService = new AgreementService(GetService(context), agreementRef);
                if (agreementRef == null || agreementRef.Id == null)
                {
                    throw new ArgumentNullException(nameof(agreementRef), "Agreement not found");
                }

                IsValid.Set(context, agreementService.CheckLinkedInvoice(true));
            }
            catch (Exception exc)
            {
                throw new Exception(exc.Message);
            }

        }
    }
}
