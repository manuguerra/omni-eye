var MonitorUtils = {
    
    addDatetimeToDiv: function ( args ) {
        var localDate = new Date( args.datetime );
        jQuery('<div/>', {
            html: localDate,
            class: 'snapshot_datetime'
        }).appendTo( args.div );
    }
}



function RemoteCamera() {

    this.init = function() {
        this.checkCameraStatus();
    }

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

    this.requestSingleSnapshot = function() {
        $.post('/snapshot/request.json', 
            function(data) {
                // console.log(data);
            }
        ); 
    }

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




