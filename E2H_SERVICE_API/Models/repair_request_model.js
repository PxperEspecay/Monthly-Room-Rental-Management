const { Model, DataTypes, Sequelize } = require("sequelize");
const sequelize = new Sequelize("e2h_db", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

class RepairRequest extends Model {}

RepairRequest.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    renter_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    room_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    issue_title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    issue_description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type_repair_id : {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    photo_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    photo_url2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    photo_url3: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    photo_url4: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    photo_url5: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    callback_phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        "waiting_to_check",
        "acknowledged",
        "approved",
        "scheduled",
        "pending",
        "in_progress",
        "completed",
        "rejected"
      ),
      defaultValue: "waiting_to_check",
    },
    admin_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: "RepairRequest",
    tableName: "repair_requests",
    timestamps: false,
  }
);

module.exports = RepairRequest;
