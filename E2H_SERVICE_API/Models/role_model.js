const { Model, DataTypes,Sequelize } = require('sequelize');
const sequelize = new Sequelize('e2h_db', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
});
class Role extends Model {}


Role.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  role_name: {
    type: DataTypes.STRING,
    allowNull: false, // ไม่อนุญาตให้เป็นค่า null
    unique: true,     // บทบาทต้องไม่ซ้ำกัน
  },
  flag_active: {
    type: DataTypes.STRING(1),
    defaultValue: 'Y', // ค่าเริ่มต้นเป็น 'Y'
  },
  created_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW, // ค่าเริ่มต้นเป็นวันที่และเวลาปัจจุบัน
  },
  updated_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW, // ค่าเริ่มต้นเป็นวันที่และเวลาปัจจุบัน
  },
}, {
    sequelize,
    modelName: 'role',
    tableName: 'role', // ระบุชื่อจริงของตาราง
    timestamps: false,
});

module.exports = Role;
