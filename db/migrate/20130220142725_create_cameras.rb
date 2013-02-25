class CreateCameras < ActiveRecord::Migration
    def change
        create_table :cameras do |t|
            
            t.integer       :user_id
            t.string        :name
            t.string        :uuid

            t.timestamps   
        end

        add_index   :cameras,   :user_id
        add_index   :cameras,   :uuid
    end
end
