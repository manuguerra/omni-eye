$(document).ready(function() {

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
        // console.log("fetching new data...");

        if (beginTime < 0 || endTime < 0) {
            $.get('/activity_logs.json', 
                function(data) {
                    parseActivityData( data );
                    setTimeout( function() { getActivityData() }, 1000);                    
                }
            );
        }
        else {
            $.get('/activity_logs.json', 
                {
                    begin: beginTime,
                    end: endTime
                },
                function(data) {
                    parseActivityData( data );
                    setTimeout( function() { getActivityData() }, 1000);
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
        
            beginTime = last_entry.updated_at;
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
            
            // adds level bars
            for (var j = chunkSize; j < nLevels; j++) {
                addLevelBar(levels[j], 0, 0, 0, data[i].id);
                chunkSize
                chunkSize++;
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
            //width: '100px',
            //height: '5px'
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
        $("#monitor_side_window").empty();

        $.get('/activity_logs/'+activityLogId+'.json', 
            function(data) {
                showSnapshots( data.snapshots );      
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
    var showSnapshots = function( snapshots ) {
        for (var i = 0; i < snapshots.length; i++) {
            var img_data = snapshots[i].img_data;
            displayImage( img_data );
        }
    }


    var displayImage = function( img_data ) {
        var img = new Image();
        img.src = img_data;
        $("#monitor_side_window").prepend( img );
    }


    // launches monitor thread
    getActivityData();
