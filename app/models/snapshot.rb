class Snapshot < ActiveRecord::Base
    attr_accessible :img_data, :activity_log_id

    belongs_to :activity_log
    

end
