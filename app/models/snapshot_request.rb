class SnapshotRequest < ActiveRecord::Base
  
  attr_accessible   :img_data
  belongs_to        :camera
  
end
