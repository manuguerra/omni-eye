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

require 'spec_helper'

describe CameraStatus do
  pending "add some examples to (or delete) #{__FILE__}"
end
