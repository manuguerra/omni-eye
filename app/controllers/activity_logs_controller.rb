#
# Copyright (c) 2013 Manuel Guerra
# http://macroscopio.com
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
#


class ActivityLogsController < ApplicationController
    
    before_filter   :signed_in_user
    before_filter   :correct_user,              :only => [:show]
    before_filter   :filter_excessive_posts,    :only => [:create]
    # before_filter   :cache_expiration

    # index
    #
    # lists activities of a camera in a given interval
    #
    # ==== Params (GET)
    #   +:begin+ - begin datetime string
    #   +:end+ - end datetime string
    #
    # ==== Reponse
    #   +json+
    #
    def index 
        # search interval
        @begin = params[:begin]
        @end = params[:end]
        
        # -- TEMPORARY --
        # for now, the app is only working with a single camera per user
        @activity_logs = current_user.default_camera.activity_logs
        
        if @activity_logs.length == 0 
            respond_to do |f|
                f.json {
                    render :json => { }
                }
            end
        else
            # default interval is 1 hour
            if !@begin or !@begin.to_datetime
                @begin = Time.now - 1.hour
            end
            if !@end or !@end.to_datetime
                @end = Time.now + 1.hour
            end

            @selected_activities = @activity_logs.where(:updated_at => @begin.to_datetime..@end.to_datetime ).order("id ASC")
            respond_to do |f|
                f.json {
                    render :json => @selected_activities.to_json
                }
            end
        end
    end

    
    # show
    #
    # renders ActivityLog levels and snapshots
    #
    # ==== Params (GET)
    #   +:id+ - ActivityLog id
    #
    # ==== Reponse
    #   +json+
    #     
    def show
        respond_to do |f| 
            f.json {
                render :json => { 
                    :activity_log => @activity_log,
                    :snapshots => @activity_log.snapshots.order("id ASC")
                }
            }
        end
    end

    
    # create
    #
    # stores activity level and snapshot into the db
    #
    # ==== Params (POST)
    #   +:level+ - intensity level, float (0 - 100)
    #   +:datetime+ - datetime string
    #   +:img+ - snapshot image data string
    #
    # ==== Reponse
    #   +json+
    #    
    def create
        respond_to do |f|
            
            # formats decimal digits on level
            @level = params[:level].to_f.to_s[0..5]
            
            # the activities are clustered in a string, stored in a single row of the db, unless they are far apart,
            # in which case a new row is created
            # the interval is determined by INTERVAL_BETWEEN_ACTIVITY_CHUNKS
            # see config/application.rb
            if !@last_log or Time.now - @last_log.updated_at > OmniEye::INTERVAL_BETWEEN_ACTIVITY_CHUNKS
                @activity_log = @camera.activity_logs.build( :level => @level, :datetime => params[:datetime] )
            else
                @activity_log = @last_log
                @activity_log.level = @activity_log.level + ' ' + @level
            end

            # uploads snapshot if the interval since the last upload is greater than INTERVAL_BETWEEN_SNAPSHOTS
            # see config/application.rb
            @last_snapshot = @activity_log.snapshots.last
            if (!@last_snapshot or Time.now - @last_snapshot.created_at > OmniEye::INTERVAL_BETWEEN_SNAPSHOTS) 
               @activity_log.snapshots.build( :img_data => params[:image] )              
            end
            
            if @activity_log.save
                    f.json { 
                        render :json => { :success => true } 
                    }
            else
                    f.json { 
                        render :json => { :success => false, :errors => @activity_log.errors.as_json }
                    }
            end
        end
    end


    private 
        
        # correct_user
        #
        # grants access only to the owner of the log
        #      
        def correct_user
            @activity_log = ActivityLog.find params[:id]
            @user = @activity_log.camera.user
            redirect_to root_url unless current_user?(@user)
        end
        

        # filter_excessive_posts
        #        
        # sets a min interval between posts
        # the interval is determined by INTERVAL_BETWEEN_ACTIVITY_UPDATES
        # see config/application.rb
        def filter_excessive_posts

            # -- TEMPORARY --
            # for now, the app is only working with a single camera per user
            # in future versions, get the camera as a parameter
            @camera = current_user.default_camera
            
            # grabs most recent log and checks time interval since the last update
            @last_log = @camera.activity_logs.last;
            if @last_activity and Time.now - @last_activity.created_at < OmniEye::INTERVAL_BETWEEN_ACTIVITY_UPDATES
                render :json => { :sucess => false, :errors => "too many posts in a short interval" }
            end
        end

        
        def cache_expiration
            expires_now
        end
end
