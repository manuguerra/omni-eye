function Camera() {
    
    this.thresholdVal = 30;
    this.activityThreshold = 0.1;

    this.video = null;
    this.canvas = null;
    this.diffCanvas = null;

    this.ctx = "";
    this.diffImageCtx = "";

    this.pixArray = [];

    this.pixFlow = 0;

    this.lastPosted = 0;

    this.verbose = true;

    this.init = function() {
        var self = this;

        this.setupGui();
        this.getCamera(); 
        this.updateCameraStatus();
        this.checkForNewSnapshotRequest();
        setInterval( function() { self.main(); }, 50 );
    }

    this.main = function() {
        var prevFrame = this.ctx.getImageData(0,0, 320,240);
        this.ctx.drawImage( this.video, 0, 0, 320, 240);
        var currFrame = this.ctx.getImageData(0,0, 320,240);

        var grayScaleFrame = toGrayscale(currFrame);
        var diffImage = imgDiff(prevFrame, currFrame);
        var diffMask = threshold(diffImage, this.thresholdVal);
        var erodeMask = erode(diffMask, 1);

        this.ctx.putImageData(grayScaleFrame, 0,0);
        this.diffImageCtx.putImageData(erodeMask, 0,0);

        var activity = countPixels(erodeMask);

        this.pixFlow = this.pixFlow + ( activity - this.pixFlow )/2.0;
        var c = this.pixFlow/(32.0 * 24.0);
        this.activityAlert(c);
        
        c = c + "%";
        $("#activ_bar").css("width", c);      
    }


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
    
   this.setThreshold = function() {
        this.thresholdVal = $("#threshold").slider("value");       
    }


  /**
    * postActivity
    * posts activity level and datetime using ajax
    *
    * @namespace
    * @method countPixels
    * @param {ImageData}    img: input image
    * @return {int}         non zero pixels count
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

    this.captureImage = function() {
        var img = this.canvas[0].toDataURL("image/jpeg", 0.5);

        return img;
    }
    

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
