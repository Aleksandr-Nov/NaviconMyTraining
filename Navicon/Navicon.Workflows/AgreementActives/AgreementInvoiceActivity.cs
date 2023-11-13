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
        
        [Output("Invoice exist")]
        public OutArgument<bool> IsValid { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var agreementRef = AgreementReference.Get(context);
                if (agreementRef == null || agreementRef.Id == Guid.Empty)
                {
                    throw new ArgumentNullException(nameof(agreementRef), "AgreementRef (входящие значения бизнес процесса) не найден");
                }
                
                var service = GetService(context);
                var agreementService = new AgreementService(service, agreementRef);

                if (!agreementService.ExistLinkedInvoice(true))
                {
                    IsValid.Set(context, false);
                    return;
                }
                
                agreementService.DeleteAutoInvoice();
                agreementService.CreatePaymentSchedule();
                agreementService.SetPaymentPlanDateInAgreement();
                IsValid.Set(context, true);
            }
            catch (Exception exc)
            {
                throw new Exception(exc.Message);
            }

        }
    }
}
