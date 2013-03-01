$(document).ready(function() {
    $("#snapshot_request").click( function() {
        requestSingleSnapshot();
        checkForNewSnapshot();
    });
});
     
    // time interval
    var beginTime = -1;
    var endTime = -1;
    
    var lastId = -1;    // last activity chunk received from the server
    var chunkSize = 0;  // current acitivity chunk size


    /**
    * main thread
    *
    * @method monitor
    * @param   
    * @return
    */
    var getActivityData = function() {
        console.log("= = = = = = = = = =");
        console.log("fetching new data...");
        
        if (beginTime < 0 || endTime < 0) {
            $.get('/activity_logs.json', 
                function(data) {
                    parseActivityData( data );
                    setTimeout( function() { getActivityData() }, 3000);  
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
                    parseActivityData( data );
                    setTimeout( function() { getActivityData() }, 3000);  
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
    var parseActivityData = function( data ) {

        if (data.length > 0) {
            last_entry = data[data.length-1];
        
            beginTime = last_entry.created_at;
            endTime = last_entry.updated_at;
        }

        for (var i = 0; i < data.length; i++) {
            levels = data[i].level.split(" ");            
            nLevels = levels.length;
            
            // new activity chunk
            if (data[i].id > lastId) {
                
                addActivityChunk(data[i].id);
                lastId = data[i].id;
                chunkSize = 0;
                addSeparatorBar();
            }
            
            if (data[i].id == lastId) {
                for (var j = chunkSize; j < nLevels; j++) {
                    addLevelBar(levels[j], 0, 0, 0, data[i].id);
                    chunkSize
                    chunkSize++;
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
    var addLevelBar = function(level, beginTime, endTime, chunkSize, chunkId) {
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
    var addSeparatorBar = function() {
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
    var addActivityChunk = function(chunkId) {
        var chunk = jQuery('<div/>', {
            id: 'chunk_'+chunkId,
            class: 'activity_chunk'
        }).prependTo('#monitor_timeline');        
        
        $(chunk).css("position", "relative");

        $(chunk).click( function() {
            getSnapshots( chunkId );
        });
    }


    /**
    * get snapshots
    *
    * @method getSnapshots
    * @param   
    * @return
    */
    var getSnapshots = function( activityLogId ) {
    
        $.get('/activity_logs/'+activityLogId+'.json', 
            function(data) {
                showSnapshots( data );      
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
    var showSnapshots = function( data ) {           
        
        snapshots = data.snapshots

        openSnapshotsContainer(data.activity_log);

        for (var i = 0; i < snapshots.length; i++) {
            var img_data = snapshots[i].img_data;

            displayImage({
                img_data: img_data, 
                datetime: snapshots[i].updated_at 
            });
        }
    }

    var openSnapshotsContainer = function(data) {
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
            closeSnapshotsContainer();
        });

        var createdAt = new Date(data.created_at);
        var updatedAt = new Date(data.updated_at);

        $("#snapshots_container_side_window").append("<br><br> begin: " + createdAt + "<br>");
        $("#snapshots_container_side_window").append("end: " + updatedAt);
    }


    var closeSnapshotsContainer = function() {
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


    var addDatetimeToDiv = function ( args ) {

        var localDate = new Date( args.datetime );
        jQuery('<div/>', {
            html: localDate,
            class: 'snapshot_datetime'
        }).appendTo( args.div );
    }


    var displayImage = function( args ) {

        var img = new Image();
        img.src = args.img_data;
        
        var imgDiv = jQuery('<div/>', {
            class: 'snapshot'
        });    
        
        imgDiv.html(img);
        
        addDatetimeToDiv({ 
            div: imgDiv,
            datetime: args.datetime
        });

        $("#snapshots_container").prepend( imgDiv );
    }

    
    var requestSingleSnapshot = function() {
        $.post('/snapshot/request.json', 
            function(data) {
                // console.log(data);
            }
        ); 
    }


   var grabSingleSnapshot = function() {
        $.get('/snapshot/grab.json', 
            function(data) {
                var img_data = data.img_data;
                var img = new Image();

                img.src = img_data;
                
                var imgDiv = $("#requested_snapshot");

                if ( !$(imgDiv).id ) {
                    imgDiv = jQuery('<div/>', {
                        id: 'requested_snapshot',
                        class: 'snapshot'
                    });    
                }
                
                imgDiv.html(img);

                addDatetimeToDiv({ 
                    div: imgDiv,
                    datetime: data.taken_at
                });

                $("#monitor_side_window").append( imgDiv );

            }
        ); 
    }

    var checkForNewSnapshot = function() {
         $.get('/snapshot/check.json', 
            function(data) {
                console.log(data);
                if (data.new) {
                    setTimeout( checkForNewSnapshot, 1000 );
                }
                else {
                    grabSingleSnapshot();
                }
            }
        );
    }

    // launches monitor thread
    getActivityData();


