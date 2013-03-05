/*
Copyright (c) 2013 Manuel Guerra
http://macroscopio.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


/**
* class RemoteCamera
*
* gets & displays status from remote camera
* requests snapshot from remote camera
*/ 
function RemoteCamera() {

   /**
    * init
    * 
    * launches main thread
    *
    * @namespace RemoteCamera
    * @method init
    */
    this.init = function() {
        this.checkCameraStatus();
    }

   /**
    * checkCameraStatus
    * 
    * polls server for camera status
    *
    * @namespace RemoteCamera
    * @method checkCameraStatus
    */    
    this.checkCameraStatus = function() {
        
        var self = this;
        console.log("checking camera status...");

        $.get("/camera/status.json",
            function( data ) {
                
                if (data.live) {
                    $("#camera_status").html( "camera is online" );
                    $("#camera_last_seen").html( "" );
                    $("#camera_ip").html( "on ip: " + data.ip );

                    if ( !$("#snapshot_request").is(":visible") ) {
                         $("#snapshot_request").fadeIn();
                    }
                }
                else {
                    $("#camera_status").html( "camera is offline" );
                    var date = new Date( data.last_seen );
                    $("#camera_last_seen").html( "last seen: " + date );
                    $("#camera_ip").html( "on ip: " + data.ip );

                    if ( $("#snapshot_request").is(":visible") ) {
                         $("#snapshot_request").fadeOut();
                    }                    
                }
                
                setTimeout( function() { self.checkCameraStatus(); }, 5000 );
            }
        );
    }

   /**
    * requestSingleSnapshot
    * 
    * posts a snapshot request
    *
    * @namespace RemoteCamera
    * @method requestSingleSnapshot
    */      
    this.requestSingleSnapshot = function() {
        $.post('/snapshot/request.json', 
            function(data) {
                // console.log(data);
            }
        ); 
    }

   /**
    * grabSingleSnapshot
    * 
    * gets and displays new requested snapshot
    *
    * @namespace RemoteCamera
    * @method grabSingleSnapshot
    */ 
    this.grabSingleSnapshot = function() {
        $.get('/snapshot/grab.json', 
            function(data) {
                var img_data = data.img_data;
                var img = new Image();
                img.src = img_data;
                
                var imgDiv = $("#requested_snapshot");
                
                imgDiv.html(img);

                MonitorUtils.addDatetimeToDiv({ 
                    div: imgDiv,
                    datetime: data.taken_at
                });

                $("#monitor_side_window").append( imgDiv );
            }
        ); 
    }

   /**
    * checkForNewSnapshot
    * 
    * checks if new snapshot is ready
    *
    * @namespace RemoteCamera
    * @method checkForNewSnapshot
    */    
    this.checkForNewSnapshot = function() {
        var self = this;
        $.get('/snapshot/check.json', 
            function(data) {
                if (data.new) {
                    setTimeout( function() { self.checkForNewSnapshot(); }, 1000 );
                }
                else {
                    self.grabSingleSnapshot();
                }
            }
        );
    }
}




