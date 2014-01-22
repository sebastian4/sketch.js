console.log("starting sketch");

$(function () {

    var pollLapse = 2000;
    var pollStop = 20000;
    var pIndex = 0;

    var timedPoll = null;

    var hrefLocation = getServerLocation();

    $.each(['#f00', '#ff0', '#0f0', '#0ff', '#00f', '#f0f', '#000', '#fff'], function () {
        $('#colors_demo').append("<a href='#colors_sketch' data-color='" + this + "' style='width: 10px; background: " + this + ";'>__</a> ");
    });
    $.each([3, 5, 10, 15], function () {
        $('#colors_demo').append("<a href='#colors_sketch' data-size='" + this + "' style='background: #ccc'>" + this + "</a> ");
    });
    $('#colors_sketch').sketch();

    ////

    $('button#show-ocr-tools-core').on('click', function () {
        $('#overhead-ocr-tools-core').toggle('slow');
        console.log('ocr tools toggle');
    });
    $('#ocr-canvas').sketch();

    $('button#ocr-tool-submitimage').on('click', function () {

        var randomName = 'img' + getDateAndRandomNumber();

        var ajaxSubmitValue = {
            name: randomName + '.png',
            value: localStorage.getItem("currentImage")
        };

        var waitingWarning = "please wait until results come back";

        var resultWarning1 = "Click the following link:";
        var resultWarning2 = "Click the following link. For best results " + "wait for about 30 seconds, then click on the link.";

        $.ajax({
            url: "scripts/getresponse.txt",
            type: "get",
            //contentType: "application/octet-stream",
            //dataType: "text",
            data: JSON.stringify(ajaxSubmitValue),
            success: function (data) {
                console.log("ajax success");
                hrefLocation = getServerLocation() + '/' + data;
                console.log(hrefLocation);
                $("#ocr-tool-result").html('<img src="images/load3.gif" title="' + waitingWarning + '">');
                timedPoll = setInterval(function () {
                    timedPollCall();
                }, pollLapse);
            },
            error: function () {
                console.log("ajax failure");
                $("#ocr-tool-result").html('error in submission');
            }
        });

    });

    function timedPollCall() {

        pIndex++;
        if ((pIndex * pollLapse) > pollStop) {
            stopTimedPollCall();
        };

        $.ajax({
            url: hrefLocation,
            type: "get",
            //dataType: "text",
            success: function (response) {
                console.log("ajax success, time passed = " + (pIndex * pollLapse));
                if (checkToStopPolling(response)) {
                    changeResultToButton(response);
                };
            },
            error: function (response) {
                console.log("ajax error");
            }
        });
    }

    function changeResultToButton(response) {
        clearInterval(timedPoll);
        $("#ocr-tool-result").html('<div>result:</div><div title="this is the ocr result">' + response + '</div>');
    }

    function checkToStopPolling(response) {
        console.log("response =" + response);
        return (response !== null && response.length > 0);
    }

    function stopTimedPollCall() {
        clearInterval(timedPoll);
        $("#ocr-tool-result").html('<div>Result taking too long.</div>');
    }


    function getServerLocation() {
        var currurl = window.location.protocol + '//' + window.location.host;
        //+ window.location.pathname;
        return currurl;
    }

    function getDateAndRandomNumber() {
        var randomNumber = Math.floor((Math.random() * 89) + 10); // 10 to 99
        var currdate = new Date();
        return '-' + currdate.valueOf() + randomNumber;
    }
    
    //
    
    $("#ocr-tools-console-2").click(function() {
        $('#ocr-tools-console-a').click();
    });
        

});