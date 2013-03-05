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

class CameraStatusesController < ApplicationController
    before_filter   :signed_in_user
    before_filter   :correct_user


    # show
    #
    # returns json with camera status, ip and last seen datetime
    #
    # ==== Reponse
    #   +json+ - { :live, :ip, :last_seen }
    #
    def show
        respond_to do |f|
            delay = Time.now - (@status.updated_at || @status.created_at)
            
            f.json {
                render :json => { :live => (delay < 5), :ip => @status.ip, :last_seen => @status.updated_at }
            }
        end
    end


    # update
    #
    # renew camera status
    #
    # ==== Reponse
    #   +json+ - { :success }
    #    
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


    # correct_user
    #
    # grants access only to the owner of the camera
    #     
    def correct_user

        # -- TEMPORARY --
        # for now, the app is only working with a single camera per user
        # in future versions, get the camera as a parameter
        @camera = current_user.default_camera
        
        @status = @camera.camera_status
        if !@status
            @status = CameraStatus.new
            @camera.camera_status = @status
        end
    end

end
