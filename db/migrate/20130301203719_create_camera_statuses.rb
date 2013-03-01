class CreateCameraStatuses < ActiveRecord::Migration
    def change
        create_table :camera_statuses do |t|
            t.string    :ip
            t.integer   :camera_id

            t.timestamps
        end

        add_index   :camera_statuses,   :camera_id
    end
    
end
