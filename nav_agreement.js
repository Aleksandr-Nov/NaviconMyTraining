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
        try
        {
            let formContext = context.getFormContext();

            let autoAttr = formContext.getAttribute("nav_autoid");
            let contactAttr = formContext.getAttribute("nav_contact");
            let creditidAttr = formContext.getAttribute("nav_creditid")

            let creditidControl = formContext.getControl("nav_creditid")
            if( creditidControl == null || creditidControl == undefined )
                throw new Error('nav_creditid is null');

            if(autoAttr.getValue() != null && contactAttr.getValue() != null)
            {
                creditidControl.setVisible(true);

                // let auto = autoAttr.getValue()[0]

                // console.log("auto", auto);
                // console.log("autoId", auto.id);
                // let autoId = auto.id.replace(/[{}]/g,"");
                // var fetchXml = `?fetchXml=
                // <fetch>
                //     <entity name="nav_agreement">
                //         <attribute name="nav_creditid" />
                //         <link-entity name="nav_auto" from="nav_autoid" to="nav_autoid" link-type="inner" alias="au">
                //             <filter>
                //             <condition attribute="nav_autoid" operator="eq" value='${autoId}' />
                //             </filter>
                //         </link-entity>
                //     </entity>
                // </fetch>`
                // var creditId;
                // Xrm.WebApi.retrieveMultipleRecords("nav_agreement", fetchXml).then(
                //     function success(result) {
                //         for (var i = 0; i < result.entities.length; i++) {
                //             console.log(result.entities[i]);
                //             creditId = result.entities[i]._nav_creditid_value;
                            
                //         } 
                //         console.log("creditId",creditId);
                //         //creditidControl.addPreSearch( filterCustomerCredit(formContext, creditId) );     
                //         // creditidControl.addPreSearch(addLookupFilter(creditId));              
                //     },
                //     function (error) {
                //         console.log(error.message);
                //     }
                // );
                //creditidControl.addPreSearch( filterCustomerCredit(context) ) ;
            }
            else  
            {
                creditidControl.setVisible(false);
                creditidAttr.setValue(null);
                creditidAttr.fireOnChange();
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

    };

    // var filterCustomerCredit = function (context) {
    //     console.log("Is Work");
    //     let formContext = context.getFormContext();

    //     var customerCreditFilter ="<filter><condition attribute='nav_name' operator='eq' value='Программа №3' /></filter>";
    //     formContext.getControl("nav_creditid").addCustomFilter(customerCreditFilter, "nav_credit");
    // }


    // var addLookupFilter =  function () {
 
    //     try
    //     {
    //          fetchXml = "<filter type='and'><condition attribute='nav_creditid' operator = 'eq' value ='87102223-c769-ee11-8def-002248829cf8' /></filter>";
    //          Xrm.Page.getControl("nav_creditid").addCustomFilter(fetchXml);

    //     } catch (e) {
    //         //throw error
    //         throw new Error(e.message);
    //     }
     
    // }

    var creditOnChange = function(context)
    {
        let formContext = context.getFormContext();
        let creditAttr = formContext.getAttribute("nav_creditid");
        let summaControl = formContext.getControl("nav_summa")

        if(creditAttr.getValue() != null)
        {
            formContext.ui.tabs.get("tab_2").setVisible(true);
            summaControl.setVisible(true);
        }
        else  
        {
            formContext.ui.tabs.get("tab_2").setVisible(false);
            summaControl.setVisible(false);
            clearTab(context);
        }
    };

    var nameOnChange = function(context)
    {
        let formContext = context.getFormContext();

        let nameAttr = formContext.getAttribute("nav_name");

        if(nameAttr.getValue() != null){
            let newName = replaceName(nameAttr.getValue());
            nameAttr.setValue( newName );
        }
    };

    var replaceName = function(str)
    {
        return str.replace(/[^0-9-]/g, '').replace(/^\-*|\-*$/g, '');
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


    return {
        onLoad : function (context)
        {
            try
            {
                let formContext = context.getFormContext();

                let formType = formContext.ui.getFormType();
                if(formType == FormType.Create)
                {                
                    formContext.ui.tabs.get("tab_2").setVisible(false);
    
                    let summaControl = formContext.getControl("nav_summa")
                    if( summaControl == null || summaControl == undefined )
                        throw new Error('nav_summa is null');

                    let factControl = formContext.getControl("nav_fact")
                    if( factControl == null || factControl == undefined )
                        throw new Error('nav_fact is null');

                    let creditidControl = formContext.getControl("nav_creditid")
                    if( creditidControl == null || creditidControl == undefined )
                        throw new Error('nav_creditid is null');

                    let owneridControl = formContext.getControl("ownerid")
                    if( owneridControl == null || owneridControl == undefined )
                        throw new Error('ownerid is null');
    
                    summaControl.setVisible(false);
                    factControl.setVisible(false);
                    creditidControl.setVisible(false);
                    owneridControl.setVisible(false);
                }
    
    
                let autoAttr = formContext.getAttribute("nav_autoid");
                if( autoAttr == null || autoAttr == undefined )
                    throw new Error('nav_autoid is null');
                autoAttr.addOnChange( contactOrAutoOnChange );
    
                let contactAttr = formContext.getAttribute("nav_contact");
                if( contactAttr == null || contactAttr == undefined )
                    throw new Error('nav_contact is null');
                contactAttr.addOnChange( contactOrAutoOnChange );
    
                let creditAttr = formContext.getAttribute("nav_creditid");
                if( creditAttr == null || creditAttr == undefined )
                    throw new Error('nav_creditid is null');
                creditAttr.addOnChange( creditOnChange );
    
                let nameAttr = formContext.getAttribute("nav_name");
                if( nameAttr == null || nameAttr == undefined )
                    throw new Error('nav_name is null');
                nameAttr.addOnChange( nameOnChange );

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