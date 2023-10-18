var Navicon = Navicon || {};

Navicon.nav_agreement_ribbon  = (function ()
{
    var setCreditamount = function () {
        var creditamountAttr = baseUtilit.getAttribute("nav_creditamount");
        var summaAttr = baseUtilit.getAttribute("nav_summa");
        var initialfeeAttr = baseUtilit.getAttribute("nav_initialfee")

        if (summaAttr && initialfeeAttr) {
            var summaVal = summaAttr.getValue();
            var initialfeeVal = initialfeeAttr.getValue();
            if (summaVal && initialfeeVal) 
                creditamountAttr.setValue(summaVal - initialfeeVal);
        }
    }

    var setFullcreditamount = function () {
        var creditidAttr = baseUtilit.getAttribute("nav_creditid")
        if (creditidAttr) {
            var creditid = creditidAttr.getValue()[0].id;
            if (creditid) {
                creditid = creditid.replace(/[{}]/g,"");
                var promiseCredit = Xrm.WebApi.retrieveRecord("nav_credit", `${creditid}`, "?$select=nav_percent");
                promiseCredit.then(
                    function success (result) {
                        if (result.nav_percent)
                            calculateFullcreditAmount(result.nav_percent);
                    },
                    function (error) {
                        console.error(error.message);
                    }
                )
            }
        }
    }

    var calculateFullcreditAmount  = function (percent) {
        var fullcreditamountAttr = baseUtilit.getAttribute("nav_fullcreditamount");
        var creditperiodAttr = baseUtilit.getAttribute("nav_creditperiod");
        var creditamountAttr = baseUtilit.getAttribute("nav_creditamount");
        if (fullcreditamountAttr && creditperiodAttr && creditamountAttr) {
            var creditperiodVal = creditperiodAttr.getValue();
            var creditamountVal = creditamountAttr.getValue();
            if (creditperiodVal && creditamountVal) {
                var fullcreditamountVal = (percent / 100 * creditperiodVal * creditamountVal) + creditamountVal;
                fullcreditamountAttr.setValue(fullcreditamountVal);
            }
        }
    }

    return {
        Recalculate : function (context) {
            setCreditamount();
            setFullcreditamount();
        }
    }
})();