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

class SnapshotRequestsController < ApplicationController
    before_filter   :signed_in_user
    before_filter   :correct_user

    # requestSnashot
    #
    # request a new snapshot for the camera client
    #
    # ==== Reponse
    #   +json+ {:success, :errors}
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
    # uploads snapshot
    #
    # ==== Params (POST)
    # +:image+ - jpeg data stream
    #
    # ==== Reponse
    #   +json+ - { :success, :errors }
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
    # returns { :new => true } if new monitor client requested new snapshot
    #
    # ==== Reponse
    #   +json+
    #    
    def checkNewRequest
        @new_request = @request.requested_at - (@request.taken_at || @request.requested_at) >= 0

        respond_to do |f|
            f.json { 
                render :json => { :new => @new_request } 
            }
        end
    end


    # grabSnapshot
    #
    # returns jpeg stream and datetime of a requested snasphot
    #
    # ==== Reponse
    #   +json+ { :img_data, :taken_at }
    #    
    def grabSnapshot
        respond_to do |f|
            f.json { 
                render :json => { :img_data => @request.img_data, :taken_at => @request.taken_at } 
            }
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
        
        @request = @camera.snapshot_request
        if !@request
            @request = SnapshotRequest.new
            @camera.snapshot_request = @request
        end
    end

end
