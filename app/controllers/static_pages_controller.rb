class StaticPagesController < ApplicationController

    def main
    end
    
    def camera
        signed_in_user
    end

    def monitor
        signed_in_user
    end

end
