# == Schema Information
#
# Table name: activity_logs
#
#  id         :integer          not null, primary key
#  camera_id  :integer
#  level      :string(255)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  datetime   :datetime
#

class ActivityLog < ActiveRecord::Base
  attr_accessible :level, :datetime

  belongs_to :camera

#  validates_presence_of :level

  
end
