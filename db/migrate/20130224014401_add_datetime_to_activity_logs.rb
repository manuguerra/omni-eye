class AddDatetimeToActivityLogs < ActiveRecord::Migration
  def change
      add_column    :activity_logs, :datetime,  :datetime
  end
end
