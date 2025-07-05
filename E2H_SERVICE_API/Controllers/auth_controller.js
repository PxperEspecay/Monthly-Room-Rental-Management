const Users = require("../Models/usersModel");
const Role = require("../Models/role_model");
const Renter = require("../Models/renter_model");
const Community = require("../Models/communities_model");
const Room = require("../Models/room_model");
const Building = require("../Models/building_model");
Users.belongsTo(Role, { foreignKey: "role_id" });
Role.hasMany(Users, { foreignKey: "role_id" });
Renter.belongsTo(Community, { foreignKey: 'community_id'});
Community.hasMany(Renter, { foreignKey: 'community_id'});
Building.hasMany(Room, { foreignKey: "building_id" });
Room.belongsTo(Building, { foreignKey: "building_id" });



const { Op } = require("sequelize");

const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    //check user
    const { username, password } = req.body;

    let user = await Users.findOne({
      include: [
        {
          model: Role, // ดึงข้อมูลจากตาราง Role
          attributes: ["id", "role_name"], // เลือกเฉพาะฟิลด์ role_name
        },
      ],
      where: { username: username },
    });

    if (user) {
      const isMatch = (await user.password) === password;
      if (!isMatch) {
        return res.status(400).send("Password Invalid!!!");
      }
      //   const roleName = user.role ? user.role.role_name : 'No role assigned';
      let data = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        nickname: user.nickname,
        profile_img: user.profile_photo,
        role: user.role.role_name,
        location: user.location,
      };
      console.log(data, "AAAAA");
      jwt.sign(data, "jwtsecret", { expiresIn: "30d" }, (err, token) => {
        if (err) throw err;
        res.json({
          status_code: 8000,
          message: "Success",
          description: "Login Success",
          data: {
            token,
          },
        });
      });
    } else {
      return res.status(400).send("User not found!!!");
    }
    // console.log(user);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

exports.check_username = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.json({ 
        status_code: 4000,
        message: "Username is required.",
        description: "Please Fill Username", 
      });
    }

    // ตรวจสอบ username ในฐานข้อมูล
    const username_renter = await Renter.findOne({
      where: {
        username_renter: username,
        flag_login: false,
      },
    });

    if (username_renter) {
      return res.json({
        status_code: 8000,
        message: "Success",
        description: "Checked Pass",
        data: {
          id: username_renter.id,  // ส่ง id กลับไป
        }
      });
    } else {
      return res.status(404).json({
        status_code: 6000,
        message: "Fail",
        message: "Username not found or This user has logged in before",
      });
    }
  } catch (error) {
    console.error("Error checking username:", error);
    return res.status(500).json({
      message: "An error occurred while checking username.",
      error: error.message,
    });
  }
};

exports.set_password_mobile = async (req, res) => {
  try {
    const { id,username, password } = req.body;

    // เช็คว่ามีข้อมูลทั้ง username และ password หรือไม่
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }

    // ค้นหาผู้ใช้ที่มี username
    const renter = await Renter.findOne({
      where: {
        id : id,
        username_renter: username
      },
      attributes: ['username_renter', 'password_renter','id'] // เลือกเฉพาะฟิลด์ที่ต้องการ
    });

    // ถ้าผู้ใช้ไม่พบ
    if (!renter) {
      return res.json({
        status_code: 6000,
        message: "Fail",
        description: "User not found",
      });
    }

    // เช็คว่า password ของผู้ใช้เป็นค่าว่างหรือ null
    if (!renter.password_renter || renter.password_renter === null || renter.password_renter === '') {
      // บันทึก password ใหม่
      renter.password_renter = password; // ตั้งค่าคีย์ password ใหม่
      await renter.save(); // บันทึกลงฐานข้อมูล

      return res.json({
        status_code: 8000,
        message: "Success",
        description: "Password set succesfully",
      });
    } else {
      return res.json({
        status_code: 4000,
        message: "Fail",
        description: "Password is already set. No update needed.",
      });
    }
  } catch (error) {
    console.error("Error setting password:", error);
    return res.status(500).json({
      message: "An error occurred while setting password.",
      error: error.message,
    });
  }
};





