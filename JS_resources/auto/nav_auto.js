var Navicon = Navicon || {};

Navicon.nav_auto  = (function()
{

    var usedOnChange = function(context)
    {
        var usedAttr = baseUtilit.getAttribute("nav_used");
        if (usedAttr) {
            var used = usedAttr.getValue()
            var kmControl = baseUtilit.getControl("nav_km"); 
            if (kmControl)
                kmControl.setVisible(used)

            var ownerscountControl = baseUtilit.getControl("nav_ownerscount");
            if (ownerscountControl)
                ownerscountControl.setVisible(used);

            var isdamagedControl = baseUtilit.getControl("nav_isdamaged");
            if (isdamagedControl)
                isdamagedControl.setVisible(used);  
        }
    }
    return {
        onLoad : function (context) {
            var usedAttr = baseUtilit.getAttribute("nav_used");
            if (usedAttr) {
                usedAttr.addOnChange( usedOnChange );
                usedAttr.fireOnChange();
            }
        }
    }
})();