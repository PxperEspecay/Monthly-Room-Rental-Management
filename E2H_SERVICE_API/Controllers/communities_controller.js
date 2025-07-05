const Community = require("../Models/communities_model");
const Building = require('../Models/building_model');
const Room = require('../Models/room_model');
const { Op } = require('sequelize'); // เพิ่มบรรทัดนี้


exports.ListCommu = async (req, res) => {
    try {
      // ดึงรายการชุมชนทั้งหมด
      const communities = await Community.findAll();
  
      // ใช้ Promise.all เพื่อรันคิวรีหลายๆ ครั้งพร้อมกัน
      const result = await Promise.all(
        communities.map(async (community) => {
          // นับจำนวนอาคารที่เกี่ยวข้องกับชุมชนนี้
          const totalBuildings = await Building.count({
            where: { community_id: community.id }
          });
  
          // นับจำนวนห้องที่อยู่ในอาคารที่เกี่ยวข้องกับชุมชนนี้
          const totalRooms = await Room.count({
            where: {
              building_id: {
                [Op.in]: (
                  await Building.findAll({
                    where: { community_id: community.id },
                    attributes: ['id']
                  })
                ).map(building => building.id)
              }
            }
          });
  
          // คืนค่าข้อมูลชุมชนพร้อมฟิลด์ที่เพิ่มขึ้น
          return {
            ...community.toJSON(),
            total_buildings: totalBuildings,
            total_rooms: totalRooms
          };
        })
      );
  
      // ส่งผลลัพธ์กลับ
      res.status(200).json({
        status_code: 8000,
        message: "Success",
        description: "Get all Community List",
        data: result,
      });
    } catch (error) {
      console.error("Error fetching Community List:", error);
      res.status(500).json({
        status_code: 6000,
        message: "Error fetching Community List",
        description: error.message,
      });
    }
};

exports.CreateCommu = async (req, res) => {
  const CommuData = req.body;
  // ตรวจสอบว่าไฟล์ถูกอัพโหลด
  if (req.files) {
    // ตรวจสอบว่าแต่ละไฟล์ถูกอัพโหลดหรือไม่
    if (req.files.img_commu1) {
      const img_commu1 = `${req.files.img_commu1[0].path}`; // สร้าง URL สำหรับรูปภาพ
      CommuData.img_commu1 = img_commu1; // เพิ่ม path ของรูปภาพลงใน userData
    }
    if (req.files.img_commu2) {
      const img_commu2 = `${req.files.img_commu2[0].path}`; // สร้าง URL สำหรับรูปภาพ
      CommuData.img_commu2 = img_commu2; // เพิ่ม path ของรูปภาพลงใน userData
    }
    if (req.files.img_commu3) {
      const img_commu3 = `${req.files.img_commu3[0].path}`; // สร้าง URL สำหรับรูปภาพ
      CommuData.img_commu3 = img_commu3; // เพิ่ม path ของรูปภาพลงใน userData
    }
  }
  try {
    const newCommu = await Community.create(CommuData);
    res.status(200).json({
      status_code: 8000,
      message: "Success",
      description: "Create New community Done!",
      data: newCommu,
    });


  } catch (error) {
    console.error("Error Can't Create Commu:", error);
    let description = error.message;
    res.status(404).json({
      status_code: 6000,
      message: "Create new community fail",
      description: description,
    });
  }
};

exports.DetailsCommu = async (req, res) => {
  let id = req.body.id;
  console.log(id);
  try {
    const CommuData = await Community.findOne({
      where: {
        id: id,
      }
    });
    if (!CommuData) {
      return res.status(404).json({
        status_code: 404,
        message: "Not Found",
        description: "Communities not found",
      });
    }
    res.json({
      status_code: 8000,
      message: "Success",
      description: "Get Communities Success",
      data: CommuData,
    });
  } catch (error) {
    res.status(500).json({
      status_code: 6000,
      message: "Fails",
      description: "Failed to get communities",
      errors: error.message,
    });
  }
};

exports.UpdateCommu = async (req, res) => {
  const CommunitiesData = req.body;
  const CommunitiesID = req.body.id;
  // ตรวจสอบว่ามีไฟล์รูปภาพที่อัพโหลดมาหรือไม่
  if (req.files) {
    // ตรวจสอบว่าแต่ละไฟล์ถูกอัพโหลดหรือไม่
    if (req.files.img_commu1) {
      const img_commu1 = `${req.files.img_commu1[0].path}`; // สร้าง URL สำหรับรูปภาพ
      CommunitiesData.img_commu1 = img_commu1; // เพิ่ม path ของรูปภาพลงใน userData
    }
    if (req.files.img_commu2) {
      const img_commu2 = `${req.files.img_commu2[0].path}`; // สร้าง URL สำหรับรูปภาพ
      CommunitiesData.img_commu2 = img_commu2; // เพิ่ม path ของรูปภาพลงใน userData
    }
    if (req.files.img_commu3) {
      const img_commu3 = `${req.files.img_commu3[0].path}`; // สร้าง URL สำหรับรูปภาพ
      CommunitiesData.img_commu3 = img_commu3; // เพิ่ม path ของรูปภาพลงใน userData
    }
  }
  try {
    const UpdateCommu = await Community.update(CommunitiesData, {
      where: {
        id: CommunitiesID,
      },
      returning: true, // คืนค่าข้อมูลที่ถูกอัปเดต
    });

    const updatedCommunities = await Community.findByPk(CommunitiesID);

    res.status(200).json({
      status_code: 8000,
      message: "Success",
      description: "Update Communities Done!",
      data: updatedCommunities,
    });
  } catch (err) {
    console.error("Error Can't Update Communities:", err);
    let description = err.errors.map((e) => e.message);
    res.status(404).json({
      status_code: 6000,
      message: "Update new communities fail",
      description: description,
    });
  }
};

exports.GetMasterLocation = async (req, res) => {
  try {
    const communities = await Community.findAll({
      attributes: ['id', 'community_name_th'], // เลือกเฉพาะฟิลด์ที่ต้องการ
    });
    const Data = communities.map(community => ({
      id: community.id,
      location_name: community.community_name_th,
    }));
    res.status(200).json({
      status_code: 8000,
      message: "Success",
      description: "Get all Community Master Data",
      data: Data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status_code: 6000,
      message: "Error fetching Community Master Data",
      description: error.message,
    });
  }
};
