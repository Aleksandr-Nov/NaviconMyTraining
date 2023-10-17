var Navicon = Navicon || {};

Navicon.nav_agreement  = (function()
{

    const FormType = {
        Undefined : 0,
        Create : 1,
        Update : 2,
        ReadOnly : 3,
        Disabled: 4,
        BulkEdit : 6
    };

    var contactOrAutoOnChange = function(context)
    {
        let formContext = context.getFormContext();

        let autoAttr = formContext.getAttribute("nav_autoid");
        if(!autoAttr)
        alert("nav_autoid is null");

        let contactAttr = formContext.getAttribute("nav_contact");
        if(!contactAttr)
        alert("nav_contact is null");

        let creditidAttr = formContext.getAttribute("nav_creditid")
        if(!creditidAttr)
        alert("nav_creditid is null");

        let creditidControl = formContext.getControl("nav_creditid")
        if(!creditidControl)
            alert("nav_creditid is null");

        if(autoAttr.getValue() != null)
        {
            setFieldSumma(context);
        }

        if(autoAttr.getValue() != null && contactAttr.getValue() != null)
        {
            creditidControl.setVisible(true);

            creditPreSearch(context);
        }
        else  
        {
            creditidControl.setVisible(false);
            creditidAttr.setValue(null);
            creditidAttr.fireOnChange();
        }
    };

    var setFieldSumma = function(context)
    {
        let formContext = context.getFormContext();

        let autoAttr = formContext.getAttribute("nav_autoid");
        if(!autoAttr)
            alert("nav_autoid is null");

        let summaAttr = formContext.getAttribute("nav_summa");
        if(!summaAttr)
            alert("nav_summa is null");

        let autoid = autoAttr.getValue()[0].id;
        autoid = autoid.replace(/[{}]/g,"");

        let promiseAuto = Xrm.WebApi.retrieveRecord("nav_auto", `${autoid}`, "?$select=nav_used");
        promiseAuto.then(
            function success(result) {
                console.log("nav_used",result.nav_used)
                return result.nav_used;
            },
            function(error){
                console.error(error.message);
            }
        ).then(
            function success(used) {
                if(used)
                {
                    let promiseAutoSumm = Xrm.WebApi.retrieveRecord("nav_auto", `${autoid}`, "?$select=nav_amount");
                    promiseAutoSumm.then(
                        function success(result) {
                            if(result.nav_amount)
                            {
                                summaAttr.setValue(result.nav_amount)
                            }
                        },
                        function(error){
                            console.error(error.message);
                        }
                    );
                }
                else
                {
                    let fetchXml = 
                        `<fetch no-lock="true">
                            <entity name="nav_auto">
                                <filter>
                                    <condition attribute="nav_autoid" operator="eq" value=`+autoid+`/>
                                </filter>
                                <link-entity name="nav_model" from="nav_modelid" to="nav_modelid" link-type="inner" alias="model">
                                    <attribute name="nav_recommendedamount" />
                                </link-entity>
                            </entity>
                        </fetch>`;

                    let promiseAutoSumm = Xrm.WebApi.retrieveRecord("nav_auto", fetchXml);
                    promiseAutoSumm.then(
                        function success(result) {
                            console.log("result",result);
                            if(result.nav_recommendedamount)
                            {
                                summaAttr.setValue(result.nav_recommendedamount)
                            }
                        },
                        function(error){
                            console.error(error.message);
                        }
                    );
                }
            },
            function(error){
                console.error(error.message);
            }
        );
    }

    var creditPreSearch = function(context)
    {
        let formContext = context.getFormContext();

        let autoAttr = formContext.getAttribute("nav_autoid");
        if(!autoAttr)
            alert("nav_autoid is null");

        let creditidControl = formContext.getControl("nav_creditid")
        if(!creditidControl)
            alert("nav_creditid is null");

        let auto = autoAttr.getValue()[0]

        let autoId = auto.id.replace(/[{}]/g,"");
        let fetchXml = `?fetchXml=
            <fetch>
                <entity name="nav_credit">
                <attribute name="nav_name" />
                <attribute name="nav_creditid" />
                <link-entity name="nav_nav_credit_nav_auto" from="nav_creditid" to="nav_creditid" intersect="true">
                    <filter>
                    <condition attribute="nav_autoid" operator="eq" value="` + autoId + `" uitype="nav_nav_credit_nav_auto" />
                    </filter>
                </link-entity>
                </entity>
            </fetch>`

        let creditFilter = "";
        Xrm.WebApi.retrieveMultipleRecords("nav_credit", fetchXml).then(
            function success(result) {
                creditFilter = "";
                for (var i = 0; i < result.entities.length; i++) {
                    creditFilter += `<value>${result.entities[i].nav_creditid}</value>`
                }         
            },
            function (error) {
                console.log(error.message);
            }
        );
        creditidControl.addPreSearch(function () { myPreSearchCallBack(creditFilter); });
    }

    var myPreSearchCallBack =  function(creditFilter){
            fetchXml = "<filter type='and'>" +
                            "<condition attribute='nav_creditid' operator='in'>" +
                                creditFilter +
                            "</condition>" +
                        "</filter>";
            Xrm.Page.getControl("nav_creditid").addCustomFilter(fetchXml);
     }

    var creditOnChange = function(context)
    {
        let formContext = context.getFormContext();

        let creditAttr = formContext.getAttribute("nav_creditid");
        if(!creditAttr)
            alert("nav_creditid is null");

        let summaControl = formContext.getControl("nav_summa")
        if(!summaControl)
            alert("nav_summa is null");

        let dateAttr = formContext.getAttribute("nav_date");
        if(!dateAttr)
            alert("nav_date is null");

        if(creditAttr.getValue() != null)
        {
            formContext.ui.tabs.get("tab_2").setVisible(true);
            summaControl.setVisible(true);

            if(dateAttr.getValue() != null)
            {
                checkCreditValidity(context);
            }

            insertCreditperiod(context);
        }
        else  
        {
            formContext.ui.tabs.get("tab_2").setVisible(false);
            summaControl.setVisible(false);
            clearTab(context);
        }
    };

    var insertCreditperiod = function(context)
    {
        let formContext = context.getFormContext();

        let creditAttr = formContext.getAttribute("nav_creditid");
        if(!creditAttr)
            alert("nav_creditid is null");

        let creditperiodAttr = formContext.getAttribute("nav_creditperiod");
        if(!creditperiodAttr)
            alert("nav_creditperiod is null");

        if(creditAttr.getValue() != null)
        {
            let creditid = creditAttr.getValue()[0].id
            creditid = creditid.replace(/[{}]/g,"");

            let promiseCredit = Xrm.WebApi.retrieveRecord("nav_credit", `${creditid}`, "?$select=nav_creditperiod");
            promiseCredit.then(
                function success(result) {
                    return result.nav_creditperiod;
                },
                function(error){
                    console.error(error.message);
                }
            ).then(
                function(creditperiod){
                    if(creditperiod)
                    { 
                        creditperiodAttr.setValue(creditperiod);
                    }
                },
                function(error){
                    console.error(error.message);
                }
            );
        }
    }

    var dateOnChange = function(context)
    {
        let formContext = context.getFormContext();

        let creditAttr = formContext.getAttribute("nav_creditid");
        if(!creditAttr)
            alert("nav_creditid is null");

        let dateAttr = formContext.getAttribute("nav_date");
        if(!dateAttr)
            alert("nav_date is null");

        if(creditAttr.getValue() != null && dateAttr.getValue() != null)
        {
                checkCreditValidity(context);
        }

    };

    var checkCreditValidity = function(context)
    {
        let formContext = context.getFormContext();

        let creditAttr = formContext.getAttribute("nav_creditid");
        if(!creditAttr)
            alert("nav_creditid is null");

        let dateAttr = formContext.getAttribute("nav_date");
        if(!dateAttr)
            alert("nav_date is null");

        let dateControl = formContext.getControl("nav_date");
        if(!dateControl)
            alert("nav_date_controll is null");

        let agreementDate = dateAttr.getValue()
        let creditid = creditAttr.getValue()[0].id
        if(agreementDate && creditid)
        {
            creditid = creditid.replace(/[{}]/g,"");
            var promiseCredit = Xrm.WebApi.retrieveRecord("nav_credit", `${creditid}`, "?$select=nav_dateend");
            promiseCredit.then(
                function success(result) {
                    return result.nav_dateend;
                },
                function(error){
                    console.error(error.message);
                }
            ).then(
                function(creditDate){
                    if(new Date(creditDate) < new Date(agreementDate))
                    { 
                        dateControl.addNotification({
                            messages: [`должна быть меньше даты окончания кредитной программы.`],
                            notificationLevel: 'ERROR',
                            uniqueId: 'date_notify_id'
                        });
                    }
                    else {
                        dateControl.clearNotification('date_notify_id');
                    }
                },
                function(error){
                    console.error(error.message);
                }
            );
        }
    }
       

    var nameOnChange = function(context)
    {
        let formContext = context.getFormContext();

        let nameAttr = formContext.getAttribute("nav_name");
        if(!nameAttr)
            alert("nav_name is null");

        if(nameAttr.getValue() != null){
            let newName = replaceName(nameAttr.getValue());
            nameAttr.setValue(newName);
        }
    };

    var replaceName = function(str)
    {
        return str.replace(/[^0-9-]/g, "").replace(/^\-*|\-*$/g, "");
    }

    var clearTab = function(context)
    {
        let formContext = context.getFormContext();
        var sectionName = formContext.ui.tabs.get("tab_2").sections.get();
        for (var i in sectionName) {
            var controls = sectionName[i].controls.get();
            var controlsL = controls.length;
            for (var i = 0; i < controlsL; i++) {
                controls[i].getAttribute().setValue(null);
            }
       }
    }

    var checkUserRoles = function () {
        var roles = Xrm.Utility.getGlobalContext().userSettings.roles;
     
        if (roles === null) return false;
     
        var hasRole = false;
        roles.forEach(function (item) {
            if (item.name.toLowerCase() === "Системный администратор" || item.id === "e93e2711-f165-ee11-9ae7-00224882b270") {
                hasRole = true;
            }
        });
   
        return hasRole;
    }

    return {
        onLoad : function (context)
        {
            let formContext = context.getFormContext();

            let formType = formContext.ui.getFormType();
            if(formType == FormType.Create)
            {                
                formContext.ui.tabs.get("tab_2").setVisible(false);

                let summaControl = formContext.getControl("nav_summa")
                if(!summaControl)
                    alert("nav_summa is null");

                let factControl = formContext.getControl("nav_fact")
                if(!factControl)
                    alert("nav_fact is null");

                let creditidControl = formContext.getControl("nav_creditid")
                if(!creditidControl)
                    alert("nav_creditid is null");

                let owneridControl = formContext.getControl("ownerid")
                if(!owneridControl)
                    alert("ownerid is null");

                summaControl.setVisible(false);
                factControl.setVisible(false);
                creditidControl.setVisible(false);
                owneridControl.setVisible(false);
            }
            else
            {
                let formControls = formContext.getControl();
                if(!checkUserRoles())
                {
                    formControls.forEach(control => {
                        control.setDisabled(true);
                    });
                }
            }


            let autoAttr = formContext.getAttribute("nav_autoid");
            if(!autoAttr)
                alert("nav_autoid is null");
            autoAttr.addOnChange(contactOrAutoOnChange);

            let contactAttr = formContext.getAttribute("nav_contact");
            if(!contactAttr)
                alert("nav_contact is null");
            contactAttr.addOnChange(contactOrAutoOnChange);

            let creditAttr = formContext.getAttribute("nav_creditid");
            if(!creditAttr)
                alert("nav_creditid is null");
            creditAttr.addOnChange(creditOnChange);

            let nameAttr = formContext.getAttribute("nav_name");
            if(!nameAttr)
                alert("nav_name is null");
            nameAttr.addOnChange(nameOnChange);

            let dateAttr = formContext.getAttribute("nav_date");
            if(!dateAttr)
                alert("nav_date is null");
            dateAttr.addOnChange(dateOnChange);            
        }
    }
})();