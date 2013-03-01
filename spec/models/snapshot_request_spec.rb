# == Schema Information
#
# Table name: snapshot_requests
#
#  id           :integer          not null, primary key
#  img_data     :binary(102400)
#  camera_id    :integer
#  requested_at :datetime
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  taken_at     :datetime
#

require 'spec_helper'

describe SnapshotRequest do
  pending "add some examples to (or delete) #{__FILE__}"
end