exports.login_mobile = async (req, res) => {
  try {
    const { username, password } = req.body;

    // ค้นหาผู้ใช้จากตาราง Renter และดึงข้อมูล Communities ที่เกี่ยวข้อง
    let user = await Renter.findOne({
      where: { username_renter: username },
      include: [
        {
          model: Community, // เชื่อมกับโมเดล Community
          attributes: ['img_commu1', 'community_name_th'], // ดึงเฉพาะฟิลด์ที่ต้องการ
        },
        {
          model: Room, // เชื่อมกับโมเดล Community
          attributes: ['id','room_number','floor'], // ดึงเฉพาะฟิลด์ที่ต้องการ
        },
        {
          model: Building, // เชื่อมกับโมเดล Community
          as: 'building',
          attributes: ['building_name'],// ดึงเฉพาะฟิลด์ที่ต้องการ
        },
      ],
    });

    // ตรวจสอบว่าพบผู้ใช้หรือไม่
    if (user) {
      const isMatch = user.password_renter === password; // ตรวจสอบรหัสผ่าน
      if (!isMatch) {
        return res.status(200).json({
          status_code: 6000,
          message: "Login Fail",
          description: "Password Invalid",
          
        });;;
        
      }

      // เตรียมข้อมูลสำหรับสร้าง token
      const data = {
        id: user.id,
        first_name: user.first_name,
        img_commu1: user.Community?.img_commu1, // ดึงข้อมูลจากตาราง Community
        community_id : user.community_id,
        room_id : user.Room?.id,
        location: user.Community?.community_name_th,
        building_name: user.building?.building_name,
        room_number: user.Room?.room_number,
        floor: user.Room?.floor,
        phone_number : user.phone_number
      };

      // สร้าง JWT
      jwt.sign(data, "jwtsecret", { expiresIn: "30d" }, (err, token) => {
        if (err) throw err;

        res.json({
          status_code: 8000,
          message: "Success",
          description: "Login Success",
          data: {
            token,
          },
        });
      });
    } else {
      return res.status(200).json({
        status_code: 4000,
        message: "Login Fail",
        description: "ไม่พบผู้ใช้ในระบบ",
        
      });
    }
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).send("Server Error");
  }
};

// exports.login_mobile = async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     // ค้นหาผู้ใช้จากตาราง Renter และดึงข้อมูล Communities ที่เกี่ยวข้อง
//     let user = await Renter.findOne({
//       where: { username_renter: username },
//       include: [
//         {
//           model: Community, // เชื่อมกับโมเดล Community
//           attributes: ['img_commu1', 'community_name_th'], // ดึงเฉพาะฟิลด์ที่ต้องการ
//         },
//       ],
//     });

//     // ตรวจสอบว่าพบผู้ใช้หรือไม่
//     if (user) {
//       const isMatch = user.password_renter === password; // ตรวจสอบรหัสผ่าน
//       if (!isMatch) {
//         return res.status(400).json({
//           status_code: 4001,
//           message: "Password Invalid!!!",
//           description: "The password you entered is incorrect.",
//         });
//       }

//       // ถ้า flag_login ยังไม่เป็น true ให้ปรับเป็น true
//       if (!user.flag_login) {
//         user.flag_login = true;
//         await user.save(); // อัปเดตสถานะในฐานข้อมูล
//       }

//       // เตรียมข้อมูลสำหรับสร้าง token
//       const data = {
//         id: user.id,
//         first_name: user.first_name,
//         img_commu1: user.Community?.img_commu1, // ดึงข้อมูลจากตาราง Community
//         location: user.Community?.community_name_th,
//       };

//       // สร้าง JWT
//       jwt.sign(data, "jwtsecret", { expiresIn: "30d" }, (err, token) => {
//         if (err) throw err;

//         res.json({
//           status_code: 8000,
//           message: "Success",
//           description: "Login Success",
//           data: {
//             token,
//           },
//         });
//       });
//     } else {
//       return res.status(400).json({
//         status_code: 4002,
//         message: "User not found!!!",
//         description: "No account matches the provided username.",
//       });
//     }
//   } catch (err) {
//     console.error("Error during login:", err);
//     res.status(500).json({
//       status_code: 5000,
//       message: "Server Error",
//       description: "An error occurred during login.",
//     });
//   }
// };
