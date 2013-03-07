class StaticPagesController < ApplicationController

    before_filter   :signed_in_user, :only => [:camera, :monitor, :tests]

    def main
    end
    
    def camera
    end

    def monitor
    end

    def tests
    end

end
