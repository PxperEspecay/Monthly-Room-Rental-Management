const { Model, DataTypes, Sequelize } = require("sequelize");
const dataTypes = require("sequelize/lib/data-types");
const sequelize = new Sequelize("e2h_db", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

class RepairSchedule extends Model {}

RepairSchedule.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    repair_request_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    selected_date: {
      type: DataTypes.DATE,
      allowNull: false,
    }, // วันที่นัดหมายซ่อม
    selected_time_period: {
      type: DataTypes.ENUM("เช้า", "บ่าย"),
      allowNull: false,
    }, // ช่วงเวลาเริ่ม
    confirmed_by_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        "waiting",
        "confirmed",
        "admin_reschedule",
        "renter_reschedule"
      ),
      defaultValue: "waiting",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    rescheduled_by_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: true,
    },
    rescheduled_reason_by_admin: {
      type: dataTypes.TEXT,
      defaultValue: null,
      allowNull: true,
    },
    rescheduled_by_renter: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: true,
    },
    requested_new_date: {
      type: dataTypes.DATE,
      defaultValue: null,
      allowNull: true,
    },
    requested_new_time_period: {
      type: DataTypes.ENUM("เช้า", "บ่าย"),
      defaultValue: null,
      allowNull: true,
    },
    reschedule_reason_by_renter: {
      type: dataTypes.TEXT,
      defaultValue: null,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "RepairSchedule",
    tableName: "repair_schedules",
    timestamps: false,
  }
);

module.exports = RepairSchedule;
