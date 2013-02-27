class CreateSnapshotRequests < ActiveRecord::Migration
    def change
        create_table    :snapshot_requests do |t|
            t.binary    :img_data,  :limit  => 100.kilobyte
            t.integer   :camera_id
            t.datetime  :requested_at

            t.timestamps
        end
    end
end
