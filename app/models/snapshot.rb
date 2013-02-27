class Snapshot < ActiveRecord::Base
    attr_accessible :img_data
    belongs_to :activity_log

    validates_presence_of   :img_data

end
