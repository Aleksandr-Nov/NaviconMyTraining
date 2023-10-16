var Navicon = Navicon || {};

Navicon.nav_auto  = (function()
{

    var usedOnChange = function(context)
    {
        try
        {
            let formContext = context.getFormContext();

            let usedAttr = formContext.getAttribute("nav_used");
            if( usedAttr == null || usedAttr == undefined )
                throw new Error('nav_used is null');

            let kmControl = formContext.getControl("nav_km");
            if( kmControl == null || kmControl == undefined )
                throw new Error('nav_km is null');

            let ownerscountControl = formContext.getControl("nav_ownerscount");
            if( ownerscountControl == null || ownerscountControl == undefined )
                throw new Error('nav_ownerscount is null');

            let isdamagedControl = formContext.getControl("nav_isdamaged");
            if( isdamagedControl == null || isdamagedControl == undefined )
                throw new Error('nav_isdamaged is null');
    
            if(usedAttr.getValue())
            {
                kmControl.setVisible(true)
                ownerscountControl.setVisible(true);
                isdamagedControl.setVisible(true);
            }
            else
            {
                kmControl.setVisible(false)
                ownerscountControl.setVisible(false);
                isdamagedControl.setVisible(false);
    
                formContext.getAttribute("nav_km").setValue(null);
                formContext.getAttribute("nav_ownerscount").setValue(null);
                formContext.getAttribute("nav_isdamaged").setValue(false);
            }
        }
        catch (e) {
            Xrm.Navigation.openErrorDialog({ errorCode:"NAV2023", details: e.message, message:"Ошибка при получении данных" }).then(
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
            
                let usedAttr = formContext.getAttribute("nav_used");
                if( usedAttr == null || usedAttr == undefined )
                    throw new Error('nav_used is null');

                usedAttr.addOnChange( usedOnChange );
                usedAttr.fireOnChange();
            }
            catch (e) {
                Xrm.Navigation.openErrorDialog({ errorCode:"NAV2023", details: e.message, message:"Ошибка при получении данных" }).then(
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