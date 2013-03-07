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
    match '/snapshot/request',  :to => 'snapshot_requests#requestSnapshot', :via => [:post]
    match '/snapshot/check',    :to => 'snapshot_requests#checkNewRequest', :via => [:get]
    match '/snapshot/upload',   :to => 'snapshot_requests#takeSnapshot',    :via => [:post]
    match '/snapshot/grab',     :to => 'snapshot_requests#grabSnapshot',    :via => [:get]

    #camera_status
    match '/camera/status', :to => 'camera_statuses#show',      :via => [:get]
    match '/camera/status', :to => 'camera_statuses#update',    :via => [:post]
    
    #js unit tests - development env only
    match '/tests', :to => 'static_pages#tests' if Rails.env == 'development'
end
