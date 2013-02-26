class CreateSnapshots < ActiveRecord::Migration
  def change
    create_table    :snapshots do |t|
      t.binary      :img_data, :limit => 100.kilobyte
      t.integer     :activity_log_id
      t.timestamps
    end

    add_index   :snapshots, :activity_log_id
  end
end
