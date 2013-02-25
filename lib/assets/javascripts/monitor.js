$(document).ready(function() {


});

    var beginTime = -1;
    var endTime = -1;
    
    var lastId = -1;
    var chunkSize = 0;

    //t=setTimeout(function(){alert("Hello")},3000)
    /**
    * main thread
    *
    * @namespace 
    * @method monitor
    * @param   
    * @return
    */
    var getActivityData = function() {
        if (beginTime < 0 || endTime < 0) {
            $.get('/activity_logs.json', 
                function(data) {
                    parseActivityData( data );
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
            }

            for (var j = chunkSize; j < nLevels; j++) {
                console.log(levels[j]);
                addLevelBar(levels[j], 0, 0, 0);
                chunkSize
                chunkSize++;    
            }
        }
    }

    var addLevelBar = function(level, beginTime, endTime, chunkSize) {
        var bar = jQuery('<div/>', {
            id: '',
            width: '100px',
            height: '5px'
        }).prependTo('#monitor_side_window');        
    
        //level = parseFloat(level);
        //console.log(": " + level);
        //level = Math.round(level*2.55) + "";
        //console.log(":: " + level);

        $(bar).css("background-color", "rgba(200,100, 100)");
        $(bar).css("position", "relative");
        $(bar).css("width", level+"%");
    }

    

    

