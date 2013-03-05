/*
Copyright (c) 2013 Manuel Guerra
http://macroscopio.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


/**
* class Timeline
*
* gets remote activity updates
* displays data in a timeline graph
* displays snapshots
*/ 
function Timeline() {    

    // time interval
    this.beginTime = -1;
    this.endTime = -1;
    
    this.lastId = -1;    // last activity chunk received from the server
    this.chunkSize = 0;  // current acitivity chunk size
    
    this.width = 0;

    this.init = function() {
        // launches monitor thread
        this.getActivityData();
    }

   /**
    * main thread
    *
    * @namespace Timeline
    * @method getActivityData  
    */
    this.getActivityData = function() {
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
    * @namespace Timeline
    * @method parseActivityData
    * @param data: { json } data: Response from server
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

                    this.addLevelBar({
                        level:      levels[j], 
                        chunkId:    data[i].id
                    });

                    this.chunkSize++;
                }
            }
        }
    }


   /**
    * increaseTimelineSizeBy
    * increases graph width
    *
    * @namespace Timeline    
    * @method increaseTimelineSizeBy
    * @param {int} size: Size to be increased
    */    
    this.increaseTimelineSizeBy = function( size ) {
        var w = $("#monitor_timeline").width() + size;
        $("#monitor_timeline").width(w);
    }


   /**
    * addLevelBar
    * adds level bar to a given activity chunk graph
    *
    * @namespace Timeline    
    * @method addLevelBar
    * @param {int} level: Activity level
    * @param {int} chunkId
    */
    this.addLevelBar = function( args ) {
        
        var level = args.level;
        var chunkId = args.chunkId;

        this.increaseTimelineSizeBy( 2 );

        var bar = jQuery('<div/>', {
            id: '',
            class: 'level_bar'
        }).prependTo('#chunk_'+chunkId); 

        level = 3*parseFloat(level);
        if (level < 2) level = 2;
        else if (level > 100) level = 100;

        $(bar).css("height", level+"%");
        $(bar).css("top", (100-level)+"%");

        this.width += bar.width();
    }


    /**
    * addSeparatorBar
    * adds a space between activity chunks in the graph
    * 
    * @namespace Timeline
    * @method addSeparatorBar
    */
    this.addSeparatorBar = function() {
        
        this.increaseTimelineSizeBy( 80 ); 

        var bar = jQuery('<div/>', {
            id: '',
            class: 'separator_bar',
        }).prependTo("#monitor_timeline");

        this.width += bar.width();
    }


    /**
    * addActivityChunk
    * adds a new activity chunk to the graph
    * 
    * @namespace Timeline     
    * @method addActivityChunk 
    * @param {int} chunkId
    */
    this.addActivityChunk = function(chunkId) { 
        
        var self = this;
        
        this.increaseTimelineSizeBy( 5 );

        var chunk = jQuery('<div/>', {
            id: 'chunk_'+chunkId,
            class: 'activity_chunk'
        }).prependTo('#monitor_timeline');     
        
        $(chunk).click( function() {
            self.getSnapshots( chunkId );
        });
        
        this.width += chunk.width();
    }


   /**
    * getSnapshots
    * gets snapshots from a given activity chunk
    *
    * @namespace Timeline     
    * @method getSnapshots
    * @param {int} activityLogId: ID of the activity chunk
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
    * showSnapshots
    * displays snapshots
    *
    * @namespace Timeline
    * @method showSnapshots
    * @param  {json} data: Response from server
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


   /**
    * openSnapshotsContainer
    * opens snapshots window
    *
    * @namespace Timeline
    * @method showSnapshots
    * @param  {json} data: Response from server
    */
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


   /**
    * closeSnapshotsContainer
    * closes snapshots window
    *
    * @namespace Timeline
    * @method closeSnapshotsContainer
    */
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


   /**
    * displayImage
    * displays image from jpeg stream
    *
    * @namespace Timeline
    * @method displayImage
    * @param  { args } args.img_data: jpeg data stream
    */    
    this.displayImage = function( args ) {

        var img = new Image();
        img.src = args.img_data;
        
        var imgDiv = jQuery('<div/>', {
            class: 'snapshot'
        });    
        
        imgDiv.html(img);
        
        MonitorUtils.addDatetimeToDiv({ 
            div: imgDiv,
            datetime: args.datetime
        });

        $("#snapshots_container").prepend( imgDiv );
    }
}
