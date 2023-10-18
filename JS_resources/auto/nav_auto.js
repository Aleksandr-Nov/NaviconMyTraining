var Navicon = Navicon || {};

Navicon.nav_auto = (function () {
   var usedOnChange = function (context) {
      var usedAttr = baseUtils.getAttribute("nav_used");
      if (usedAttr) {
         var used = usedAttr.getValue();
         var kmControl = baseUtils.getControl("nav_km");
         if (kmControl) kmControl.setVisible(used);

         var ownerscountControl = baseUtils.getControl("nav_ownerscount");
         if (ownerscountControl) ownerscountControl.setVisible(used);

         var isdamagedControl = baseUtils.getControl("nav_isdamaged");
         if (isdamagedControl) isdamagedControl.setVisible(used);
      }
   };
   return {
      onLoad: function (context) {
         var usedAttr = baseUtils.getAttribute("nav_used");
         if (usedAttr) {
            usedAttr.addOnChange(usedOnChange);
            usedAttr.fireOnChange();
         }
      },
   };
})();
