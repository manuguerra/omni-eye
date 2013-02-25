$(document).ready(function() {


});
     

    var beginTime = -1;
    var endTime = -1;
    
    var lastId = -1;
    var chunkSize = 0;

    /**
    * main thread
    *
    * @namespace 
    * @method monitor
    * @param   
    * @return
    */
    var getActivityData = function() {
        console.log("fetching new data...");

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

    var parseActivityData = function( data ) {

        if (data.length > 0) {
            last_entry = data[data.length-1];
        
            beginTime = last_entry.updated_at;
            endTime = last_entry.updated_at;
        }
        
        for (var i = 0; i < data.length; i++) {
            levels = data[i].level.split(" ");
            
            nLevels = levels.length;
            
            if (data[i].id > lastId) {
                lastId = data[i].id;
                chunkSize = 0;
                addSeparatorBar();
            }

            for (var j = chunkSize; j < nLevels; j++) {
                addLevelBar(levels[j], 0, 0, 0);
                chunkSize
                chunkSize++;
            }
        }
    }

    var addLevelBar = function(level, beginTime, endTime, chunkSize) {
        var bar = jQuery('<div/>', {
            id: '',
            class: 'level_bar',
            width: '100px',
            height: '5px'
        }).prependTo('#monitor_timeline');        
        
        level = 3*parseFloat(level);
        if (level < 2) level = 2;
        else if (level > 100) level = 100;

        $(bar).css("position", "relative");
        $(bar).css("width", level+"%");
    }

    var addSeparatorBar = function() {
        var bar = jQuery('<div/>', {
            id: '',
            class: 'separator_bar',
        }).prependTo('#monitor_timeline'); 
    }

    getActivityData();
