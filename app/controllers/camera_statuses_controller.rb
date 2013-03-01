class CameraStatusesController < ApplicationController
    before_filter   :signed_in_user
    before_filter   :correct_user


    def show
        respond_to do |f|
            delay = Time.now - (@status.updated_at || @status.created_at)
            
            f.json {
                render :json => { :live => (delay < 5), :ip => @status.ip, :last_seen => @status.updated_at }
            }
        end
    end


    def update
        respond_to do |f|
            @status.ip = request.remote_ip
            @status.updated_at = Time.now

            if @status.save 
                f.json {
                    render :json => { :success => true }
                }
            else
                f.json {
                    render :json => { :success => false }
                }
            end
        end
    end


    private

    def correct_user
        # TEMPORARY
        @camera = current_user.default_camera
        
        @status = @camera.camera_status
        if !@status
            @status = CameraStatus.new
            @camera.camera_status = @status
        end
    end

end
