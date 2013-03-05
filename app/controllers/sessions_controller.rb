class SessionsController < ApplicationController

    # new
    #
    # Renders login window/screen     
    #    
    def new
    end


    # destroy
    #
    # Destroys session and redirects to root url
    # 
    def destroy
        sign_out
        redirect_to root_url
    end


    # create
    #
    # creates new session if user is sucessful authenticated
    # redirects to login page otherwise
    #
    # ==== Params (POST)
    #   +:session :email+ - user email
    #   +:password :password+ - user password
    #
    # ==== Reponse
    #   +json+
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
