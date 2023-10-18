var Navicon = Navicon || {};

Navicon.nav_credit  = (function()
{
    const minYearForCredit = 1;

    var dateOnChange = function(context)
    {
        var datestartAttr = baseUtilit.getAttribute("nav_datestart");
        var dateendAttr = baseUtilit.getAttribute("nav_dateend");
        let dateendControl = baseUtilit.getControl("nav_dateend")
        if (datestartAttr && dateendAttr) {
            var startDate = datestartAttr.getValue();
            var endDate = dateendAttr.getValue();
    
            if (startDate && endDate && dateendControl) { 
                if (checkDateRange(startDate, endDate)) { 
                    dateendControl.addNotification( {
                        messages: [`не должна быть меньше даты начала менее чем на: ${minYearForCredit} год`],
                        notificationLevel: 'ERROR',
                        uniqueId: 'date_notify_id'
                    });
                }
                else {
                    dateendControl.clearNotification('date_notify_id');
                }
            }
        }
    }

    var checkDateRange = function (startDate, endDate)
    {
        var startday = startDate.getDate();
        var startmonth = startDate.getMonth();
        var startyear = startDate.getFullYear();

        var endday = endDate.getDate();
        var endmonth = endDate.getMonth();
        var endyear = endDate.getFullYear();

        if ((endyear - startyear) > minYearForCredit)
            return false

        if (endyear <= startyear)
            return true

        if (endmonth > startmonth)
            return false
            
        else if (endmonth == startmonth)
        {
            if (endday > startday) {
                return false
            }
            else{
                return true
            }
        } else {
            return true
        }    
    }

    var onChangeStart = function () {
        var datestartAttr = baseUtilit.getAttribute("nav_datestart");
        if (datestartAttr)
            datestartAttr.addOnChange( dateOnChange );
            
        var dateendAttr = baseUtilit.getAttribute("nav_dateend");
        if (dateendAttr) 
            dateendAttr.addOnChange( dateOnChange );
    }

    return {
        onLoad : function (context)
        {
            onChangeStart();
        }
    }
})();