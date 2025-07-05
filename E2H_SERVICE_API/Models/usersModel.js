// models/user.js
const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = new Sequelize('e2h_db', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
});

class User extends Model {}

User.init({
  profile_photo: {
    type: DataTypes.STRING,
  },
  prefix: {
    type: DataTypes.STRING,
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nickname: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  phone_number: {
    type: DataTypes.STRING,
  },
  address: {
    type: DataTypes.STRING,
  },
  address_moo: {
    type: DataTypes.STRING,
  },
  street: {
    type: DataTypes.STRING,
  },
  province: {
    type: DataTypes.STRING,
  },
  district: {
    type: DataTypes.STRING,
  },
  sub_district: {
    type: DataTypes.STRING,
  },
  zip_code: {
    type: DataTypes.STRING,
  },
  identity_card_number: {
    type: DataTypes.STRING,
    unique: true,
  },
  location: {
    type: DataTypes.INTEGER, // เปลี่ยนเป็น INTEGER เพื่อเก็บ ID ของสถานที่
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'role',
      key: 'id',
    },
  },
}, {
  sequelize,
  modelName: 'User',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

module.exports = User;