class Snapshot < ActiveRecord::Base
    attr_accessible :img_data
    belongs_to :activity_log

    validates_presence_of   :img_data
    validates_presence_of   :activity_log


end
