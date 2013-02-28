class SnapshotRequestsController < ApplicationController
    before_filter   :signed_in_user
    before_filter   :correct_user

    # requestSnashot
    #
    # ==== Params (POST)
    #
    # ==== Reponse
    #   +json+
    #    
    def requestSnapshot
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
    

    # takeSnasphot
    #
    # ==== Params (POST)
    #
    # ==== Reponse
    #   +json+
    #    
    def takeSnapshot
        respond_to do |f|
            
            @request.img_data = params[:image]
            @request.taken_at = Time.now

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


    # checkSnasphotRequest
    #
    # ==== Params (GET)
    #
    # ==== Reponse
    #   +json+
    #    
    def checkNewRequest
        @new_request = @request.requested_at - (@request.taken_at||0) > 0

        respond_to do |f|
            f.json { 
                render :json => { :new => @new_request } 
            }
        end
    end


    # grabSnapshot
    #
    # ==== Params (GET)
    #
    # ==== Reponse
    #   +json+
    #    
    def grabSnapshot
        respond_to do |f|
            f.json { 
                render :json => { :img_data => @request.img_data, :taken_at => @request.taken_at } 
            }
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
