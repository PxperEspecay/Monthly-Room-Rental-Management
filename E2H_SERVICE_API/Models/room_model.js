const { Model, DataTypes, Sequelize } = require("sequelize");
const sequelize = new Sequelize("e2h_db", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

class Room extends Model {
  // กำหนดความสัมพันธ์ถ้ามี
  static associate(models) {
    // เชื่อมโยง Room กับ Building (หลายห้องอยู่ใน 1 อาคาร)
    Room.belongsTo(models.Building, { foreignKey: 'building_id' });
  }
}

Room.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  room_number: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  building_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Building', // ชื่อ Model หรือ Table ที่จะเชื่อมโยง
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  floor: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status_room: {
    type: DataTypes.CHAR,
    defaultValue : 'Y'
  },
  monthly_rental_price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  rental_deposit: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  garbage_price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    onUpdate: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
}, {
  sequelize,
  modelName: "Room",
  tableName: "rooms", // ชื่อตารางในฐานข้อมูล
  timestamps: true, // เปิดใช้ timestamps
});

module.exports = Room;
