# == Schema Information
#
# Table name: snapshots
#
#  id              :integer          not null, primary key
#  img_data        :binary(102400)
#  activity_log_id :integer
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#

require 'spec_helper'

describe Snapshot do
  pending "add some examples to (or delete) #{__FILE__}"
end
