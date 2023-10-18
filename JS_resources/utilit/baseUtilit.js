var baseUtilit = (function () {
    return {
        getAttribute : function (attrName) {
            var attribute = Xrm.Page.getAttribute(attrName);
            if (!attribute) {
                alert("Attribute \"" + attrName + "\" not found");
            } else 
                return attribute;
        },

        getControl : function (controlName) {
            var control = Xrm.Page.getControl(controlName);
            if (!control) {
                alert("Control \"" + attrName + "\" not found");
            } else 
                return control;
        },
    }
})();