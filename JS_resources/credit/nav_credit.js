var Navicon = Navicon || {};

Navicon.nav_credit = (function () {
    const minPeriodForCredit = 1;

    /**
     *	Проверка: дата оконнчания > дата начала.
     *
     * Задание №2 ч.1 п.5
     */
    var dateOnChange = function (context) {
        var datestartAttr = baseUtils.getAttribute("nav_datestart");
        var dateendAttr = baseUtils.getAttribute("nav_dateend");
        var dateendControl = baseUtils.getControl("nav_dateend");
        if (!datestartAttr || !dateendAttr || !dateendControl) {
            return;
        }
        
        var startDate = datestartAttr.getValue();
        var endDate = dateendAttr.getValue();

        if (startDate && endDate) {
            if (!checkDateRange(startDate, endDate)) {
                dateendControl.addNotification({
                    messages: [
                        `не должна быть меньше даты начала менее чем на: ${minPeriodForCredit} год`,
                    ],
                    notificationLevel: "ERROR",
                    uniqueId: "date_notify_id",
                });
            } else {
                dateendControl.clearNotification("date_notify_id");
            }
        }
    };

    /**
     *	Проверка: дата оконнчания > дата начала.
     *
     * Задание №2 ч.1 п.5
     */
    var checkDateRange = function (startDate, endDate) {
        var startday = startDate.getDate();
        var startmonth = startDate.getMonth();
        var startyear = startDate.getFullYear();

        var endday = endDate.getDate();
        var endmonth = endDate.getMonth();
        var endyear = endDate.getFullYear();

        if (endyear - startyear > minPeriodForCredit) return true;

        if (endyear <= startyear) return false;

        if (endmonth > startmonth) {
            return true;
        } 
        else if (endmonth == startmonth) {
            return endday > startday 
        } 
        return false;     
    };

    var onChangeStart = function () {
        var datestartAttr = baseUtils.getAttribute("nav_datestart");
        if (datestartAttr) datestartAttr.addOnChange(dateOnChange);

        var dateendAttr = baseUtils.getAttribute("nav_dateend");
        if (dateendAttr) dateendAttr.addOnChange(dateOnChange);
    };

    return {
        onLoad: function (context) {
            onChangeStart();
        },
    };
})();
