document.onreadystatechange = function () {
    if (document.readyState == "complete" && Xrm.Page.ui.getFormType() != 1)
        getDataForTable();
};

/**
 *	Получить данные для таблицы.
 *
 * Задание №4
 */
function getDataForTable() {
    var fetchXml = `?fetchXml=
        <fetch distinct="true" no-lock="true">
            <entity name="nav_model">
            <attribute name="nav_modelid" />
            <attribute name="nav_name" />
            <filter>
                <condition attribute="nav_brandid" operator="eq" value="${parent.Xrm.Page.data.entity.getId()}" />
            </filter>
            <link-entity name="nav_auto" from="nav_modelid" to="nav_modelid" link-type="inner" alias="au">
                <link-entity name="nav_nav_credit_nav_auto" from="nav_autoid" to="nav_autoid" link-type="inner" alias="aucr">
                <link-entity name="nav_credit" from="nav_creditid" to="nav_creditid" link-type="inner" alias="cr">
                    <attribute name="nav_creditid" alias="nav_credit_creditid"  />
                    <attribute name="nav_creditperiod" alias="nav_credit_creditperiod"  />
                    <attribute name="nav_name" alias="nav_credit_name" />
                </link-entity>
                </link-entity>
            </link-entity>
            </entity>
        </fetch>`;

    Xrm.WebApi.retrieveMultipleRecords("nav_model", fetchXml).then(
        function success(result) {
            if (result.entities && result.entities.length > 0) {
                createDatatable(result.entities);
            }
        },
        function (error) {
            console.error(
                "Произошла ошибка при получении данных" +
                    "таблицы: `nav_model`, " +
                    "функция: `getDataForTable` " +
                    error.message
            );
        }
    );
}

/**
 *	Отрисовка таблицы.
 *
 * Задание №4
 */
function createDatatable(data) {
    var myTableDiv = document.getElementById("myDynamicTable");
    var table = document.createElement("TABLE");
    table.setAttribute("class", "table table-hover");
    table.border = "1";

    var tableHead = document.createElement("THEAD");
    var trh = document.createElement("TR");
    trh.setAttribute("class", "headerText-254");
    tableHead.appendChild(trh);

    var thh0 = document.createElement("TH");
    thh0.appendChild(document.createTextNode("Кредитная программа"));
    trh.appendChild(thh0);

    var thh1 = document.createElement("TH");
    thh1.appendChild(document.createTextNode("Модель"));
    trh.appendChild(thh1);

    var thh2 = document.createElement("TH");
    thh2.appendChild(document.createTextNode("Срок кредита"));
    trh.appendChild(thh2);

    var tableBody = document.createElement("TBODY");
    tableBody.setAttribute("class", "truncatableText-297");
    table.appendChild(tableHead);
    table.appendChild(tableBody);

    for (var i = 0; i < data.length; i++) {
        var tr = document.createElement("TR");
        tableBody.appendChild(tr);

        var td0 = document.createElement("TD");
        var td1 = document.createElement("TD");
        var td2 = document.createElement("TD");

        var elemA0 = document.createElement("a");
        elemA0.setAttribute("href", ``);
        elemA0.setAttribute(
            "onClick",
            `parent.Xrm.Navigation.openUrl("https://` +
                window.location.host +
                "/main.aspx?app=d365default&forceUCI=1&pagetype=entityrecord&etn=nav_credit&id=" +
                data[i].nav_credit_creditid +
                `")`
        );
        elemA0.appendChild(document.createTextNode(data[i].nav_credit_name));

        var elemA1 = document.createElement("a");
        elemA1.setAttribute("href", ``);
        elemA1.setAttribute(
            "onClick",
            `parent.Xrm.Navigation.openUrl("https://` +
                window.location.host +
                "/main.aspx?app=d365default&forceUCI=1&pagetype=entityrecord&etn=nav_model&id=" +
                data[i].nav_modelid +
                `")`
        );
        elemA1.appendChild(document.createTextNode(data[i].nav_name));

        td0.appendChild(elemA0);
        td1.appendChild(elemA1);
        td2.appendChild(
            document.createTextNode(data[i].nav_credit_creditperiod)
        );

        tr.appendChild(td0);
        tr.appendChild(td1);
        tr.appendChild(td2);
    }
    myTableDiv.appendChild(table);
}
