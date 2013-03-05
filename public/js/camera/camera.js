/*
Copyright (c) 2013 Manuel Guerra
http://macroscopio.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


/**
* class Camera
*
* handles camera stream
* applies image processing pipeline
* posts activity log and snapshots
*/ 
function Camera() {
    
    this.thresholdVal = 30;         // image threshold [0..255]

    this.activityThreshold = 0.1;   // min % of diff pixels detected 
                                    // [0..1] - 0: min threshold, 1: max threshold

    this.video = null;      // camera stream
    this.canvas = null;     // main canvas
    this.diffCanvas = null; // diff image canvas
    this.ctx = "";          // main canvas context
    this.diffImageCtx = ""; // diff image canvas context   

    this.pixFlow = 0;       // number of diff pixels detected

    this.lastPosted = 0;    // keeps track of the interval between posts
    
    this.verbose = true;    // enables debug messages to the console


    /**
    * init
    * 
    * setups gui
    * starts camera
    * launches camera status thread
    * launches snapshot request thread
    * launches main thread
    *
    * @namespace Camera
    * @method init
    */
    this.init = function() {
        var self = this;

        this.setupGui();
        this.getCamera(); 
        this.updateCameraStatus();
        this.checkForNewSnapshotRequest();
        setInterval( function() { self.main(); }, 50 );
    }

    /**
    * main
    * main pipeline
    * 
    * grabs frame, 
    * applies image processing pipeline
    * updates canvas and gui
    * detects activity
    * posts activity log
    *
    * @namespace Camera
    * @method main
    */
    this.main = function() {

        var prevFrame = this.ctx.getImageData(0,0, 320,240);
        this.ctx.drawImage( this.video, 0, 0, 320, 240);
        var currFrame = this.ctx.getImageData(0,0, 320,240);

        var grayScaleFrame = ImageUtils.toGrayscale(currFrame);
        var diffImage = ImageUtils.imgDiff(prevFrame, currFrame);
        var diffMask = ImageUtils.threshold({
            img: diffImage, 
            val: this.thresholdVal
        });
        var erodeMask = ImageUtils.erode({
            img: diffMask, 
            kernel: 1
        });

        this.ctx.putImageData(grayScaleFrame, 0,0);
        this.diffImageCtx.putImageData(erodeMask, 0,0);

        var activity = ImageUtils.countPixels(erodeMask);

        this.pixFlow = this.pixFlow + ( activity - this.pixFlow )/2.0;
        var c = this.pixFlow/(32.0 * 24.0);
        this.activityAlert(c);
        
        c = c + "%";
        $("#activ_bar").css("width", c);      
    }


    /**
    * activityAlert
    * posts activity log if level is above threshold
    *
    * @namespace Camera
    * @method activityAlert
    * @param {Integer}    activity: Activity level [0..1]
    */
    this.activityAlert = function( activity ) {

        if (activity > this.activityThreshold) {
            $("#alert").show();
            var now = new Date();
            this.postActivity({ 
                level:activity, 
                datetime:now 
            });
        }
        else {
            $("#alert").hide();
        }
    }


    /**
    * setupGui
    * intializes GUI
    *
    * @namespace Camera
    * @method setupGui
    */    
    this.setupGui = function() {
        var self = this;

        this.video = $("#live").get()[0];
        this.canvas = $("#canvas");
        this.diffCanvas = $("#diff_canvas");
        this.ctx = this.canvas.get()[0].getContext('2d');
        this.diffImageCtx = this.diffCanvas.get()[0].getContext('2d');

        $( "#threshold" ).slider({
            value: this.thresholdVal,
            orientation: "horizontal",
            max: 150,
            range: "min",
            animate: true,
            slide: function() { self.setThreshold() },
            change: function() { self.setThreshold() }        
        });
    }

    
   /**
    * getCamera
    * starts camera stream
    *
    * @namespace Camera
    * @method getCamera
    */
    this.getCamera = function() {
        var self = this;

        window.navigator.webkitGetUserMedia( {video:true},
            function(stream) {
                self.video.src = webkitURL.createObjectURL(stream);
            },
            function(err) {
                if (self.verbose) {
                    console.log("Unable to get video stream!");
                }
            }
        );
    }
    

   /**
    * setThreshold
    * callback for threshold scroll controller
    *
    * @namespace Camera
    * @method setThreshold
    */    
    this.setThreshold = function() {
        this.thresholdVal = $("#threshold").slider("value");       
    }


   /**
    * postActivity
    * posts activity level and datetime using ajax
    *
    * @namespace Camera
    * @method countPixels
    * @param {ImageData}    img: Input image
    * @return {int}         Non zero pixels count
    */  
    this.postActivity = function( args ) {
        var self = this;

        var level = args.level;
        var datetime = args.datetime;

        var date = new Date();
        var time = date.getTime();
        
        if (time - this.lastPosted < 800) {
            return;
        }
        
        this.lastPosted = time;
        
        var img = this.captureImage();

        $.post('/activity_logs.json', 
            {
                level:      level,
                datetime:   datetime,
                image:      img
            }
        );
    }


   /**
    * updateCameraStatus
    * tells server camera is online
    *
    * @namespace Camera
    * @method updateCameraStatus
    */      
    this.updateCameraStatus = function() {
        var self = this;

        if ( self.verbose ) {
            console.log ("updating status...");
        }

        $.post('/camera/status.json', {},
             function( data ) {
                 setTimeout( function(){ self.updateCameraStatus(); }, 1000 );
             }
        );
    }

   /**
    * captureImage
    * converts canvas data into jpeg image
    *
    * @namespace captureImage
    * @method updateCameraStatus
    * @return {String}  Jpeg data stream
    */     
    this.captureImage = function() {

        // compression rate: 0.5
        var img = this.canvas[0].toDataURL("image/jpeg", 0.5);

        return img;
    }
    

   /**
    * checkForNewSnapshotRequest
    * checks for new snapshot requests
    *
    * @namespace Camera
    * @method checkForNewSnapshotRequest
    */     
    this.checkForNewSnapshotRequest = function() {
        var self = this;

        if (this.verbose) {
            console.log("checking for new snapshot request...");
        }
 
        $.get('/snapshot/check.json', 
            function(data) {
                if (data.new) {
                    if (self.verbose) {
                        console.log("new snapshot requested");
                    }
                    self.uploadSnapshot();
                }
                else {
                  
                }
                setTimeout( function() { self.checkForNewSnapshotRequest(); }, 1000 ); 
            }
        );
    }    


   /**
    * uploadSnapshot
    * checks for new snapshot requests
    * posts snapshot
    *
    * @namespace Camera
    * @method uploadSnapshot
    */     
    this.uploadSnapshot = function() {
        var self = this;

        if (self.verbose) {
            console.log("uploading snapshot...");
        }
        var img = this.captureImage();

        $.post('/snapshot/upload.json', 
            {
                image:  img
            },
            function(data) {
                if (self.verbose) {
                    console.log("snapshot uploaded");
                }
            }
        );
    }
    
}
