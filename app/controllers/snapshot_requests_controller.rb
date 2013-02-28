class SnapshotRequestsController < ApplicationController
    before_filter   :signed_in_user
    before_filter   :correct_user,  :only => [:show, :request]

    # create
    #
    # ==== Params (POST)
    #
    # ==== Reponse
    #   +json+
    #    
    def request
        respond_to do |f|
            
            @request.requested_at = Time.now    
            
            if @request.save
                f.json { 
                    render :json => { :success => true } 
                }
            else
                f.json { 
                    render :json => { :success => false, :errors => @request.errors.as_json }
                }
            end
        end
    end
    
    private
    
    def correct_user

        # TEMPORARY
        @camera = current_user.default_camera
        
        @request = @camera.snapshot_request
        if !@request
            @request = SnapshotRequest.new
            @camera.snapshot_request = @request
        end
    end

end
