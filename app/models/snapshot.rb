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

class Snapshot < ActiveRecord::Base
    attr_accessible :img_data
    belongs_to :activity_log

    validates_presence_of   :img_data

end
