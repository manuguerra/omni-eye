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

require 'test_helper'

class ActivityLogTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
