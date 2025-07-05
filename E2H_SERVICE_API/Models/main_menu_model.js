const { Model, DataTypes, Sequelize } = require("sequelize");
const sequelize = new Sequelize("e2h_db", "root", "", {
  host: "localhost",
  dialect: "mysql",
});
class MainMenu extends Model { }
MainMenu.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    home_menu_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    home_menu_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    path_img: {
      type: DataTypes.STRING,
      allowNull: true, // หากฟิลด์นี้เป็น null ได้
    },
    active_flag: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Y", // สมมติว่าใช้ 'Y' สำหรับ active
    },
    admin_only: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: "Y", // สมมติว่าใช้ 'Y' สำหรับ active
    },
    superadmin_only: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: "Y", // สมมติว่าใช้ 'Y' สำหรับ active
    },
}, {
    sequelize,
    modelName: "MainMenu",
    tableName: "main_menu", // ชื่อตารางในฐานข้อมูล
    timestamps: false, // ถ้าไม่มีฟิลด์ createdAt และ updatedAt
  }
);

module.exports = MainMenu;
