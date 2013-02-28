class AddTakenAtToSnapshotRequests < ActiveRecord::Migration
    def change
        add_column    :snapshot_requests, :taken_at, :datetime
    end
end
