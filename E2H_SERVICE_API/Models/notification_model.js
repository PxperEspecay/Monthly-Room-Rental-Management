const { Model, DataTypes, Sequelize } = require("sequelize");
const sequelize = new Sequelize("e2h_db", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

class Notification extends Model {}

Notification.init(
  {
    notification_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    notification_no: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    notification_type: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    path: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    title: {
        type: DataTypes.STRING(100),
        allowNull: true,
        // defaultValue: null,
      },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    flag_active: {
      type: DataTypes.ENUM("Y", "N"),
      allowNull: true,
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
    is_expire: {
      type: DataTypes.ENUM("Y", "N"),
      allowNull: true,
      defaultValue: "N",
    },
  },
  {
    
    sequelize,
    modelName: 'Notification',
    tableName: 'notification', // ชื่อ table ในฐานข้อมูล
    timestamps: false, 
  }
  
);

module.exports = Notification;
