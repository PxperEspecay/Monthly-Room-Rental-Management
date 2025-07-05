const { Model, DataTypes, Sequelize } = require("sequelize");
const sequelize = new Sequelize("e2h_db", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

class Community extends Model {
    static associate(models) {
        // Community เชื่อมโยงกับ Building (ชุมชน 1 ชุมชนมีหลายอาคาร)
        Community.hasMany(models.Building, { foreignKey: 'community_id' });
      }
}

Community.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  community_name_th: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  community_name_en: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true, // สามารถเป็น NULL ได้
  },
  img_commu1: {
    type: DataTypes.STRING,
  },
  img_commu2: {
    type: DataTypes.STRING,
    
  },
  img_commu3: {
    type: DataTypes.STRING,
    
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address_moo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  street: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  province: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  district: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sub_district: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  zip_code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  office_phone_number: {
    type: DataTypes.STRING(15),
    allowNull: true,
  },
}, {
  sequelize,
  modelName: "Community",
  tableName: "communities", // ชื่อตารางในฐานข้อมูล
  timestamps: true, // ถ้ามีฟิลด์ createdAt และ updatedAt
});

module.exports = Community;
