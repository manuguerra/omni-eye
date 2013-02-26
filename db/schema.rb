# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20130226212845) do

  create_table "activity_logs", :force => true do |t|
    t.integer  "camera_id"
    t.string   "level"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
    t.datetime "datetime"
  end

  add_index "activity_logs", ["camera_id"], :name => "index_activity_logs_on_camera_id"

  create_table "cameras", :force => true do |t|
    t.integer  "user_id"
    t.string   "name"
    t.string   "uuid"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  add_index "cameras", ["user_id"], :name => "index_cameras_on_user_id"
  add_index "cameras", ["uuid"], :name => "index_cameras_on_uuid"

  create_table "snapshots", :force => true do |t|
    t.binary   "img_data",        :limit => 102400
    t.integer  "activity_log_id"
    t.datetime "created_at",                        :null => false
    t.datetime "updated_at",                        :null => false
  end

  add_index "snapshots", ["activity_log_id"], :name => "index_snapshots_on_activity_log_id"

  create_table "users", :force => true do |t|
    t.string   "name"
    t.string   "email"
    t.string   "password_digest"
    t.string   "remember_token"
    t.datetime "created_at",      :null => false
    t.datetime "updated_at",      :null => false
    t.integer  "camera_id"
  end

  add_index "users", ["camera_id"], :name => "index_users_on_camera_id"
  add_index "users", ["email"], :name => "index_users_on_email"

end
