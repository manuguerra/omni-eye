# == Schema Information
#
# Table name: users
#
#  id              :integer          not null, primary key
#  name            :string(255)
#  email           :string(255)
#  password_digest :string(255)
#  remember_token  :string(255)
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  camera_id       :integer
#

class User < ActiveRecord::Base

    has_many    :cameras,   :dependent => :destroy

    attr_accessible     :name,
                        :email,
                        :email_confirmation,
                        :password,
                        :password_confirmation
    
    has_secure_password
    
    before_save { |user| user.email = email.downcase }
    before_save :create_remember_token
    
    # name validation
    validates_presence_of   :name
    validates_length_of     :name,  :maximum => 100
    
    # email validation
    VALID_EMAIL_REGEX = /\A[\w+\-.]+@[a-z\d\-.]+\.[a-z]+\z/i
    validates_presence_of       :email
    validates_format_of         :email, :with => VALID_EMAIL_REGEX
    validates_uniqueness_of     :email, :case_sensitive => false
    validates_presence_of       :email_confirmation
    validates_confirmation_of   :email
    
    # password validation
    validates_presence_of       :password
    validates_length_of         :password,  :minimum => 6
    validates_presence_of       :password_confirmation
    validates_confirmation_of   :password
    
    def default_camera
        cameras.first
    end

    private
    def create_remember_token
        self.remember_token = SecureRandom.hex
    end

end
