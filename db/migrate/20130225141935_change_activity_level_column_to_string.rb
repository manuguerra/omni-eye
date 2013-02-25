class ChangeActivityLevelColumnToString < ActiveRecord::Migration
    def up
        change_table :activity_logs do |t|
            t.change :level, :string
        end
    end

    def down
        change_table :activity_logs do |t|
            t.change :level, :float
        end
    end
end
