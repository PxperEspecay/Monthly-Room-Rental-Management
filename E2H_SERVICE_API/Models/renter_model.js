const { Model, DataTypes, Sequelize } = require("sequelize");
const sequelize = new Sequelize("e2h_db", "root", "", {
  host: "localhost",
  dialect: "mysql",
  timezone: "+07:00", // กำหนด timezone ให้ตรงกับเวลาท้องถิ่น (เช่น UTC+7)
});

class Renter extends Model {}

Renter.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    img_profile: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    gender: {
      type: DataTypes.CHAR(1),
      allowNull: false,
    },
    national_type: {
      type: DataTypes.CHAR(1),
      allowNull: false,
    },
    identity_card_number: {
      type: DataTypes.CHAR(13),
      allowNull: true,
      unique: true,
    },
    passport_number: {
      type: DataTypes.STRING(30),
      allowNull: true,
      unique: true,
      defaultValue: null,
    },
    prefix: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    middle_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    nick_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    birth_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    phone_number: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    address_moo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    sub_district: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    district: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    province: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    zip_code: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    emergency_prefix: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    emergency_first_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    emergency_middle_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    emergency_last_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    emergency_relationship: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    emergency_phone_number: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    file_contract: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    username_renter: {
      type: DataTypes.STRING(30),
      allowNull: true,
      unique: true, // ตั้งค่าเป็น unique
    },
    password_renter: {
      type: DataTypes.STRING(30),
      allowNull: true,
      defaultValue: "",
    },
    community_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "communities",
        key: "id",
      },
    },
    building_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "buildings",
        key: "id",
      },
    },
    room_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "rooms",
        key: "id",
      },
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "roles", // ใช้ model role ที่คุณมี
        key: "id",
      },
    },
    flag_active: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      defaultValue: "Y",
    },
    flag_login: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    start_contract: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_contract: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    billing_day : {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Renter",
    tableName: "renter", // ชื่อของตารางในฐานข้อมูล
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    hooks: {
      beforeCreate: (renter) => {
        // แปลงวัน start_contract และ end_contract ให้อยู่ใน timezone ที่ถูกต้อง
        if (renter.start_contract) {
          renter.start_contract = new Date(
            renter.start_contract.getTime() -
              renter.start_contract.getTimezoneOffset() * 60000
          );
        }
        
        renter.end_contract = new Date(
          renter.end_contract.getTime() -
            renter.end_contract.getTimezoneOffset() * 60000
        );
        renter.age = calculateAge(renter.birth_date);
        renter.remaining_contract = calculateRemainingDays(
          renter.start_contract,
          renter.end_contract
        );
      },
      
      beforeUpdate: (renter) => {
        // ตรวจสอบและแปลง start_contract เป็น Date ถ้าจำเป็น
        if (renter.start_contract && !(renter.start_contract instanceof Date)) {
          renter.start_contract = new Date(renter.start_contract);
        }
      
        // ตรวจสอบและแปลง end_contract เป็น Date ถ้าจำเป็น
        if (renter.end_contract && !(renter.end_contract instanceof Date)) {
          renter.end_contract = new Date(renter.end_contract);
        }
      
        // ตรวจสอบ start_contract ก่อนคำนวณ timezone
        if (renter.start_contract) {
          renter.start_contract = new Date(
            renter.start_contract.getTime() -
              renter.start_contract.getTimezoneOffset() * 60000
          );
        }

        
        
        renter.age = calculateAge(renter.birth_date);
        if (renter.changed("start_contract")) {
          renter.remaining_contract = calculateRemainingDays(
            renter.start_contract,
            renter.end_contract
          );
        }
      },
    },
  }
);

function calculateAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// Renter.beforeUpdate(async (renter, options) => {
//   // ตรวจสอบว่า start_contract ถูกอัปเดตหรือไม่
//   if (renter.changed("start_contract")) {
//     // คำนวณ remaining_contract โดยใช้ start_contract และ end_contract
//     const startDate = new Date(renter.start_contract);
//     const endDate = new Date(renter.end_contract);
//     const remainingDays = Math.ceil(
//       (endDate - startDate) / (1000 * 60 * 60 * 24)
//     ); // คำนวณจำนวนวัน
//     renter.remaining_contract = remainingDays;
//   }
// });

function calculateRemainingDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const remainingTime = end - start;
  const remainingDays = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));
  return remainingDays;
}

module.exports = Renter;
