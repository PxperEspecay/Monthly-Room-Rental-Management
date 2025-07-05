const { Model, DataTypes, Sequelize } = require("sequelize");
const sequelize = new Sequelize("e2h_db", "root", "", {
  host: "localhost",
  dialect: "mysql",
  timezone: "+07:00",
  dialectOptions: {
    timezone: "+07:00",
    dateStrings: true,
    typeCast: true,
  },
});

class Announcements extends Model {}

Announcements.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    announcement_type: {
      type: DataTypes.CHAR,
    },
    banner_announcement: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '',
    },
    title_announcement: {
      type: DataTypes.STRING,
    },
    body_announcement: {
      type: DataTypes.TEXT,
    },
    img_announcement: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '',
    },
    file_announcement: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '',
    },
    admin_id: {
      type: DataTypes.INTEGER,
    },
    community_id: {
      type: DataTypes.INTEGER,
    },
    
  },
  {
    sequelize,
    modelName: "Announcements",
    tableName: "announcements", // ชื่อตารางในฐานข้อมูล
    timestamps: true, // ✅ ต้องเปิดไว้
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
);
module.exports = Announcements;