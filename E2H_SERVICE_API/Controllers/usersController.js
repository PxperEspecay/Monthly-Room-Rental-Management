const Community = require("../Models/communities_model");
const Users = require("../Models/usersModel");
const Role = require("../Models/role_model");
Users.belongsTo(Role, { foreignKey: "role_id" });
Role.hasMany(Users, { foreignKey: "role_id" });
const { Op } = require("sequelize");
//ทดสอบแล้ว
exports.read = async (req, res) => {
  let id = req.body.id;
  console.log(id);
  try {
    const user = await Users.findOne({
      where: {
        id: id,
      },
      attributes: { exclude: ["username", "password"] },
    });
    if (!user) {
      return res.status(404).json({
        status_code: 404,
        message: "Not Found",
        description: "User not found",
      });
    }
    res.json({
      status_code: 8000,
      message: "Success",
      description: "Get one users",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status_code: 6000,
      message: "Fails",
      description: "Failed to get users",
      errors: error.errors.map((e) => e.message),
    });
  }
};

// ทดสอบแล้ว
exports.list = async (req, res) => {
  try {
    const users = await Users.findAll({
      include: [
        {
          model: Role, // เชื่อมโยงกับ Role model
          attributes: ["id", "role_name", "flag_active"], // ดึงเฉพาะฟิลด์ role_name จาก Role
          where: {
            role_name: "admin",
          },
        },
      ],
      attributes: { exclude: ["username", "password"] }, // ไม่ดึงฟิลด์ username และ password
    });

    res.json({
      status_code: 8000,
      message: "Success",
      description: "Get all users with roles",
      data: users,
    });
  } catch (error) {
    console.error(error); // เพิ่มบรรทัดนี้เพื่อดูรายละเอียดของข้อผิดพลาด
    res.status(500).json({
      status_code: 6000,
      message: "Fails",
      description: "Failed to get users",
      errors: error.errors
        ? error.errors.map((e) => e.message)
        : [error.message],
    });
  }
};

// ทดสอบแล้ว
exports.create = async (req, res) => {
  const userData = req.body;
  try {
    if (req.file) {
      userData.profile_photo = req.file.path;
    }
    const newUser = await Users.create(userData);
    res.status(200).json({
      status_code: 8000,
      message: "Success",
      description: "Create User Done!",
      data: newUser,
    });
  } catch (err) {
    console.error("Error Can't Create User:", err);
    let description = err.message;
    res.status(404).json({
      status_code: 6000,
      message: "Create new user fail",
      description: description,
    });
  }
};

//ทดสอบแล้ว
exports.update = async (req, res) => {
  const userData = req.body;
  const userID = req.body.id;
  // ตรวจสอบว่ามีไฟล์รูปภาพที่อัพโหลดมาหรือไม่
  if (req.file) {
    const profilePhotoPath = `${req.file.path}`; // สร้าง URL สำหรับรูปภาพ
    userData.profile_photo = profilePhotoPath; // เพิ่ม path ของรูปภาพลงใน userData
  }
  try {
    const updateUser = await Users.update(userData, {
      where: {
        id: userID,
      },
      returning: true, // คืนค่าข้อมูลที่ถูกอัปเดต
    });
    const updatedUser = await Users.findByPk(userID);

    res.status(200).json({
      status_code: 8000,
      message: "Success",
      description: "Update User Done!",
      data: updatedUser,
    });
  } catch (err) {
    console.error("Error Can't Update User:", err);
    let description = err.errors.map((e) => e.message);
    res.status(404).json({
      status_code: 6000,
      message: "Update new user fail",
      description: description,
    });
  }
};

exports.remove = async (req, res) => {
  let id = req.body.id;
  console.log(id);
  try {
    const user = await Users.destroy({
      where: {
        id: id,
      },
    });
    if (!user) {
      return res.status(404).json({
        status_code: 404,
        message: "Not Found",
        description: "User not found",
      });
    }
    res.json({
      status_code: 8000,
      message: "Success",
      description: "Deleted this users",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status_code: 6000,
      message: "Fails",
      description: "Failed to delelt users",
      errors: error.errors.map((e) => e.message),
    });
  }
};

exports.GetPhoneList = async (req, res) => {
  let community_id = req.body.community_id;
  console.log('community_id:', community_id);

  try {
    // หาแอดมินที่อยู่ภายใต้ community_id นั้น
    const admins = await Users.findAll({
      where: {
        location: community_id,
        role_id: 2, // ปรับตาม role_id ของ admin จริง
        // flag_active: 'Y'
      },
      attributes: ['prefix', 'first_name', 'last_name', 'phone_number']
    });

    // หาเบอร์สำนักงานจากตาราง community
    const communityData = await Community.findOne({
      where: { id: community_id },
      attributes: ['office_phone_number']
    });

    // ถ้าไม่พบ community
    if (!communityData) {
      return res.status(404).json({
        status_code: 404,
        message: "Not Found",
        description: "Community not found",
      });
    }

    // ส่ง response กลับ
    res.json({
      status_code: 8000,
      message: "Success",
      description: "Get admin phone list and office phone number",
      data: {
        office_phone_number: communityData.office_phone_number,
        admin_phones: admins
      }
    });

  } catch (error) {
    console.error('Error in GetPhoneList:', error);
    res.status(500).json({
      status_code: 6000,
      message: "Fails",
      description: "Failed to get phone list",
      errors: error.errors ? error.errors.map((e) => e.message) : [error.message],
    });
  }
};
