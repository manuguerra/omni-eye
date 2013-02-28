OmniEye::Application.routes.draw do

    root :to => 'static_pages#main'
    
    # sessions
    match '/login',     :to => 'sessions#new'
    match '/logout',    :to => 'sessions#destroy',  :via => [:delete, :get]
    resources :sessions, :only => [:new, :create, :destroy]

    # users
    resources :users

    # apps
    match '/camera',    :to => 'static_pages#camera'
    match '/monitor',   :to => 'static_pages#monitor'
    
    #activity_log
    resources :activity_logs

    #snapshot_requests
    match '/snapshot',  :to => 'snapshot_requests#request', :via => [:post]

end
