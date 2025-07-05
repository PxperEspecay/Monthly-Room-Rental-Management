const Community = require("../Models/communities_model");
const Building = require("../Models/building_model");
const Room = require("../Models/room_model");
const Renter = require("../Models/renter_model");
const Users = require("../Models/usersModel");
const connection = require("../Config/db");
Building.hasMany(Room, { foreignKey: "building_id" });
Room.belongsTo(Building, { foreignKey: "building_id" });
// Room Model
Room.hasMany(Renter, { foreignKey: "room_id" }); // ห้องสามารถมีผู้เช่าได้หลายคน
// Renter Model
Renter.belongsTo(Room, { foreignKey: "room_id" }); // ผู้เช่าจะอยู่ในห้องเดียว

Community.hasMany(Building, { foreignKey: "community_id" });
Building.belongsTo(Community, {
  foreignKey: "community_id",
  as: "community",
});

exports.GetRoomsListByBuildingId = async (req, res) => {
  const { building_id } = req.body; // ดึง building_id จาก req.body

  if (!building_id) {
    return res.status(400).json({
      status_code: 6000,
      message: "Building ID is required",
    });
  }

  try {
    // ดึงข้อมูล Rooms ที่เกี่ยวข้องกับ building_id ที่กำหนด
    const rooms = await Room.findAll({
      where: { building_id: building_id }, // ใช้ building_id ในการค้นหา
    });

    if (!rooms || rooms.length === 0) {
      return res.status(404).json({
        status_code: 6000,
        message: "No rooms found for this building",
      });
    }

    res.status(200).json({
      status_code: 8000,
      message: "Success",
      data: rooms, // ส่งผลลัพธ์เป็น RoomsList
    });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({
      status_code: 6000,
      message: "Failed to fetch rooms",
      description: error.message,
    });
  }
};

exports.AddRoomToBuilding = async (req, res) => {
  const {
    building_id,
    room_number,
    floor,
    monthly_rent_amount,
    rental_deposit,
    garbage_amount,
  } = req.body; // รับข้อมูลห้องและ building_id จาก req.body

  if (
    !building_id ||
    !room_number ||
    !floor ||
    !monthly_rent_amount ||
    !rental_deposit ||
    !garbage_amount
  ) {
    return res.status(400).json({
      status_code: 6000,
      message: "Building ID, Room Number, and Floor are required",
    });
  }

  try {
    // ตรวจสอบว่า building_id ที่ส่งมามีอยู่จริงในระบบหรือไม่
    const buildingExists = await Building.findByPk(building_id);

    if (!buildingExists) {
      return res.status(404).json({
        status_code: 6000,
        message: "Building not found",
      });
    }

    // เพิ่มข้อมูลห้องใหม่ในฐานข้อมูล โดยเชื่อมโยงกับ building_id ที่ระบุ
    const newRoom = await Room.create({
      building_id: building_id,
      room_number: room_number,
      floor: floor,
      monthly_rent_amount: monthly_rent_amount,
      rental_deposit: rental_deposit,
      garbage_amount: garbage_amount,
    });

    res.status(201).json({
      status_code: 8000,
      message: "Room added successfully",
      data: newRoom, // ส่งคืนข้อมูลห้องที่ถูกสร้าง
    });
  } catch (error) {
    console.error("Error adding room to building:", error);
    res.status(500).json({
      status_code: 6000,
      message: "Failed to add room to building",
      description: error.message,
    });
  }
};

