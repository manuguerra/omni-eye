$(document).ready(function() {

    var monitor = new Monitor();
    monitor.init();

    $("#snapshot_request").click( function() {

        var imgDiv = $("#requested_snapshot");

        if ( imgDiv.length == 0 ) {
            imgDiv = jQuery('<div/>', {
                id: 'requested_snapshot',
                class: 'snapshot'
            });    
        }
        
        imgDiv.html("<img src = '/assets/spinner.gif'/>");

        imgDiv.appendTo("#monitor_side_window");
        
        monitor.requestSingleSnapshot();
        monitor.checkForNewSnapshot();
    });

});
     


function Monitor() {    
    // time interval
    this.beginTime = -1;
    this.endTime = -1;
    
    this.lastId = -1;    // last activity chunk received from the server
    this.chunkSize = 0;  // current acitivity chunk size
    
    this.init = function() {
        // launches monitor thread
        this.getActivityData();
        this.checkCameraStatus();
    }

    /**
    * main thread
    *
    * @method monitor
    * @param   
    * @return
    */
    this.getActivityData = function() {
        console.log("= = = = = = = = = =");
        console.log("fetching new data...");
        
        var self = this;

        if (this.beginTime < 0 || this.endTime < 0) {
            $.get('/activity_logs.json', 
                function(data) {
                    self.parseActivityData( data );
                    setTimeout( function() { self.getActivityData() }, 3000);  
                }
            );
        }
        else {
            $.get('/activity_logs.json', 
                {
                    // begin: beginTime,
                    // end: endTime
                },
                function(data) {
                    self.parseActivityData( data ); 
                    setTimeout( function() { self.getActivityData() }, 2000);  
                }
            );
        }    
    }


    /**
    * parse activity data
    *
    * parses json activity data response from server
    * composes the activity monitor graph
    *
    * @method parseActivityData
    * @param data: ActivityLog json response from server
    * @return
    */
    this.parseActivityData = function( data ) {
        
        if (data.length > 0) {
            var last_entry = data[data.length-1];
        
            this.beginTime = last_entry.created_at;
            this.endTime = last_entry.updated_at;
        }
        
        for (var i = 0; i < data.length; i++) {
            var levels = data[i].level.split(" ");            
            var nLevels = levels.length;
            
            // new activity chunk
            if (data[i].id > this.lastId) {
                
                this.addActivityChunk(data[i].id);
                this.lastId = data[i].id;
                this.chunkSize = 0;
                this.addSeparatorBar();
            }

            if (data[i].id == this.lastId) {
                for (var j = this.chunkSize; j < nLevels; j++) {
                    this.addLevelBar(levels[j], 0, 0, 0, data[i].id);
                    this.chunkSize++;
                }
            }
        }
    }

    /**
    * add level bar
    *
    * parses json activity data response from server
    * composes the activity monitor graph
    *
    * @method addLevelBar
    * @param level: 
    * @param beginTime:
    * @return
    */
    this.addLevelBar = function(level, beginTime, endTime, chunkSize, chunkId) {
        
        //var level = args.level;

        var bar = jQuery('<div/>', {
            id: '',
            class: 'level_bar'
        }).prependTo('#chunk_'+chunkId);        

        level = 3*parseFloat(level);
        if (level < 2) level = 2;
        else if (level > 100) level = 100;

        //$(bar).css("position", "relative");
        // $(bar).css("width", level+"%");
        $(bar).css("height", level+"%");
        $(bar).css("top", (100-level)+"%");
    }


    /**
    * add separator bar
    * 
    * @method addSeparatorBar
    * @param 
    * @return
    */
    this.addSeparatorBar = function() {
        var bar = jQuery('<div/>', {
            id: '',
            class: 'separator_bar',
        }).prependTo('#monitor_timeline'); 
    }


    /**
    * add new activity chunk
    * 
    * @method addActivityChunk 
    * @param 
    * @return
    */
    this.addActivityChunk = function(chunkId) { 
        
        var self = this;

        var chunk = jQuery('<div/>', {
            id: 'chunk_'+chunkId,
            class: 'activity_chunk'
        }).prependTo('#monitor_timeline');        

        $(chunk).click( function() {
            self.getSnapshots( chunkId );
        });
    }


    /**
    * get snapshots
    *
    * @method getSnapshots
    * @param   
    * @return
    */
    this.getSnapshots = function( activityLogId ) {
        
        var self = this;

        var spinner = jQuery('<div/>', {
            class: 'spinner',
            html: "<img src = 'assets/loading_bar.gif'/>"
        });
        spinner.appendTo( "#monitor_side_window" );

        $.get('/activity_logs/'+activityLogId+'.json', 
            function(data) {
                $(".spinner").remove();
                self.showSnapshots( data );      
            }
        );
    }

    /**
    * show snapshots
    *
    * @method showSnapshots
    * @param  
    * @return
    */
    this.showSnapshots = function( data ) {           
        
        var snapshots = data.snapshots

        this.openSnapshotsContainer(data.activity_log);

        for (var i = 0; i < snapshots.length; i++) {
            var img_data = snapshots[i].img_data;

            this.displayImage({
                img_data: img_data, 
                datetime: snapshots[i].updated_at 
            });
        }
    }

    this.openSnapshotsContainer = function(data) {
        var self = this;

        var container = $("#snapshots_container");

        if (container.length > 0) {
            $(container).empty();
            $("#snapshots_container_side_window").empty();
        }
        else {
            jQuery('<div/>', {
                id: 'snapshots_container'
            }).appendTo("#monitor_side_window"); 

            jQuery('<div/>', {
                id: 'snapshots_container_side_window'
            }).appendTo("#monitor_side_window");
        }  

        var closeButton = jQuery('<button/>', {
            type: 'button',
            class: 'btn btn-mini btn-info',
            html: "x close window"
        });

        closeButton.appendTo("#snapshots_container_side_window");
        closeButton.click( function() {
            self.closeSnapshotsContainer();
        });

        var createdAt = new Date(data.created_at);
        var updatedAt = new Date(data.updated_at);

        $("#snapshots_container_side_window").append("<br><br> begin: " + createdAt + "<br>");
        $("#snapshots_container_side_window").append("end: " + updatedAt);
    }


    this.closeSnapshotsContainer = function() {
        var container = $("#snapshots_container");
        
        if (container) {
            $(container).fadeOut( 
                    function() {
                         $(container).remove();
                    }
            );
            $("#snapshots_container_side_window").fadeOut(
                    function() {
                         $("#snapshots_container_side_window").remove();
                    }
            );
        }
    }


    this.addDatetimeToDiv = function ( args ) {

        var localDate = new Date( args.datetime );
        jQuery('<div/>', {
            html: localDate,
            class: 'snapshot_datetime'
        }).appendTo( args.div );
    }


    this.displayImage = function( args ) {

        var img = new Image();
        img.src = args.img_data;
        
        var imgDiv = jQuery('<div/>', {
            class: 'snapshot'
        });    
        
        imgDiv.html(img);
        
        this.addDatetimeToDiv({ 
            div: imgDiv,
            datetime: args.datetime
        });

        $("#snapshots_container").prepend( imgDiv );
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

                addDatetimeToDiv({ 
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
}
