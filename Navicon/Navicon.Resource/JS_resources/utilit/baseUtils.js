var baseUtils = (function () {
    return {
        getAttribute: function (attrName) {
            var attribute = Xrm.Page.getAttribute(attrName);
            if (!attribute) {
                alert('Атрибут "' + attrName + '" не найден');
            } else {
                return attribute;
            }
        },

        getControl: function (controlName) {
            var control = Xrm.Page.getControl(controlName);
            if (!control) {
                alert('Контроллер "' + attrName + '" не найден');
            } else {
                return control;
            }
        },
    };
})();
