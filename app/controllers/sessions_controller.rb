class SessionsController < ApplicationController


    # Renders login window/screen 
    #
    # * *Args*    :
    # * *Returns* :
    # * *Raises* :
    #     
    def new
    end


    # Destroys session and redirects to root url 
    #
    # * *Args*    :
    # * *Returns* :
    # * *Raises* :
    # 
    def destroy
        sign_out
        redirect_to root_url
    end


    # Creates new session
    #
    # * *Args*    :
    # * *Returns* :
    # * *Raises* :
    # 
    def create
        user = User.find_by_email( params[:session][:email].downcase )

        if user && user.authenticate( params[:session][:password] )
            sign_in user
            redirect_to root_url
            puts "login ok"
        else
            flash[:error] = "invalid email/password"
            render :action => 'new' 
            puts "login error"
        end
    end
end