exports.DeleteRoomFromBuilding = async (req, res) => {
  const { building_id, room_id } = req.body; // รับ building_id และ room_id จาก req.body

  if (!building_id || !room_id) {
    return res.status(400).json({
      status_code: 6000,
      message: "Building ID and Room ID are required",
    });
  }

  try {
    // ตรวจสอบว่า building_id และ room_id ที่ส่งมามีอยู่จริงในระบบหรือไม่
    const room = await Room.findOne({
      where: {
        id: room_id,
        building_id: building_id,
      },
    });

    if (!room) {
      return res.status(404).json({
        status_code: 6000,
        message: "Room not found in the specified building",
      });
    }

    // ลบห้องออกจากฐานข้อมูล
    await room.destroy();

    res.status(200).json({
      status_code: 8000,
      message: "Room deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting room from building:", error);
    res.status(500).json({
      status_code: 6000,
      message: "Failed to delete room from building",
      description: error.message,
    });
  }
};

exports.GetRoomDetails = async (req, res) => {
  const { room_id } = req.body; // รับ room_id จาก req.body

  if (!room_id) {
    return res.status(400).json({
      status_code: 6000,
      message: "Room ID is required",
    });
  }

  try {
    // ค้นหาห้องโดยใช้ room_id
    const room = await Room.findByPk(room_id);

    if (!room) {
      return res.status(404).json({
        status_code: 6000,
        message: "Room not found",
      });
    }

    res.status(200).json({
      status_code: 8000,
      message: "Success",
      data: room, // ส่งข้อมูลของห้องกลับไปใน response
    });
  } catch (error) {
    console.error("Error fetching room details:", error);
    res.status(500).json({
      status_code: 6000,
      message: "Failed to fetch room details",
      description: error.message,
    });
  }
};

exports.UpdateRoomDetails = async (req, res) => {
  const {
    room_id,
    room_number,
    floor,
    status_room,
    monthly_rent_amount,
    rental_deposit,
    garbage_amount,
  } = req.body; // รับข้อมูลที่ต้องการอัปเดตจาก req.body

  if (!room_id) {
    return res.status(400).json({
      status_code: 6000,
      message: "Room ID is required",
    });
  }

  try {
    // ตรวจสอบว่า room_id ที่ส่งมามีอยู่จริงในระบบหรือไม่
    const room = await Room.findByPk(room_id);

    if (!room) {
      return res.status(404).json({
        status_code: 6000,
        message: "Room not found",
      });
    }

    // อัปเดตข้อมูลห้องตามข้อมูลที่ส่งมา
    room.room_number = room_number || room.room_number; // หากไม่ได้ส่งค่าใหม่มา ให้คงค่าดั้งเดิมไว้
    room.floor = floor || room.floor;
    room.status_room = status_room || room.status_room;
    room.monthly_rent_amount = monthly_rent_amount || room.monthly_rent_amount;
    room.rental_deposit = rental_deposit || room.rental_deposit;
    room.garbage_amount = garbage_amount || room.garbage_amount;

    // บันทึกการเปลี่ยนแปลงในฐานข้อมูล
    await room.save();

    res.status(200).json({
      status_code: 8000,
      message: "Room updated successfully",
      data: room, // ส่งคืนข้อมูลห้องที่อัปเดตแล้ว
    });
  } catch (error) {
    console.error("Error updating room details:", error);
    res.status(500).json({
      status_code: 6000,
      message: "Failed to update room details",
      description: error.message,
    });
  }
};

// ฟังก์ชันสำหรับดึงข้อมูลห้องว่างตาม community และ building
exports.GetAvailableRooms = async (req, res) => {
  const { community_id, building_id, role_id } = req.body; // รับ community_id, building_id และ role_id จาก body

  try {
    // ตรวจสอบว่า community_id ถูกส่งมาหรือไม่
    if (!community_id) {
      return res
        .status(400)
        .json({ status_code: 6000, message: "กรุณาระบุ community_id" });
    }

    // ตั้งค่าตัวกรองข้อมูล
    const filters = {};

    // กำหนดตัวกรองของ community
    filters["$Building.community_id$"] = community_id;

    // หากมีการส่ง building_id มาและไม่ใช่ 0 หรือ null ให้เพิ่มตัวกรอง building_id
    if (building_id) {
      filters.building_id = building_id;
    }

    // ตรวจสอบ role_id
    if (role_id === 3 || role_id === "3") {
      // ถ้า role_id = 3 ให้กรองเฉพาะห้องที่มี status_room == 'Y'
      filters.status_room = "Y";
    }
    // ถ้า role_id เป็น 4 ไม่ต้องกรอง status_room

    // ค้นหาข้อมูลห้องโดยรวมข้อมูลจาก Building
    const availableRooms = await Room.findAll({
      where: filters,
      attributes: ["id", "room_number"],
      include: [
        {
          model: Building,
          attributes: [], // ไม่จำเป็นต้องดึงข้อมูลของ Building ออกมา
        },
      ],
    });

    res.status(200).json({
      status_code: 8000,
      message: "Success",
      data: availableRooms,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status_code: 6000,
      message: "Failed to fetch available rooms",
      description: error.message,
    });
  }
};

exports.UpdateRoomStatus = async (req, res) => {
  const { room_id, status_room } = req.body; // รับข้อมูลที่ต้องการอัปเดตจาก req.body

  if (!room_id) {
    return res.status(400).json({
      status_code: 6000,
      message: "Room ID is required",
    });
  }

  try {
    // ตรวจสอบว่า room_id ที่ส่งมามีอยู่จริงในระบบหรือไม่
    const room = await Room.findByPk(room_id);

    if (!room) {
      return res.status(404).json({
        status_code: 6000,
        message: "Room not found",
      });
    }

    // อัปเดตข้อมูลห้องตามข้อมูลที่ส่งมา
    room.status_room = status_room || room.status_room;

    // บันทึกการเปลี่ยนแปลงในฐานข้อมูล
    await room.save();

    res.status(200).json({
      status_code: 8000,
      message: "Room Status updated successfully",
      data: room, // ส่งคืนข้อมูลห้องที่อัปเดตแล้ว
    });
  } catch (error) {
    console.error("Error updating room status:", error);
    res.status(500).json({
      status_code: 6000,
      message: "Failed to update room status",
      description: error.message,
    });
  }
};

exports.GetRoomsListWithRenter = async (req, res) => {
  const { community_id, building_id } = req.body;

  try {
    const buildingCondition = {};

    if (building_id && building_id !== 0) {
      buildingCondition.id = building_id;
    }

    if (community_id && community_id !== "0" && community_id !== "") {
      buildingCondition.community_id = community_id;
    }

    const rooms = await Room.findAll({
      attributes: ["id", "room_number", "status_room"],
      include: [
        {
          model: Renter,
          attributes: [
            "id",
            "img_profile",
            "gender",
            "prefix",
            "first_name",
            "last_name",
            "nick_name",
            "email",
            "phone_number",
            "role_id",
          ],
          where: { flag_active: "Y" },
          required: false,
        },
        {
          model: Building,
          attributes: [],
          where:
            Object.keys(buildingCondition).length > 0
              ? buildingCondition
              : undefined,
        },
      ],
    });

    // ✅ สรุปข้อมูล
    const total_room = rooms.length;
    let available_room = 0;
    let unavailable_room = 0;
    let total_renter = 0;

    for (const room of rooms) {
      // ห้องว่าง = Y / ไม่ว่าง = N
      if (room.status_room === "Y") {
        available_room++;
      } else if (room.status_room === "N") {
        unavailable_room++;
      }

      const renters = room.Renters || room.Renter || [];
      if (Array.isArray(renters)) {
        total_renter += renters.length;
      } else if (renters) {
        total_renter += 1;
      }
    }

    return res.status(200).json({
      status_code: 8000,
      message: "Success",
      data: {
        total_room,
        available_room,
        unavailable_room,
        total_renter,
        room_with_renter: rooms,
      },
    });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({
      status_code: 6000,
      message: "Failed to fetch rooms",
      description: error.message,
    });
  }
};

exports.GetUnavaliableRoomWithRenter = async (req, res) => {
  const { community_id, building_id } = req.body; // รับ community_id และ building_id จาก body

  // ตรวจสอบว่ามี community_id หรือไม่
  if (!community_id) {
    return res.status(400).json({
      status_code: 6000,
      message: "Community ID is required",
    });
  }

  try {
    // กำหนดเงื่อนไขสำหรับ building_id
    const buildingCondition =
      building_id && building_id !== 0
        ? { id: building_id, community_id } // ถ้ามี building_id ให้กรอง
        : { community_id }; // ถ้าไม่มีให้ดึงข้อมูลทั้งหมดของ community_id

    // ค้นหา Rooms ที่ status_room = 'N' พร้อมข้อมูล Renter
    const rooms = await Room.findAll({
      attributes: ["id", "room_number", "status_room"], // เลือกข้อมูลที่ต้องการจาก Room
      where: { status_room: "N" }, // เงื่อนไขห้องที่ไม่ว่าง

      include: [
        {
          model: Renter, // ความสัมพันธ์กับ Renter
          attributes: [
            "id",
            "img_profile",
            "gender",
            "prefix",
            "first_name",
            "last_name",
            "nick_name",
            "email",
            "phone_number",
            "role_id",
          ], // ดึงเฉพาะฟิลด์ที่ต้องการ
          where: { flag_active: "Y" }, // ดึงเฉพาะ Renter ที่ยัง Active
          required: false, // อนุญาตให้บางห้องไม่มีผู้เช่าได้
        },
        {
          model: Building, // เชื่อมกับ Building
          attributes: [], // ไม่ต้องดึงข้อมูลอาคาร แต่ใช้กรองเงื่อนไข
          where: buildingCondition, // กรองเฉพาะอาคารในชุมชนที่กำหนด
        },
      ],
    });

    // ส่งผลลัพธ์
    res.status(200).json({
      status_code: 8000,
      message: "Success",
      data: rooms, // คืนค่าห้องที่ไม่ว่างและข้อมูลผู้เช่า
    });
  } catch (error) {
    console.error("Error fetching unavailable rooms:", error);
    res.status(500).json({
      status_code: 6000,
      message: "Failed to fetch unavailable rooms",
      description: error.message,
    });
  }
};

exports.GetRenterByRoomID = async (req, res) => {
  const { room_id } = req.body; // รับ room_id จาก req.body

  // ตรวจสอบว่า room_id ถูกส่งมาหรือไม่
  if (!room_id) {
    return res.status(400).json({
      status_code: 6000,
      message: "Room ID is required",
    });
  }

  try {
    // ค้นหาห้องที่มี id ตรงกับ room_id พร้อมรวมข้อมูลผู้เช่าที่มี flag_active เป็น 'Y'
    const room = await Room.findOne({
      where: { id: room_id },
      attributes: [
        "id",
        "room_number",
        "status_room",
        "monthly_rental_price",
        "garbage_price",
      ], // ระบุข้อมูลของ Room ที่ต้องการ
      include: [
        {
          model: Renter, // เชื่อมความสัมพันธ์กับ Renter
          attributes: [
            "id",
            "img_profile",
            "gender",
            "prefix",
            "first_name",
            "last_name",
            "nick_name",
            "email",
            "phone_number",
            "role_id",
          ],
          where: { flag_active: "Y" }, // ดึงเฉพาะผู้เช่าที่ active
          required: false, // ยอมให้ห้องไม่มีผู้เช่าก็ได้
        },
      ],
    });

    // หากไม่พบห้องที่มี room_id ดังกล่าว
    if (!room) {
      return res.status(404).json({
        status_code: 6000,
        message: "Room not found",
      });
    }

    // สร้าง object ผลลัพธ์ที่รวมข้อมูล Room และ Renters
    const result = {
      id: room.id,
      room_number: room.room_number,
      status_room: room.status_room,
      monthly_rental_price: room.monthly_rental_price,
      garbage_price: room.garbage_price,
      renters: room.Renters, // รายการผู้เช่า (อาจเป็น array ว่างถ้าไม่มี)
    };

    // ส่งผลลัพธ์: ส่งข้อมูลผู้เช่าที่พบในห้องนั้น (room.Renters)
    return res.status(200).json({
      status_code: 8000,
      message: "Success",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching renters for room:", error);
    return res.status(500).json({
      status_code: 6000,
      message: "Failed to fetch renters",
      description: error.message,
    });
  }
};

exports.GetRoomById = async (req, res) => {
  const { id } = req.body;

  try {
    const room = await Room.findByPk(id);
    if (!room) {
      return res.status(404).json({
        status_code: 6000,
        message: "Room not found",
      });
    }

    res.status(200).json({
      status_code: 8000,
      data: room,
    });
  } catch (error) {
    res.status(500).json({
      status_code: 6000,
      message: "Error fetching room",
      description: error.message,
    });
  }
};

exports.GetLocationDetail = async (req, res) => {
  const { renter_id, community_id } = req.body;

  if (!renter_id || !community_id) {
    return res.status(400).json({
      status_code: 400,
      message: "Missing renter_id or community_id",
    });
  }

  try {
    const renterData = await Renter.findOne({
      where: {
        id: renter_id,
        "$Room.Building.community_id$": community_id,
      },
      attributes: ["id", "room_id"],
      include: [
        {
          model: Room,
          attributes: ["room_number", "floor"],
          include: [
            {
              model: Building,
              attributes: ["building_name", "community_id"],
              include: [
                {
                  model: Community,
                  attributes: [
                    "address_moo",
                    "street",
                    "province",
                    "district",
                    "sub_district",
                    "zip_code",
                  ],
                  // ✅ ใช้ as ถ้าตั้งไว้ใน associate
                  as: "community"
                },
              ],
            },
          ],
        },
      ],
    });

    // ✅ ใช้ .Room และ .Building ตามที่ Sequelize ให้มา
    if (
      !renterData ||
      !renterData.Room ||
      !renterData.Room.Building ||
      !renterData.Room.Building.community
    ) {
      console.log("renterData:", JSON.stringify(renterData, null, 2));
      return res.status(404).json({
        status_code: 404,
        message: "Not Found",
        description: "Renter location or community not found",
      });
    }

    const room = renterData.Room;
    const buildingData = room.Building;
    const communityData = buildingData.community;

    res.status(200).json({
      status_code: 8000,
      message: "Success",
      description: "Get renter location detail",
      data: {
        room_number: room.room_number,
        floor: room.floor,
        building_name: buildingData.building_name,
        address: {
          address_moo: communityData.address_moo,
          street: communityData.street,
          province: communityData.province,
          district: communityData.district,
          sub_district: communityData.sub_district,
          zip_code: communityData.zip_code,
        },
      },
    });
  } catch (error) {
    console.error("Error in GetLocationDetail:", error);
    res.status(500).json({
      status_code: 6000,
      message: "Failed",
      description: "Failed to get location detail",
      errors: error.errors
        ? error.errors.map((e) => e.message)
        : [error.message],
    });
  }
};