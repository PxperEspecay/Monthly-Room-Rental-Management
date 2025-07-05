const { Model, DataTypes, Sequelize } = require("sequelize");
const sequelize = new Sequelize("e2h_db", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

class BillsNotifications extends Model {}

BillsNotifications.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    renter_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "renter", // ชื่อตารางที่เชื่อมโยง
        key: "id", // คีย์หลักในตาราง renter
      },
    },
    month: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 12,
      },
      defaultValue: 0
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInt: true,
      },
      defaultValue: 0
    },
    detail_bill : {
      type : DataTypes.TEXT,
      allowNull: true,
      defaultValue: ''
    },
    monthly_rental_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0
    },
    garbage_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0
    },
    fee_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0
    },
    fines_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0
    },
    repair_airconditioner_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0
    },
    wash_airconditioner_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0
    },
    other_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    payment_status: {
      type: DataTypes.ENUM("unpaid", "paid", "late"),
      allowNull: false,
      defaultValue: "unpaid",
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    paid_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notification_sent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    img_slip : {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    detail_bill_from_renter : {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    trans_ref: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true, // ป้องกันการบันทึกข้อมูลซ้ำ
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW,
    },
  },{ 
    sequelize,
    tableName: "bills_notifications", // ชื่อตารางในฐานข้อมูล
    timestamps: false, // ปิดการใช้ createdAt และ updatedAt อัตโนมัติ
});
module.exports = BillsNotifications;