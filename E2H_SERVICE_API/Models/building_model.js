const { Model, DataTypes, Sequelize } = require("sequelize");
const sequelize = new Sequelize("e2h_db", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

class Building extends Model {
  // กำหนดความสัมพันธ์ถ้ามี
  static associate(models) {
    // Building เชื่อมโยงกับ Community (หลายอาคารอยู่ใน 1 ชุมชน)
    Building.belongsTo(models.Community, { foreignKey: 'community_id' , as: 'community'});
  }
}

Building.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  img_building: {
    type: DataTypes.STRING,
  },
  building_name: {
    type: DataTypes.STRING,
  },
  community_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Community', // ชื่อ Model หรือ Table ที่จะเชื่อมโยง
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  floor: {
    type: DataTypes.INTEGER,
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
  modelName: "Building",
  tableName: "buildings", // ชื่อตารางในฐานข้อมูล
  timestamps: true, // เปิดใช้ timestamps
});

module.exports = Building;
