class AddCameraToUser < ActiveRecord::Migration
  def change
      add_column    :users, :camera_id, :integer
      add_index     :users, :camera_id
  end
end
