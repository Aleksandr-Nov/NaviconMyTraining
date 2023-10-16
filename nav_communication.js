var Navicon = Navicon || {};

Navicon.nav_communication  = (function()
{
    const communicationType = {
        phone : 1,
        email : 2 
    };

    const FormType = {
        Undefined : 0,
        Create : 1,
        Update : 2,
        ReadOnly : 3,
        Disabled: 4,
        BulkEdit : 6
    };

    var changeType = function(context)
    {
        try
        {
            let formContext = context.getFormContext();

            let typeAttr = formContext.getAttribute("nav_type");
            if( typeAttr == null || typeAttr == undefined )
                throw new Error('nav_type is null');

            let phoneAttr = formContext.getAttribute("nav_phone");
            if( phoneAttr == null || phoneAttr == undefined )
                throw new Error('nav_phone is null');

            let emailAttr = formContext.getAttribute("nav_email");
            if( emailAttr == null || emailAttr == undefined )
                throw new Error('nav_email is null');
    
            let phoneControl = formContext.getControl("nav_phone")
            if( phoneControl == null || phoneControl == undefined )
                throw new Error('nav_phone is null');

            let emailControl = formContext.getControl("nav_email")
            if( emailControl == null || emailControl == undefined )
                throw new Error('nav_email is null');
    
            let typeValue = typeAttr.getValue();

            switch(typeValue)
            {
                case communicationType.phone:
                    emailControl.setVisible(false);
                    emailAttr.setValue( null );
                    phoneControl.setVisible(true);
                    break;
    
                case communicationType.email:
                    phoneControl.setVisible(false);
                    phoneAttr.setValue( null );
                    emailControl.setVisible(true);
                    break;
    
                default:
                    emailAttr.setValue( null );
                    phoneAttr.setValue( null );
                    phoneControl.setVisible(false);
                    emailControl.setVisible(false);
            }
        }
        catch (e) {
            Xrm.Navigation.openErrorDialog({ errorCode:`NAV2023 ${e.message}`, details: e.message, message:"Ошибка при получении данных" }).then(
                function (success) {
                    formContext.ui.close();       
                },
                function (error) {
                    formContext.ui.close();  
                });
        }

    }
    return {
        onLoad : function (context)
        {
            try
            {
                let formContext = context.getFormContext();

                let formType = formContext.ui.getFormType();
    
                if(formType == FormType.Create)
                {                
                    let phoneControl = formContext.getControl("nav_phone")
                    if( phoneControl == null || phoneControl == undefined )
                        throw new Error('nav_phone is null');

                    let emailControl = formContext.getControl("nav_email")
                    if( emailControl == null || emailControl == undefined )
                        throw new Error('nav_email is null');
    
                    phoneControl.setVisible(false);
                    emailControl.setVisible(false);
    
                    let typeAttr = formContext.getAttribute("nav_type");
                    if( typeAttr == null || typeAttr == undefined )
                        throw new Error('nav_type is null');
                        
                    typeAttr.addOnChange( changeType );
    
                }
            }
            catch (e) {
                Xrm.Navigation.openErrorDialog({ errorCode:`NAV2023 ${e.message}`, details: e.message, message:"Ошибка при получении данных" }).then(
                    function (success) {
                        formContext.ui.close();       
                    },
                    function (error) {
                        formContext.ui.close();  
                    });
            }

        }
    }
})();