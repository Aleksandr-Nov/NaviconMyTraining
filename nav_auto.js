var Navicon = Navicon || {};

Navicon.nav_auto  = (function()
{

    var usedOnChange = function(context)
    {
        let formContext = context.getFormContext();

        let usedAttr = formContext.getAttribute("nav_used");
        if(!usedAttr)
            alert("nav_used is null");

        let kmControl = formContext.getControl("nav_km");
        if(!kmControl)
            alert("nav_km is null");

        let ownerscountControl = formContext.getControl("nav_ownerscount");
        if(!ownerscountControl)
            alert("nav_ownerscount is null");

        let isdamagedControl = formContext.getControl("nav_isdamaged");
        if(!isdamagedControl)
            alert("nav_isdamaged is null");

        let used = usedAttr.getValue()

        kmControl.setVisible(used)
        ownerscountControl.setVisible(used);
        isdamagedControl.setVisible(used);      
        if(!used)
        {
            formContext.getAttribute("nav_km").setValue(null);
            formContext.getAttribute("nav_ownerscount").setValue(null);
            formContext.getAttribute("nav_isdamaged").setValue(false);
        }
        
    }
    return {
        onLoad : function (context)
        {
            let formContext = context.getFormContext();
        
            let usedAttr = formContext.getAttribute("nav_used");
            if(!usedAttr)
                alert("nav_used is null");

            usedAttr.addOnChange( usedOnChange );
            usedAttr.fireOnChange();
        }
    }
})();