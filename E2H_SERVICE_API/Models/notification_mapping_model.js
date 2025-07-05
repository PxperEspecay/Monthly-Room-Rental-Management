const { Model, DataTypes, Sequelize } = require("sequelize");
const sequelize = new Sequelize("e2h_db", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

// การสร้าง Model สำหรับ NotificationMapping
class NotificationMapping extends Model {}

NotificationMapping.init(
  {
    notification_map_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    notification_id: {
      type: DataTypes.INTEGER,
    //   allowNull: false,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    renter_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    admin_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    flag_active: {
      type: DataTypes.ENUM("Y", "N"),
      defaultValue: "Y",
    },
    create_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    create_by: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    update_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      onUpdate: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    update_by: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    modelName: "NotificationMapping",
    tableName: "notification_mapping", // ชื่อ table ในฐานข้อมูล
    timestamps: false, // ใช้การควบคุมเวลาใน `create_date` และ `update_date`
  }
);

module.exports = NotificationMapping;
