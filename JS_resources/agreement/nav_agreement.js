var Navicon = Navicon || {};

Navicon.nav_agreement  = (function ()
{

    const FormType = {
        Undefined : 0,
        Create : 1,
        Update : 2,
        ReadOnly : 3,
        Disabled: 4,
        BulkEdit : 6
    };

    var contactOrAutoOnChange = function (context) {
        var autoAttr = baseUtilit.getAttribute("nav_autoid");
        if (autoAttr) {
            if (autoAttr.getValue())
            setFieldSumma();
        }

        var contactAttr = baseUtilit.getAttribute("nav_contact");
        var creditidAttr = baseUtilit.getAttribute("nav_creditid")
        var creditidControl = baseUtilit.getControl("nav_creditid")
        if (contactAttr && creditidAttr && creditidControl) {
            if (autoAttr.getValue() && contactAttr.getValue()) {
                creditidControl.setVisible(true);
                creditPreSearch();
            } else  {
                creditidControl.setVisible(false);
                creditidAttr.setValue(null);
                creditidAttr.fireOnChange();
            }
        }
    };

    var setFieldSumma = function () {
        var autoAttr = baseUtilit.getAttribute("nav_autoid");
        var summaAttr = baseUtilit.getAttribute("nav_summa");
        if (autoAttr && summaAttr) {
            var autoid = autoAttr.getValue()[0].id;
            if(autoid) {
                autoid = autoid.replace(/[{}]/g,"");

                var promiseAuto = Xrm.WebApi.retrieveRecord("nav_auto", `${autoid}`, "?$select=nav_used");
                promiseAuto.then(
                    function success (result) {
                        return result.nav_used;
                    },
                    function (error) {
                        console.error(error.message);
                    }
                ).then(
                    function success (used) {
                        console.log("used", used);
                        if (used) {
                            usedSetSumma(autoid);
                        } else {
                            unusedSetSumma(autoid);
                            
                        }
                    },
                    function (error) {
                        console.error(error.message);
                    }
                );
            }
        }
    }

    var usedSetSumma = function (autoid) {
        var summaAttr = baseUtilit.getAttribute("nav_summa");
        if (summaAttr && autoid) {
            var promiseAutoSumm = Xrm.WebApi.retrieveRecord("nav_auto", `${autoid}`, "?$select=nav_amount");
            promiseAutoSumm.then(
                function success (result) {
                    if(result.nav_amount)
                    {
                        summaAttr.setValue(result.nav_amount)
                    }
                },
                function (error) {
                    console.error(error.message);
                }
            );
        }       
    }

    var unusedSetSumma = function (autoid) {
        var summaAttr = baseUtilit.getAttribute("nav_summa");
        if (summaAttr && autoid) {
            var fetchXml = `?fetchXml=
                <fetch>
                    <entity name="nav_auto">
                        <filter>
                            <condition attribute="nav_autoid" operator="eq" value="5D5C81E2-F768-EE11-8DEF-002248829CF8" />
                        </filter>
                        <link-entity name="nav_model" from="nav_modelid" to="nav_modelid" link-type="inner" alias="model">
                            <attribute name="nav_recommendedamount" />
                        </link-entity>
                    </entity>
                </fetch>`;
    
            var promiseAutoSumm = Xrm.WebApi.retrieveMultipleRecords("nav_auto", fetchXml);
            promiseAutoSumm.then(
                function success (result) {
                    console.log("result",result);
                    if(result.entities[0]["model.nav_recommendedamount"]) {
                        summaAttr.setValue(result.entities[0]["model.nav_recommendedamount"])
                    }
                },
                function (error) {
                    console.error(error.message);
                }
            );
        }       
    }

    var creditPreSearch = function () {
        var autoAttr = baseUtilit.getAttribute("nav_autoid");
        var creditidControl = baseUtilit.getControl("nav_creditid")
        if (autoAttr && creditidControl) {
            var auto = autoAttr.getValue()[0]
            if (auto) {
                var autoId = auto.id.replace(/[{}]/g,"");
                var fetchXml = `?fetchXml=
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
        
                Xrm.WebApi.retrieveMultipleRecords("nav_credit", fetchXml).then(
                    function success (result) {                   
                        return result.entities;      
                    },
                    function (error) {
                        console.log(error.message);
                    }
                ).then(
                    function success (creditIdList) {
                        var creditFilter = "";
                        for (var i = 0; i < creditIdList.length; i++) {
                            creditFilter += `<value>${creditIdList[i].nav_creditid}</value>`;
                        };
                        creditCustomFilter(creditFilter);      
                    },
                    function (error) {
                        console.log(error.message);
                    }
                );
            }
        }  
    }

    var creditCustomFilter = function (creditFilter) {
        var creditidControl = baseUtilit.getControl("nav_creditid")
        if (creditidControl && creditFilter) {
            var fetchXml = `<fetch>
                                <entity name="nav_credit">
                                    <attribute name="nav_name" />
                                    <attribute name="nav_creditid" />
                                    <filter>
                                        <condition attribute="nav_creditid" operator="in">` +
                                            creditFilter +
                                        `</condition>
                                    </filter>
                                </entity>
                            </fetch>`;

            var layoutXml = "<grid name='resultset' object='1' jump='productid' select='1' icon='1' preview='1'>" +
                                "<row name='result' id='nav_creditid'>" +
                                    "<cell name='nav_name' width='150' />" +
                                "</row>" +
                            "</grid>";

            creditidControl.addCustomView("{00000000-0000-0000-0000-000000000001}", 
                "nav_credit" , "This my custom view", fetchXml, layoutXml, true)
        }
    }

    var creditOnChange = function (context) {
        var formContext = context.getFormContext();

        var creditAttr = baseUtilit.getAttribute("nav_creditid");
        var summaControl = baseUtilit.getControl("nav_summa")
        var dateAttr = baseUtilit.getAttribute("nav_date");
        if (creditAttr && summaControl && dateAttr) {
            creditPreSearch();
            if (creditAttr.getValue()) {
                formContext.ui.tabs.get("tab_2").setVisible(true);
                summaControl.setVisible(true);
    
                if (dateAttr.getValue())
                    checkCreditValidity();
    
                insertCreditperiod();
            } else {
                formContext.ui.tabs.get("tab_2").setVisible(false);
                summaControl.setVisible(false);
            }
        }
    };

    var insertCreditperiod = function () {
        var creditAttr = baseUtilit.getAttribute("nav_creditid");
        var creditperiodAttr = baseUtilit.getAttribute("nav_creditperiod");
        if(creditAttr && creditperiodAttr) {
            if (creditAttr.getValue() != null) {
                var creditid = creditAttr.getValue()[0].id
                creditid = creditid.replace(/[{}]/g,"");
    
                var promiseCredit = Xrm.WebApi.retrieveRecord("nav_credit", `${creditid}`, "?$select=nav_creditperiod");
                promiseCredit.then(
                    function success (result) {
                        return result.nav_creditperiod;
                    },
                    function (error) {
                        console.error(error.message);
                    }
                ).then(
                    function (creditperiod) {
                        if (creditperiod)
                            creditperiodAttr.setValue(creditperiod);
                    },
                    function (error) {
                        console.error(error.message);
                    }
                );
            }
        }       
    }

    var dateOnChange = function () {
        var creditAttr = baseUtilit.getAttribute("nav_creditid");
        var dateAttr = baseUtilit.getAttribute("nav_date");
        if (creditAttr && dateAttr) {
            if (creditAttr.getValue() && dateAttr.getValue())
                checkCreditValidity();
        }
    };

    var checkCreditValidity = function () {
        var creditAttr = baseUtilit.getAttribute("nav_creditid");
        var dateAttr = baseUtilit.getAttribute("nav_date");
        var dateControl = baseUtilit.getControl("nav_date");

        if(dateAttr && creditAttr)
        {
            var agreementDate = dateAttr.getValue()
            var creditid = creditAttr.getValue()[0].id
        }
        if (agreementDate && creditid) {
            creditid = creditid.replace(/[{}]/g,"");
            var promiseCredit = Xrm.WebApi.retrieveRecord("nav_credit", `${creditid}`, "?$select=nav_dateend");
            promiseCredit.then(
                function success (result) {
                    return result.nav_dateend;
                },
                function (error){
                    console.error(error.message);
                }
            ).then(
                function (creditDate){
                    if(new Date(creditDate) < new Date(agreementDate)){ 
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
       
    var nameOnChange = function ()
    {
        var nameAttr = baseUtilit.getAttribute("nav_name");
        if (nameAttr) {
            if (nameAttr.getValue() != null) {
                var newName = replaceName(nameAttr.getValue());
                nameAttr.setValue(newName);
            }
        }
    };

    var replaceName = function (str)
    {
        return str.replace(/[^0-9-]/g, "").replace(/^\-*|\-*$/g, "");
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

    var visibleSettings = function (context)
    {
        console.log("visibleSettings");
        var formContext = context.getFormContext();

        var formType = formContext.ui.getFormType();
        if (formType == FormType.Create) {                
            formContext.ui.tabs.get("tab_2").setVisible(false);

            var summaControl = baseUtilit.getControl("nav_summa")
            if (summaControl) {
                console.log("summaControl true");
                summaControl.setVisible(false);
            } else { console.log("summaControl else");}

            var factControl = baseUtilit.getControl("nav_fact")
            if (factControl) {
                factControl.setVisible(false);
            }

            var creditidControl = baseUtilit.getControl("nav_creditid")
            if (creditidControl) {
                creditidControl.setVisible(false);
            }

            var owneridControl = baseUtilit.getControl("ownerid")
            if (owneridControl) {
                owneridControl.setVisible(false);
            }
        }
        else
        {
            var formControls = formContext.getControl();
            if (!checkUserRoles())
            {
                formControls.forEach(control => {
                    control.setDisabled(true);
                });
            }
        }
    }

    var onChangeModule = function ()
    {
        var autoAttr = baseUtilit.getAttribute("nav_autoid");
        if (autoAttr) {
            autoAttr.addOnChange(contactOrAutoOnChange);
        }

        var contactAttr = baseUtilit.getAttribute("nav_contact");
        if (contactAttr) {
            contactAttr.addOnChange(contactOrAutoOnChange);
        }

        var creditAttr = baseUtilit.getAttribute("nav_creditid");
        if (creditAttr) {
            creditAttr.addOnChange(creditOnChange);
        }

        var nameAttr = baseUtilit.getAttribute("nav_name");
        if (nameAttr) {
            nameAttr.addOnChange(nameOnChange);
        }

        var dateAttr = baseUtilit.getAttribute("nav_date");
        if (dateAttr) {
            dateAttr.addOnChange(dateOnChange);  
        }          
    }

    return {
        onLoad : function (context)
        {
            visibleSettings(context);
            onChangeModule();            
        }
    }
})();