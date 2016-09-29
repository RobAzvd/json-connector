(function () {
    var myConnector = tableau.makeConnector();

    myConnector.getSchema = function (schemaCallback) {
        var value_cols = [
            {id: "ts", alias: "timestamp", dataType: tableau.dataTypeEnum.string},
            {id: "value", alias: "value", dataType: tableau.dataTypeEnum.string},
        ];

        var tableInfo = {
            id: "trendminerChartData",
            alias: "Trendminer chart data for the chosen dates",
            columns: value_cols
        };

        schemaCallback([tableInfo]);
    };

    myConnector.getData = function (table, doneCallback) {
        var tableauData = JSON.parse(tableau.connectionData);

        var dateString = "startDate=" + tableauData.startDate + "&endDate=" + tableauData.endDate;
        var tagNameString = "&tagNames%5B%5D=" + tableauData.tagName;
        var dataType = tableauData.dataType;

        var url = "http://localhost:8000/api/" + dataType + "/?" + dateString + "&interpolationTypes%5B%5D=linear&numberOfIntervals=150&shifts%5B%5D=0" + tagNameString;
        $.ajax({
            url: url,
            headers: {
                'Authorization': 'Basic ' + btoa('test:test')
            },
            xhrFields: {
                withCredentials: true
            }
        }).done(function (resp) {
            var values = resp[0].values,
                tableData = [];

            for (var i = 0, len = values.length; i < len; i++) {
                tableData.push({
                    ts: values[i].ts,
                    value: values[i].value
                });
            }

            table.appendRows(tableData);
            doneCallback();

        });
    };

    tableau.registerConnector(myConnector);

    $(document).ready(function () {
        $("#submitButton").click(function () {
            var data = {
                startDate: $('#start-date-one').val().trim(),
                endDate: $('#end-date-one').val().trim(),
                tagName: $('#tag-name').val().trim(),
                dataType: $('#data-type').val().trim()
            };

            tableau.connectionData = JSON.stringify(data);
            tableau.connectionName = "Trendminer Chart Data";
            tableau.submit();
        });
    });
})();