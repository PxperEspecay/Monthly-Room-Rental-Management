const Community = require("../Models/communities_model");
const Building = require("../Models/building_model");
const Room = require("../Models/room_model");
const { Op } = require("sequelize"); // เพิ่มบรรทัดนี้
const connection = require("../Config/db");
Building.hasMany(Room, { foreignKey: "building_id" });
Room.belongsTo(Building, { foreignKey: "building_id" });

exports.ListBuildingOfCommu = async (req, res) => {
  let community_id = req.body.community_id;

  try {
    // ดึงรายการตึกทั้งหมดใน community นั้น
    const buildings = await Building.findAll({
      where: { community_id: community_id },
    });

    // ตรวจสอบว่ามี building หรือไม่
    if (buildings.length === 0) {
      return res.status(404).json({
        status_code: 404,
        message: "Not Found",
        description: "Buildings not found in the specified community",
      });
    }

    // สร้าง array เพื่อเก็บข้อมูลตึกพร้อมจำนวนห้อง
    const buildingsWithRoomCount = await Promise.all(
      buildings.map(async (building) => {
        const totalRooms = await Room.count({
          where: { building_id: building.id },
        });

        return {
          building,
          total_rooms: totalRooms,
        };
      })
    );

    // คืนค่าผลลัพธ์พร้อมจำนวนห้องของแต่ละตึก
    res.status(200).json({
      status_code: 8000,
      message: "Success",
      description: "Get all Buildings in the community with room counts",
      data: buildingsWithRoomCount,
    });
  } catch (error) {
    res.status(500).json({
      status_code: 6000,
      message: "Fails",
      description: "Failed to get buildings",
      errors: error.message,
    });
  }
};

//   exports.CreateBuilding = async (req, res) => {
//     const BuildingData = req.body;
//     console.log(BuildingData);

//     try {
//       if (req.file) {
//         BuildingData.img_building = req.file.path;
//       }
//       const newBuilding = await Building.create(BuildingData);
//       res.status(200).json({
//         status_code: 8000,
//         message: "Success",
//         description: "Create New Building Done!",
//         data: newBuilding,
//       });
//     } catch (err) {
//       console.error("Error Can't Create New Building:", err);
//       let description = err.message;
//       res.status(404).json({
//         status_code: 6000,
//         message: "Create New Building fail",
//         description: description,
//       });
//     }
//   };

// exports.CreateBuilding = async (req, res) => {
//     const BuildingData = req.body;
//     console.log(BuildingData);
//     if (req.file) { // ตรวจสอบว่ามีไฟล์อัปโหลดเข้ามาหรือไม่
//         BuildingData.img_building = req.file.path; // เก็บเส้นทางของไฟล์
//     }

//     // ใช้ transaction เพื่อให้แน่ใจว่าทั้ง building และ rooms ถูกสร้างพร้อมกัน
//     const transaction = await connection.transaction();

//     try {

//       // บันทึกข้อมูล Building ก่อน
//       const newBuilding = await Building.create(
//         {
//           img_building: BuildingData.img_building,
//           building_name: BuildingData.building_name,
//           community_id: BuildingData.community_id,
//           floor: BuildingData.floors,
//         },
//         { transaction } // ผูกกับ transaction
//       );

//       // เตรียมข้อมูล rooms เพื่อบันทึกต่อ
//       const roomsData = BuildingData.rooms.map((room) => ({
//         room_number: room.room_number,
//         building_id: newBuilding.id, // เชื่อมโยงกับ building ที่เพิ่งสร้าง
//         floor: room.floor,
//       }));

//       // บันทึกข้อมูล rooms
//       await Room.bulkCreate(roomsData, { transaction });

//       // Commit transaction เมื่อทำทุกอย่างเสร็จสิ้น
//       await transaction.commit();

//       // ส่งข้อมูลตอบกลับหลังจากบันทึกสำเร็จ
//       res.status(200).json({
//         status_code: 8000,
//         message: "Success",
//         description: "Create New Building and Rooms Done!",
//         data: { newBuilding, rooms: roomsData },
//       });
//     } catch (err) {
//       // Rollback transaction ถ้ามีข้อผิดพลาด
//       await transaction.rollback();

//       console.error("Error Can't Create New Building and Rooms:", err);
//       let description = err.message;
//       res.status(500).json({
//         status_code: 6000,
//         message: "Create New Building and Rooms failed",
//         description: description,
//       });
//     }
//   };

