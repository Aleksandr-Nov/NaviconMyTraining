var Navicon = Navicon || {};

Navicon.nav_agreement_ribbon = (function () {
    /**
     *	Пересчитывать поле сумма кредита.
     *
     * Задание №3 ч.2 п.4
     */
    var setCreditamount = function () {
        var creditamountAttr = baseUtils.getAttribute("nav_creditamount");
        var summaAttr = baseUtils.getAttribute("nav_summa");
        var initialfeeAttr = baseUtils.getAttribute("nav_initialfee");
        var initialfeeControl = baseUtils.getControl("nav_initialfee");

        if (!summaAttr || !initialfeeAttr || !creditamountAttr) {
            return;
        }
        
        var summaVal = summaAttr.getValue();
        var initialfeeVal = initialfeeAttr.getValue();
        if (!initialfeeVal) {
            initialfeeControl.addNotification({
                messages: [
                    `Для расчета кредита пожалуйста заполните поле.`,
                ],
                notificationLevel: "RECOMMENDATION",
                uniqueId: "initialfee_id",
            });
        } else {
            initialfeeControl.clearNotification("initialfee_id");
        }

        if (summaVal && initialfeeVal)
            creditamountAttr.setValue(summaVal - initialfeeVal);
    };

    /**
     *	Получение процентной ставки по кредитной программе.
     *
     * Задание №3 ч.2 п.4
     */
    var setFullcreditamount = function () {
        var creditidAttr = baseUtils.getAttribute("nav_creditid");
        if (!creditidAttr) {
            return;
        }

        var creditval = creditidAttr.getValue();
        if (!creditval) {
            return;
        }

        var creditid = creditidAttr.getValue()[0].id;
        if (!creditid) {
            return;
        }

        Xrm.WebApi.retrieveRecord(
            "nav_credit",
            creditid,
            "?$select=nav_percent"
        ).then(
            function success(result) {
                if (result.nav_percent)
                    calculateFullcreditAmount(result.nav_percent);
            },
            function (error) {
                console.error(
                    "Произошла ошибка при получении данных" +
                        "из поля: `nav_percent`, " +
                        "таблицы: `nav_credit`, " +
                        "функция: `setFullcreditamount` " +
                        error.message
                );
            }
        );
    };

    /**
     *	Пересчитать поле полная стоимость кредита.
     *
     * Задание №3 ч.2 п.4
     */
    var calculateFullcreditAmount = function (percent) {
        var fullcreditamountAttr = baseUtils.getAttribute(
            "nav_fullcreditamount"
        );
        var creditperiodAttr = baseUtils.getAttribute("nav_creditperiod");
        var creditamountAttr = baseUtils.getAttribute("nav_creditamount");
        if (!fullcreditamountAttr || !creditperiodAttr || !creditamountAttr) {
            return;
        }

        var creditperiodVal = creditperiodAttr.getValue();
        var creditamountVal = creditamountAttr.getValue();
        if (creditperiodVal && creditamountVal) {
            var fullcreditamountVal =
                (percent / 100) * creditperiodVal * creditamountVal +
                creditamountVal;
            fullcreditamountAttr.setValue(fullcreditamountVal);
        }
    };

    return {
        Recalculate: function (context) {
            setCreditamount();
            setFullcreditamount();
        },
    };
})();
