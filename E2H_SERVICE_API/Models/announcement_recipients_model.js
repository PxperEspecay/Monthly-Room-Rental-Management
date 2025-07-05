const { Model, DataTypes, Sequelize } = require("sequelize");
const sequelize = new Sequelize("e2h_db", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

class AnnouncementRecipients extends Model {}

AnnouncementRecipients.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    announcement_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "announcements", // ชื่อตารางที่โมเดลนี้อ้างอิง
        key: "id", // ชื่อคีย์ในตารางที่อ้างอิง
      },
      onDelete: "CASCADE", // ถ้าลบ announcement จะลบรายการใน recipients ด้วย
    },
    renter_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "renters", // ชื่อตารางที่โมเดลนี้อ้างอิง
        key: "id", // ชื่อคีย์ในตารางที่อ้างอิง
      },
      onDelete: "CASCADE", // ถ้าลบ renter จะลบรายการใน recipients ด้วย
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // ค่าดีฟอลต์เป็น false (ยังไม่ได้อ่าน)
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true, // ค่านี้จะเป็น null จนกว่าผู้รับจะอ่านประกาศ
    },
  },
  {
    sequelize,
    modelName: "AnnouncementRecipients", // ชื่อโมเดล
    tableName: "announcement_recipients", // ชื่อตารางในฐานข้อมูล
    timestamps: false, // ไม่ต้องสร้าง createdAt และ updatedAt
  }
);

module.exports = AnnouncementRecipients;
