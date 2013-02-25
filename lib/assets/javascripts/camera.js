$(document).ready(function() {

    window.navigator.webkitGetUserMedia( {video:true},
            function(stream) {
                video.src = webkitURL.createObjectURL(stream);
            },
            function(err) {
                console.log("Unable to get video stream!")
            }
    )

    var thresholdVal = 30;
    var activityThreshold = 0.1;

    var video = $("#live").get()[0];
    var canvas = $("#canvas");
    var diffCanvas = $("#diff_canvas");

    var ctx = canvas.get()[0].getContext('2d');
    var diffImageCtx = diffCanvas.get()[0].getContext('2d');

    var pixArray = [];

    var pixFlow = 0;

    var lastPosted = 0;

    function setThreshold() {
        thresholdVal = $("#threshold").slider("value");       
    }

    $( "#threshold" ).slider({
        value: thresholdVal,
        orientation: "horizontal",
        max: 150,
        range: "min",
        animate: true,
        slide: setThreshold,
        change: setThreshold        
    });


    function activityAlert( activity ) {

        if (activity > activityThreshold) {
            $("#alert").show();
            var now = new Date();
            postActivity( activity, now );
        }
        else {
            $("#alert").hide();
        }
    }

    /**
    * main thread
    * grabs frame and outputs it to the image processing pipeline
    * sleeps for 50 msec after each iteration
    *
    * @namespace 
    * @method main
    * @param   
    * @return
    */  
    var main = setInterval(
            function () {
            
                var prevFrame = ctx.getImageData(0,0, 320,240);
                ctx.drawImage(video, 0, 0, 320, 240);
                var currFrame = ctx.getImageData(0,0, 320,240);

                var grayScaleFrame = toGrayscale(currFrame);
                var diffImage = imgDiff(prevFrame, currFrame);
                var diffMask = threshold(diffImage, thresholdVal);
                var erodeMask = erode(diffMask, 1);

                ctx.putImageData(grayScaleFrame, 0,0);
                diffImageCtx.putImageData(erodeMask, 0,0);

                var activity = countPixels(erodeMask);

                pixFlow = pixFlow + ( activity - pixFlow )/2.0;
                var c = pixFlow/(32.0 * 24.0);
                activityAlert(c);
                
                c = c + "%";
                $("#activ_bar").css("width", c);
            },          
            50
        );

    /**
    * postActivity
    * posts activity level and datetime using ajax
    *
    * @namespace
    * @method countPixels
    * @param {ImageData}    img: input image
    * @return {int}         non zero pixels count
    */  
    var postActivity = function( level, datetime ) {
        var date = new Date();
        var time = date.getTime();
        
        if (time - lastPosted < 800) {
            return;
        }
        lastPosted = time;

        $.post('/activity_logs.json', 
            {
                level:      level,
                datetime:   datetime,
                image:      capture_image()
            },
            "json"
        );
    }

    var capture_image = function() {
        var canvas = document.getElementById('canvas')
        var context = canvas.getContext("2d");
        var img     = canvas.toDataURL("image/jpeg", 0.5);
        // var item_image = img.replace(/^data:image/jpeg;base64,/, "") ;
        // return item_image;
        // display_image(img);
        return img
    }

    var display_image = function( img_data ) {
        var img = new Image();
        img.src = img_data;
        $("body").append( img );
    }
});


