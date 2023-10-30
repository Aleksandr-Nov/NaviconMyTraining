using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Workflow;
using Navicon.Workflows.AgreementActives.Handlers;
using System;
using System.Activities;

namespace Navicon.Workflows.AgreementActives
{
    public class AgreementInvoiceActivity : BaseWorkflow
    {
        [Input("nav_agreement")]
        [RequiredArgument]
        [ReferenceTarget("nav_agreement")]
        public InArgument<EntityReference> AgreementReference { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var agreementRef = AgreementReference.Get(context);
                AgreementService agreementService = new AgreementService(GetService(context), agreementRef);

                agreementService.DeleteAutoInvoice();
                agreementService.CreatePaymentSchedule();
                agreementService.SetPaymentplandateInAgreement();

            }
            catch (Exception exc)
            {
                throw new Exception(exc.Message);
            }

        }
    }
}
