var lastPatient;
var currentPatient = {
    uid: "",
    HRValues: {},
    dataAvailable: 0,
    hoursStressed: 0,
    detailedStressData: {}
};

function loadData(user) {

    firebase.database().ref('/Therapists/' + user.uid + '/').once('value').then(function (snapshot) {
        if (snapshot.val()) {
            if(snapshot.child("email").val() !== null ) {
                $("#therapistID").append(snapshot.child("email").val());
            }
            var patients = snapshot.child("patients").val();
            for (var key in patients) {
                if (patients.hasOwnProperty(key)) {
                    $("#patientList").append('<a href="#" onClick="selectPatient(this)" class="list-group-item list-group-item-action" id="'+key+'" role="tab" data-toggle="list">' + patients[key] + '</a>');
                }
            }
        }
    });
}

function selectPatient(keyEle) {
    $("#StressData").removeClass('active');
    $("#HRData").removeClass('active');

    var dataAreaVar=$("#dataArea");
    var hourStressedAreaVar=$("#hoursStressedArea");
    if (lastPatient) {
        if (lastPatient === keyEle) {
            return;
        }
        else {
            dataAreaVar.hide();
            hourStressedAreaVar.hide();
            dataAreaVar.html();
            hourStressedAreaVar.html();
            keyEle.classList.add('active');
            lastPatient.classList.remove('active');
            lastPatient = keyEle;
        }
    }
    else {
        dataAreaVar.hide();
        hourStressedAreaVar.hide();
        dataAreaVar.html();
        hourStressedAreaVar.html();

        lastPatient = keyEle;
        keyEle.classList.add('active');
    }
    currentPatient.uid = keyEle.id;
    firebase.database().ref('/Wearers/' + currentPatient.uid + '/').once('value').then(function (snapshot) {

        if (snapshot.val()) {

            if (snapshot.child("PhysiologicalAttributes").val()) {
                if (snapshot.child("PhysiologicalAttributes").child("HR").val()) {
                    currentPatient.HRValues = snapshot.child("PhysiologicalAttributes").child("HR").val();
                }
            }
            if (snapshot.child("Data_Available").val()) {
                currentPatient.dataAvailable = snapshot.child("Data_Available").val();
            }
            if (snapshot.child("Hours_Stressed").val()) {
                currentPatient.hoursStressed = snapshot.child("Hours_Stressed").val();
            }
            if (snapshot.child("Detailed_Stress_Data").val()) {
                currentPatient.detailedStressData = snapshot.child("Detailed_Stress_Data").val();
            }

            displayData();

        }
        else {
            currentPatient.detailedStressData = {};
            currentPatient.hoursStressed = 0;
            currentPatient.dataAvailable = 0;
            currentPatient.HRValues = {};

            displayData();
        }
    });

}
function loadStressGraph(){

    $("#StressData").addClass('active');
    $("#HRData").removeClass('active');
    google.charts.load('current', {'packages': ['corechart']});

    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
        var dataAreaVar = $("#dataArea");
        dataAreaVar.show();

        var hrData = [['Time', '% of hour stressed']];
        var rawHRArray = [];
        console.log(currentPatient.detailedStressData);
        Object.keys(currentPatient.detailedStressData).forEach(function (k) {

            var json = {};
            json[k] = parseFloat(currentPatient.detailedStressData[k]);
            rawHRArray.push(json);
        });

        rawHRArray.sort(function (a, b) {
            return new Date(Object.keys(a)) - new Date(Object.keys(b));
        });

        for (var index= 0; index < rawHRArray.length ; index++){
            var keySplit = Object.keys(rawHRArray[index]);
            keySplit = keySplit[0].split(" ");
            var timeSplit = keySplit[3].split(":");
            var xValue = keySplit[2] + " " + keySplit[1] + " " + timeSplit[0]+":00";
            var yValue = parseInt(rawHRArray[index][Object.keys(rawHRArray[index])]);
            hrData.push([xValue,yValue]);
        }
        var data = google.visualization.arrayToDataTable(hrData);

        var options = {
            title: 'Stress data',
            chartArea: {'width': '90%', 'height': '70%'},
            legend: {position: 'bottom'}
        };
        console.log(data);
        var chart = new google.visualization.LineChart(document.getElementById("dataAreaGraph"));

        chart.draw(data, options);
    }
}
function loadHRGraph(){
    $("#StressData").removeClass('active');
    $("#HRData").addClass('active');
    google.charts.load('current', {'packages': ['corechart']});

    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
        var dataAreaVar = $("#dataArea");
        dataAreaVar.show();

        var hrData = [['Time', 'Heart rate']];
        var rawHRArray = [];
        Object.keys(currentPatient.HRValues).forEach(function (k) {
            var json = {};
            json[k] = parseInt(currentPatient.HRValues[k]['heartRate']);
            rawHRArray.push(json);
        });

        rawHRArray.sort(function (a, b) {
            return new Date(Object.keys(a)) - new Date(Object.keys(b));
        });
        for (var index= 0; index < rawHRArray.length ; index++){
            var keySplit = Object.keys(rawHRArray[index]);
            keySplit = keySplit[0].split(" ");
            var timeSplit = keySplit[3].split(":");
            console.log(timeSplit);
            var xValue = keySplit[2] + " " + keySplit[1] + " " + timeSplit[0]+":00";
            var yValue = parseInt(rawHRArray[index][Object.keys(rawHRArray[index])]);
            hrData.push([xValue,yValue]);
        }

        var data = google.visualization.arrayToDataTable(
            hrData
        );

        var options = {
            title: 'Heart rate data',
            curveType: 'function',
            chartArea: {'width': '90%', 'height': '70%'},
            legend: {position: 'bottom'}
        };

        var chart = new google.visualization.LineChart(document.getElementById("dataAreaGraph"));

        chart.draw(data, options);
    }
}

function displayData() {
    var noDataVar = $("#NoDataAvailable");
    var stressDataVar = $("#StressData");
    var hrDataVar = $("#HRData");
    var hoursStressedAreaVar = $("#hoursStressedArea");
    noDataVar.hide();
    stressDataVar.hide();
    hrDataVar.hide();
    if (currentPatient.dataAvailable !== 0) {
        hoursStressedAreaVar.html("<h3>"+ currentPatient.hoursStressed + " out of " + currentPatient.dataAvailable + " hours stressed" + "</h3>");
        hoursStressedAreaVar.show();
    }
    $("#availableDataId").show();
    if (Object.keys(currentPatient.detailedStressData).length === 0 && Object.keys(currentPatient.HRValues).length === 0) {
        noDataVar.show();
    }
    if (Object.keys(currentPatient.detailedStressData).length !== 0) {
        stressDataVar.show();
    }
    if (Object.keys(currentPatient.HRValues).length !== 0) {
        hrDataVar.show();
    }




}