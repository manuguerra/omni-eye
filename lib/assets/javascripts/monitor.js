$(document).ready(function() {


});

    var beginTime = -1;
    var endTime = -1;

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
                    console.log(data);
                    last_entry = data[data.length-1];
                    beginTime = last_entry.created_at;
                    endTime = last_entry.updated_at;
                    
                    console.log("beginTime: " + beginTime + " endTime: " + endTime);
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
                    console.log(data);
                    if (data.length > 0) {
                        last_entry = data[data.length-1];
                    
                        beginTime = last_entry.created_at;
                        endTime = last_entry.updated_at;
                    
                        console.log("");
                    }
                }
            );
        }
    }

