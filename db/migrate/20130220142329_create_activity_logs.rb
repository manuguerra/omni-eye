class CreateActivityLogs < ActiveRecord::Migration
    def change
        create_table :activity_logs do |t|
            
            t.integer   :camera_id
            t.float     :level
                
            t.timestamps
        end

        add_index   :activity_logs, :camera_id
    end
end
