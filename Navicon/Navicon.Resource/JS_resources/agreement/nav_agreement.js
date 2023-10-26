var Navicon = Navicon || {};

Navicon.nav_agreement = (function () {
    const FormType = {
        Undefined: 0,
        Create: 1,
        Update: 2,
        ReadOnly: 3,
        Disabled: 4,
        BulkEdit: 6,
    };

    /**
     * Показать поля после выбора значений.
     * Фильтрация кредитных программ.
     * Стоимость должна подставляться автоматически в соответствии с правилом
     *
     * Задание №2 ч.1 п.2
     * Задание №2 ч.1 п.4
     * Задание №3 ч.2 п.3
     */
    var contactOrAutoOnChange = function (context) {
        var autoAttr = baseUtils.getAttribute("nav_autoid");
        if (!autoAttr || !autoAttr.getValue()) {
            return;
        }
        
        setFieldSumma();

        var contactAttr = baseUtils.getAttribute("nav_contact");
        var creditidAttr = baseUtils.getAttribute("nav_creditid");
        var creditidControl = baseUtils.getControl("nav_creditid");
        if (!contactAttr || !creditidAttr || !creditidControl) {
            return;
        }

        if (contactAttr.getValue()) {
            creditidControl.setVisible(true);
            creditPreSearch();
        } else {
            creditidControl.setVisible(false);
            creditidAttr.setValue(null);
            creditidAttr.fireOnChange();
        }
    };

    /**
     * Стоимость должна подставляться автоматически в соответствии с правилом
     *
     * Задание №3 ч.2 п.3
     */
    var setFieldSumma = function () {
        var autoAttr = baseUtils.getAttribute("nav_autoid");
        var summaAttr = baseUtils.getAttribute("nav_summa");
        if (!autoAttr || !summaAttr) {
            return;
        }

        var autoid = autoAttr.getValue()[0].id;
        if (!autoid) {
            return;
        }

        Xrm.WebApi.retrieveRecord(
            "nav_auto",
            autoid,
            "?$select=nav_used"
        ).then(
            function success(result) {
                if (result.nav_used) {
                    usedSetSumma(autoid);
                } else {
                    unusedSetSumma(autoid);
                }
            },
            function (error) {
                console.error(
                    "Произошла ошибка при получении данных " +
                        "из поля: `nav_used`, " +
                        "таблицы: `nav_auto`, " +
                        "функция: `setFieldSumma` " +
                        error.message
                );
            }
        );
    };

    /**
     * Стоимость должна подставляться автоматически в соответствии с правилом
     * Если авто с пробегом.
     *
     * Задание №3 ч.2 п.3
     */
    var usedSetSumma = function (autoid) {
        var summaAttr = baseUtils.getAttribute("nav_summa");
        if (!summaAttr || !autoid) {
            return;
        }

        Xrm.WebApi.retrieveRecord(
            "nav_auto",
            autoid,
            "?$select=nav_amount"
        ).then(
            function success(result) {
                if (result.nav_amount) {
                    summaAttr.setValue(result.nav_amount);
                }
            },
            function (error) {
                console.error(
                    "Произошла ошибка при получении данных " +
                        "из поля: `nav_amount`, " +
                        "таблицы: `nav_auto`, " +
                        "функция: `usedSetSumma` " +
                        error.message
                );
            }
        );
    };

    /**
     * Стоимость должна подставляться автоматически в соответствии с правилом
     * Если авто без пробега.
     *
     * Задание №3 ч.2 п.3
     */
    var unusedSetSumma = function (autoid) {
        var summaAttr = baseUtils.getAttribute("nav_summa");
        if (!summaAttr || !autoid) {
            return;
        }

        var fetchXml = `?fetchXml=
                        <fetch>
                            <entity name="nav_auto">
                                <filter>
                                    <condition attribute="nav_autoid" operator="eq" value="${autoid}" />
                                </filter>
                                <link-entity name="nav_model" from="nav_modelid" to="nav_modelid" link-type="inner" alias="model">
                                    <attribute name="nav_recommendedamount" />
                                </link-entity>
                            </entity>
                        </fetch>`;

        Xrm.WebApi.retrieveMultipleRecords("nav_auto", fetchXml).then(
            function success(result) {
                if (result.entities[0]["model.nav_recommendedamount"]) {
                    summaAttr.setValue(
                        result.entities[0]["model.nav_recommendedamount"]
                    );
                }
            },
            function (error) {
                console.error(
                    "Произошла ошибка при получении данных " +
                        "таблицы: `nav_auto`, " +
                        "функция: `unusedSetSumma` " +
                        error.message
                );
            }
        );
    };

    /**
     * Фильтрация кредитных программ.
     * Получение id крежитных программ по автомобилю
     *
     * Задание №2 ч.1 п.4
     */
    var creditPreSearch = function () {
        var autoAttr = baseUtils.getAttribute("nav_autoid");
        var creditidControl = baseUtils.getControl("nav_creditid");
        if (!autoAttr || !creditidControl) {
            return;
        }

        var autoId = autoAttr.getValue()[0].id;
        if (!autoId) {
            return;
        }

        var fetchXml =
            `?fetchXml=
                <fetch>
                    <entity name="nav_credit">
                        <attribute name="nav_name" />
                        <attribute name="nav_creditid" />
                        <link-entity name="nav_nav_credit_nav_auto" from="nav_creditid" to="nav_creditid" intersect="true">
                            <filter>
                                <condition attribute="nav_autoid" operator="eq" value="` +
                                    autoId +
                                `" uitype="nav_nav_credit_nav_auto" />
                            </filter>
                        </link-entity>
                    </entity>
                </fetch>`;

        Xrm.WebApi.retrieveMultipleRecords("nav_credit", fetchXml).then(
            function success(creditIdList) {
                if (creditIdList.entities && creditIdList.entities.length > 0) {
                    var creditFilter = "";
                    for (var i = 0; i < creditIdList.entities.length; i++) {
                        creditFilter += `<value>${creditIdList.entities[i].nav_creditid}</value>`;
                    }
                    creditCustomFilter(creditFilter);
                }
            },
            function (error) {
                console.error(
                    "Произошла ошибка при получении данных " +
                        "таблицы: `nav_credit`, " +
                        "функция: `creditPreSearch` " +
                        error.message
                );
            }
        );
    };

    /**
     * Фильтрация кредитных программ.
     * Создание фильтра.
     *
     * Задание №2 ч.1 п.4
     */
    var creditCustomFilter = function (creditFilter) {
        var creditidControl = baseUtils.getControl("nav_creditid");
        if (!creditidControl || !creditFilter) {
            return;
        }

        var fetchXml =
                `<fetch>
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

        var layoutXml =
            "<grid name='resultset' object='1' jump='productid' select='1' icon='1' preview='1'>" +
                "<row name='result' id='nav_creditid'>" +
                    "<cell name='nav_name' width='150' />" +
                "</row>" +
            "</grid>";

        creditidControl.addCustomView(
            "{00000000-0000-0000-0000-000000000001}",
            "nav_credit",
            "This my custom view",
            fetchXml,
            layoutXml,
            true
        );
    };

    /**
     * Показать поля связанные с расчетом кредита.
     * Проверять ее срок действия относительно даты договора.
     * Срок кредита подставляеться из выбранной кредитной программы
     *
     * Задание №2 ч.1 п.3
     * Задание №3 ч.2 п.1
     * Задание №3 ч.2 п.2
     */
    var creditOnChange = function (context) {
        var formContext = context.getFormContext();

        var creditAttr = baseUtils.getAttribute("nav_creditid");
        var summaControl = baseUtils.getControl("nav_summa");
        var dateAttr = baseUtils.getAttribute("nav_date");
        if (!creditAttr) {
            return;
        }

        creditPreSearch();

        if (creditAttr.getValue()) {
            var creditTab = formContext.ui.tabs.get("tab_2");
            if (creditTab) {
                creditTab.setVisible(true);
            }

            if (summaControl){
                summaControl.setVisible(true);
            }

            if (dateAttr) {
                if (dateAttr.getValue()) {
                    checkCreditValidity();
                }        
            }
            insertCreditperiod();
        } else {
            var creditTab = formContext.ui.tabs.get("tab_2");
            if (creditTab) {
                creditTab.setVisible(false);
            }

            if (summaControl){
                summaControl.setVisible(false);
            }
        }
    };

    /**
     * Срок кредита подставляеться из выбранной кредитной программы
     *
     * Задание №3 ч.2 п.2
     */
    var insertCreditperiod = function () {
        var creditAttr = baseUtils.getAttribute("nav_creditid");
        var creditperiodAttr = baseUtils.getAttribute("nav_creditperiod");
        if (!creditAttr || !creditperiodAttr) {
            return;
        }

        var creditid = creditAttr.getValue()[0].id;
        if (!creditid) {
            return;
        }

        Xrm.WebApi.retrieveRecord(
            "nav_credit",
            creditid,
            "?$select=nav_creditperiod"
        ).then(
            function (result) {
                if (result.nav_creditperiod)
                    creditperiodAttr.setValue(result.nav_creditperiod);
            },
            function (error) {
                console.error(
                    "Произошла ошибка при получении данных" +
                        "из поля: `nav_creditperiod`, " +
                        "таблицы: `nav_credit`, " +
                        "функция: `insertCreditperiod` " +
                        error.message
                );
            }
        );
    };

    /**
     * Проверять дату действия относительно даты договора.
     *
     * Задание №3 ч.2 п.1
     */
    var dateOnChange = function () {
        var creditAttr = baseUtils.getAttribute("nav_creditid");
        var dateAttr = baseUtils.getAttribute("nav_date");
        if (creditAttr && dateAttr && creditAttr.getValue() && dateAttr.getValue()) {
            checkCreditValidity();
        }
    };

    /**
     * Проверять дату действия относительно даты договора.
     *
     * Задание №3 ч.2 п.1
     */
    var checkCreditValidity = function () {
        var creditAttr = baseUtils.getAttribute("nav_creditid");
        var dateAttr = baseUtils.getAttribute("nav_date");
        var dateControl = baseUtils.getControl("nav_date");

        if (!dateAttr || !creditAttr || !dateControl) {
            return;
        }

        var agreementDate = dateAttr.getValue();
        var creditid = creditAttr.getValue()[0].id;
        if (!agreementDate || !creditid) {
            return;
        }

        Xrm.WebApi.retrieveRecord(
            "nav_credit",
            creditid,
            "?$select=nav_dateend"
        ).then(
            function (result) {
                if (!result.nav_dateend) {
                    return;
                }

                if (new Date(result.nav_dateend) < new Date(agreementDate)) {
                    dateControl.addNotification({
                        messages: [
                            `должна быть меньше даты окончания кредитной программы.`,
                        ],
                        notificationLevel: "ERROR",
                        uniqueId: "date_notify_id",
                    });
                } else {
                    dateControl.clearNotification("date_notify_id");
                }
            },
            function (error) {
                console.error(
                    "Произошла ошибка при получении данных" +
                        "из поля: `nav_dateend`, " +
                        "таблицы: `nav_credit`, " +
                        "функция: `checkCreditValidity` " +
                        error.message
                );
            }
        );
    };

    /**
     * По завершении ввода, оставлять только цифры и тире.
     *
     * Задание №2 ч.1 п.6
     */
    var nameOnChange = function () {
        var nameAttr = baseUtils.getAttribute("nav_name");
        if (!nameAttr || !nameAttr.getValue()) {
            return;
        }

        var newName = replaceName(nameAttr.getValue());
        nameAttr.setValue(newName);
    };

    /**
     * Задание №2 ч.1 п.6
     * @return {string} newName, только цифры и тире.
     */
    var replaceName = function (str) {
        return str.replace(/[^0-9-]/g, "");
    };

    /**
     * Задание №3 ч.2 п.1
     * @return {boolean} true, если пользователь Cистемный администратор.
     */
    var checkUserRoles = function (roles) {
        roles.forEach(x => {
            if (x.name == "Cистемный администратор") {
                return false;
            }
        });
        return true; 
    };

    /**
     * Скрытие полей при создании объекта.
     * Проверка пользователя
     *
     * Задание №2 ч.1 п.1
     * Задание №3 ч.2 п.1
     */
    var visibleSettings = function (context) {
        var formContext = context.getFormContext();

        var formType = formContext.ui.getFormType();
        if (formType == FormType.Create) {
            var creditTab = formContext.ui.tabs.get("tab_2");
            if (creditTab) {
                creditTab.setVisible(false);
            }

            var summaControl = baseUtils.getControl("nav_summa");
            if (summaControl) {
                summaControl.setVisible(false);
            }

            var factControl = baseUtils.getControl("nav_fact");
            if (factControl) {
                factControl.setVisible(false);
            }

            var creditidControl = baseUtils.getControl("nav_creditid");
            if (creditidControl) {
                creditidControl.setVisible(false);
            }

            var owneridControl = baseUtils.getControl("ownerid");
            if (owneridControl) {
                owneridControl.setVisible(false);
            }
        } else {
            creditPreSearch();
            var formControls = formContext.getControl();
            var roles = Xrm.Utility.getGlobalContext().userSettings.roles;
            if (!formControls || !roles || roles.length == 0) {
                return;
            }

            if (!checkUserRoles(roles)) {
                formControls.forEach((control) => {
                    control.setDisabled(true);
                });
            }
        }
    };

    var onChangeModule = function () {
        var autoAttr = baseUtils.getAttribute("nav_autoid");
        if (autoAttr) {
            autoAttr.addOnChange(contactOrAutoOnChange);
        }

        var contactAttr = baseUtils.getAttribute("nav_contact");
        if (contactAttr) {
            contactAttr.addOnChange(contactOrAutoOnChange);
        }

        var creditAttr = baseUtils.getAttribute("nav_creditid");
        if (creditAttr) {
            creditAttr.addOnChange(creditOnChange);
        }

        var nameAttr = baseUtils.getAttribute("nav_name");
        if (nameAttr) {
            nameAttr.addOnChange(nameOnChange);
        }

        var dateAttr = baseUtils.getAttribute("nav_date");
        if (dateAttr) {
            dateAttr.addOnChange(dateOnChange);
        }
    };

    return {
        onLoad: function (context) {
            visibleSettings(context);
            onChangeModule();
        },
    };
})();