exports.CreateBuilding = async (req, res) => {
  const BuildingData = req.body;

  // ตรวจสอบว่า rooms เป็น JSON string และทำการแปลงให้เป็นอาเรย์
  if (typeof BuildingData.rooms === "string") {
    try {
      BuildingData.rooms = JSON.parse(BuildingData.rooms);
    } catch (error) {
      return res.status(400).json({
        status_code: 6000,
        message: "Invalid JSON format for rooms",
        description: error.message,
      });
    }
  }

  // ตรวจสอบว่ามีไฟล์อัปโหลดเข้ามาหรือไม่
  if (req.file) {
    BuildingData.img_building = req.file.path; // เก็บเส้นทางของไฟล์
  }

  // ใช้ transaction เพื่อให้แน่ใจว่าทั้ง building และ rooms ถูกสร้างพร้อมกัน
  const transaction = await connection.transaction();

  try {
    // บันทึกข้อมูล Building ก่อน
    const newBuilding = await Building.create(
      {
        img_building: BuildingData.img_building,
        building_name: BuildingData.building_name,
        community_id: BuildingData.community_id,
        floor: BuildingData.floors,
      },
      { transaction } // ผูกกับ transaction
    );

    // เตรียมข้อมูล rooms เพื่อบันทึกต่อ
    const roomsData = BuildingData.rooms.map((room) => ({
      room_number: room.room_number,
      building_id: newBuilding.id, // เชื่อมโยงกับ building ที่เพิ่งสร้าง
      floor: room.floor,
    }));

    // บันทึกข้อมูล rooms
    await Room.bulkCreate(roomsData, { transaction });

    // Commit transaction เมื่อทำทุกอย่างเสร็จสิ้น
    await transaction.commit();

    // ส่งข้อมูลตอบกลับหลังจากบันทึกสำเร็จ
    res.status(200).json({
      status_code: 8000,
      message: "Success",
      description: "Create New Building and Rooms Done!",
      data: { newBuilding, rooms: roomsData },
    });
  } catch (err) {
    // Rollback transaction ถ้ามีข้อผิดพลาด
    await transaction.rollback();

    console.error("Error Can't Create New Building and Rooms:", err);
    let description = err.message;
    res.status(500).json({
      status_code: 6000,
      message: "Create New Building and Rooms failed",
      description: description,
    });
  }
};

exports.GetBuildingDetailsWithRooms = async (req, res) => {
  const { building_id } = req.body; // ดึง building_id จาก req.body

  if (!building_id) {
    return res.status(400).json({
      status_code: 6000,
      message: "Building ID is required",
    });
  }

  try {
    // ดึงข้อมูล Building พร้อมกับ Rooms ที่เกี่ยวข้อง
    const building = await Building.findOne({
      where: { id: building_id },
      include: [
        {
          model: Room,
          // as: 'rooms', // กำหนด alias
        },
      ],
    });

    if (!building) {
      return res.status(404).json({
        status_code: 6000,
        message: "Building not found",
      });
    }

    res.status(200).json({
      status_code: 8000,
      message: "Success",
      data: building,
    });
  } catch (error) {
    console.error("Error fetching building with rooms:", error);
    res.status(500).json({
      status_code: 6000,
      message: "Failed to fetch building and rooms",
      description: error.message,
    });
  }
};

exports.GetBuildingDetails = async (req, res) => {
  const { building_id } = req.body; // ดึง building_id จาก req.body

  if (!building_id) {
    return res.status(400).json({
      status_code: 6000,
      message: "Building ID is required",
    });
  }

  try {
    // ดึงข้อมูล Building อย่างเดียว โดยไม่รวม Rooms
    const building = await Building.findOne({
      where: { id: building_id },
    });

    if (!building) {
      return res.status(404).json({
        status_code: 6000,
        message: "Building not found",
      });
    }

    res.status(200).json({
      status_code: 8000,
      message: "Success",
      data: building,
    });
  } catch (error) {
    console.error("Error fetching building:", error);
    res.status(500).json({
      status_code: 6000,
      message: "Failed to fetch building",
      description: error.message,
    });
  }
};

exports.UpdateBuildingDetails = async (req, res) => {
  const BuildingData = req.body;
  const BuildingID = req.body.id;

  if (req.file) {
    BuildingData.img_building = req.file.path; // เก็บเส้นทางของไฟล์
  }

  if (!BuildingID) {
    return res.status(400).json({
      status_code: 6000,
      message: "Building ID is required",
    });
  }

  try {
    const UpdateBuildingDetails = await Building.update(BuildingData, {
      where: {
        id: BuildingID,
      },
      returning: true, // คืนค่าข้อมูลที่ถูกอัปเดต
    });

    const updatedBuilding = await Building.findByPk(BuildingID);

    res.status(200).json({
      status_code: 8000,
      message: "Success",
      description: "Update Building Details Done!",
      data: updatedBuilding,
    });
  } catch (err) {
    console.error("Error Can't Building Details:", err);
    let description = err.errors.map((e) => e.message);
    res.status(404).json({
      status_code: 6000,
      message: "Update Building Details fail",
      description: description,
    });
  }
};


// ฟังก์ชันสำหรับดึงข้อมูลอาคารตาม community_id
exports.GetMasterBuildings = async (req, res) => {
  const { community_id } = req.body; // รับ community_id จาก body

  try {
    // ตรวจสอบว่า community_id ถูกส่งมาหรือไม่
    if (!community_id) {
      return res.status(400).json({ 
        status_code: 6000,
        message: 'กรุณาระบุ community_id'});
    }
    
    // ค้นหาข้อมูลอาคารตาม community_id
    const buildings = await Building.findAll({
      where: { community_id },
      attributes: ['id', 'building_name'], // ดึงเฉพาะฟิลด์ id และ building_name
    });

    res.status(200).json({
      status_code: 8000,
      message: "Success",
      data: buildings,
    });
  } catch (error) {
    console.error("Error fetching master building:", error);
    res.status(500).json({
      status_code: 6000,
      message: "Failed to fetch master building",
      description: error.message,
    });
  }
};

