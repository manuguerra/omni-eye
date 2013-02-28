# == Schema Information
#
# Table name: cameras
#
#  id         :integer          not null, primary key
#  user_id    :integer
#  name       :string(255)
#  uuid       :string(255)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Camera < ActiveRecord::Base
  
    belongs_to  :user

    has_many    :activity_logs
    has_one     :snapshot_request
end
