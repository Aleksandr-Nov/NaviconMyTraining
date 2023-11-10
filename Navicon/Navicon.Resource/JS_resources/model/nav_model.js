var Navicon = Navicon || {};

Navicon.nav_model = (function () {

    const FormType = {
        Undefined: 0,
        Create: 1,
        Update: 2,
        ReadOnly: 3,
        Disabled: 4,
        BulkEdit: 6,
    };

    /**
     * Задание №3 ч.2 п.1
     * @return {boolean} true, если пользователь Cистемный администратор.
    */
    var visibleSettings = function (context) {
        var formContext = context.getFormContext();
        if (!formContext) {
            return;
        }

        var formType = formContext.ui.getFormType();
        if (!formType) {
            return;
        }

        if (formType != FormType.Create) {
            var formControls = formContext.getControl();
            var roles = Xrm.Utility.getGlobalContext().userSettings.roles;
            if (!formControls || !roles || roles.length == 0) {
                return;
            }

            if (checkUserRoles(roles)) {
                formControls.forEach((control) => {
                    control.setDisabled(true);
                });
            }
        } 
    };

    var checkUserRoles = function (roles) {
        if (roles == null || roles.length == 0) {
            return true;
        }
        var result = true;
        roles.forEach(x => {
            if (x.name == "Системный администратор") {
                result = false;
            }
        });
        return result;
    };

    return {
        onLoad: function (context) {
            visibleSettings(context);
        },
    };
})();
