# == Schema Information
#
# Table name: camera_statuses
#
#  id         :integer          not null, primary key
#  ip         :string(255)
#  camera_id  :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class CameraStatus < ActiveRecord::Base
    
    belongs_to  :camera
    
end
