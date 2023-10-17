var Navicon = Navicon || {};

Navicon.nav_credit  = (function()
{
    const minYearForCredit = 1;

    var dateOnChange = function(context)
    {
        let formContext = context.getFormContext();

        let datestartAttr = formContext.getAttribute("nav_datestart");
        if(!datestartAttr)
            alert("nav_datestart is null");

        let dateendAttr = formContext.getAttribute("nav_dateend");
        if(!dateendAttr)
            alert("nav_dateend is null");

        let dateendControl = formContext.getControl("nav_dateend")
        if(!dateendControl)
            alert("nav_dateend is null");
    
        let startDate = datestartAttr.getValue();
        let endDate = dateendAttr.getValue();

        if (startDate != null && endDate != null) 
        { 
            if(checkDateRange(startDate, endDate))
            { 
                dateendControl.addNotification({
                    messages: [`должна быть больше даты начала, не менее, чем на ${minYearForCredit} год`],
                    notificationLevel: 'ERROR',
                    uniqueId: 'date_notify_id'
                });
            }
            else {
                dateendControl.clearNotification('date_notify_id');
            }
        }
    }

    var checkDateRange = function(startDate, endDate)
    {
        let startday = startDate.getDate();
        let startmonth = startDate.getMonth();
        let startyear = startDate.getFullYear();

        let endday = endDate.getDate();
        let endmonth = endDate.getMonth();
        let endyear = endDate.getFullYear();

        if((endyear - startyear) > minYearForCredit)
            return false

        if(endyear <= startyear)
            return true

        if(endmonth > startmonth)
            return false
            
        else if (endmonth == startmonth)
        {
            if(endday > startday){
                return false
            }
            else{
                return true
            }
        }
        else{
            return true
        }    
    }

    return {
        onLoad : function (context)
        {
            let formContext = context.getFormContext();

            let datestartAttr = formContext.getAttribute("nav_datestart");
            if(!datestartAttr)
                alert("nav_datestart is null");
                
            let dateendAttr = formContext.getAttribute("nav_dateend");
            if(!dateendAttr)
                alert("nav_dateend is null");

            datestartAttr.addOnChange( dateOnChange );
            dateendAttr.addOnChange( dateOnChange );
        }
    }
})();