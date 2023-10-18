var Navicon = Navicon || {};

Navicon.nav_communication = (function () {
   const communicationType = {
      phone: 1,
      email: 2,
   };

   const FormType = {
      Undefined: 0,
      Create: 1,
      Update: 2,
      ReadOnly: 3,
      Disabled: 4,
      BulkEdit: 6,
   };

   var changeType = function (context) {
      var phoneAttr = baseUtils.getAttribute("nav_phone");
      var emailAttr = baseUtils.getAttribute("nav_email");
      var phoneControl = baseUtils.getControl("nav_phone");
      var emailControl = baseUtils.getControl("nav_email");
      var typeAttr = baseUtils.getAttribute("nav_type");
      if (typeAttr) {
         var typeValue = typeAttr.getValue();
         if (typeValue) {
            switch (typeValue) {
               case communicationType.phone:
                  if (emailControl && emailAttr && phoneControl) {
                     emailControl.setVisible(false);
                     emailAttr.setValue(null);
                     phoneControl.setVisible(true);
                  }
                  break;

               case communicationType.email:
                  if (phoneControl && phoneAttr && emailControl) {
                     phoneControl.setVisible(false);
                     phoneAttr.setValue(null);
                     emailControl.setVisible(true);
                  }
                  break;

               default:
                  if (emailAttr && phoneAttr && phoneControl && emailControl) {
                     emailAttr.setValue(null);
                     phoneAttr.setValue(null);
                     phoneControl.setVisible(false);
                     emailControl.setVisible(false);
                  }
            }
         }
      }
   };

   var showType = function (context) {
      var formContext = context.getFormContext();

      var formType = formContext.ui.getFormType();
      if (formType == FormType.Create) {
         var phoneControl = baseUtils.getControl("nav_phone");
         if (phoneControl) phoneControl.setVisible(false);

         var emailControl = baseUtils.getControl("nav_email");
         if (emailControl) emailControl.setVisible(false);

         var typeAttr = baseUtils.getAttribute("nav_type");
         if (typeAttr) typeAttr.addOnChange(changeType);
      }
   };
   return {
      onLoad: function (context) {
         showType(context);
      },
   };
})();
