const Renter = require("../Models/renter_model");
const Room = require("../Models/room_model");
const Building = require("../Models/building_model");
const Role = require("../Models/role_model");
Renter.belongsTo(Room, { foreignKey: "room_id", as: "room" });
Renter.belongsTo(Building, { foreignKey: "building_id", as: "building" });
Room.hasMany(Renter, { foreignKey: "room_id", as: "renter" });
Building.hasMany(Room, { foreignKey: "building_id" });
Building.hasMany(Renter, { foreignKey: "building_id" });
Renter.belongsTo(Role, { foreignKey: "role_id", as: "role" });
// Room.belongsTo(Building, { foreignKey: "building_id" });
const connection = require("../Config/db");
const { Op } = require("sequelize");

exports.CreateRenter = async (req, res) => {
  const renterData = req.body;
  const passport_number = req.body.passport_number;
  const identity_card_number = req.body.identity_card_number;

  try {
    if (req.file) {
      renterData.file_contract = req.file.path; // เก็บเส้นทางของไฟล์
    }
    if (!renterData.phone_number || renterData.phone_number.length < 4) {
      throw new Error("Invalid phone_number");
    }
    if (passport_number === "") {
      renterData.passport_number = null;
    }
    if (identity_card_number === "") {
      renterData.identity_card_number = null;
    }
    // Generate username_renter จาก first_name และ 4 ตัวท้ายของ phone_number
    const lastFourDigits = renterData.phone_number.slice(-4);
    let firstUsernameDigits = renterData.email.split("@")[0];
    // เช็คว่าตัวอักษรตัวแรกเป็นตัวพิมพ์ใหญ่หรือไม่
    if (firstUsernameDigits[0] !== firstUsernameDigits[0].toUpperCase()) {
      // ถ้ายังไม่ใช่ตัวพิมพ์ใหญ่ ให้ปรับ
      firstUsernameDigits =
        firstUsernameDigits[0].toUpperCase() + firstUsernameDigits.slice(1);
    }
    renterData.username_renter = `${firstUsernameDigits}${lastFourDigits}`;

    const newRenter = await Renter.create(renterData);
    res.status(200).json({
      status_code: 8000,
      message: "Success",
      description: "Renter created successfully!",
      data: newRenter,
    });
  } catch (error) {
    console.error("Error Can't Create Renter:", error);
    let description = error.message;
    res.status(404).json({
      status_code: 6000,
      message: "Create new renter failed",
      description: description,
    });
  }
};

exports.GetRenterList = async (req, res) => {
  const { community_id, building_id } = req.body;

  try {
    // ✅ กำหนดเงื่อนไขเริ่มต้น: flag_active = 'Y'
    const conditions = {
      flag_active: "Y",
    };

    // ✅ เพิ่ม community_id หากส่งมา
    if (community_id && community_id !== "0" && community_id !== "") {
      conditions.community_id = community_id;
    }

    // ✅ เพิ่ม building_id หากส่งมาและไม่ใช่ 0
    if (building_id && building_id !== 0) {
      conditions.building_id = building_id;
    }

    const renterList = await Renter.findAll({
      where: conditions,
      attributes: [
        "id",
        "first_name",
        "last_name",
        "img_profile",
        "gender",
        "start_contract",
        "end_contract",
        [
          connection.literal(`DATEDIFF(end_contract, start_contract)`),
          "total_day",
        ],
        [
          connection.literal(
            `CASE 
                WHEN CURDATE() < start_contract THEN DATEDIFF(DATE_ADD(end_contract, INTERVAL 1 DAY), start_contract) 
                ELSE GREATEST(DATEDIFF(DATE_ADD(end_contract, INTERVAL 1 DAY), CURDATE()), 0) 
              END`
          ),
          "remaining_contract",
        ],
      ],
      include: [
        {
          model: Building,
          as: "building",
          attributes: ["building_name"],
        },
        {
          model: Room,
          as: "room",
          attributes: ["room_number", "floor", "id"],
        },
        {
          model: Role,
          as: "role",
          attributes: ["role_name"],
        },
      ],
    });

    res.status(200).json({
      status_code: 8000,
      message: "Success",
      description: "Renter list fetched successfully!",
      data: renterList,
    });
  } catch (error) {
    console.error("Error Can't Fetch Renter List:", error);
    res.status(500).json({
      status_code: 6000,
      message: "Fetch renter list failed",
      description: error.message,
    });
  }
};

exports.GetRenterDetails = async (req, res) => {
  const { id } = req.body; // รับ id ของ renter จาก request

  try {
    const renter = await Renter.findOne({
      where: { id },
      attributes: { exclude: ["username_renter", "password_renter"] },
      include: [
        {
          model: Building,
          as: "building",
          attributes: ["building_name"],
        },
        {
          model: Room,
          as: "room",
          attributes: ["room_number", "floor"],
        },
        {
          model: Role,
          as: "role",
          attributes: ["role_name"],
        },
      ],
    });

    // ตรวจสอบว่าเจอข้อมูลผู้เช่าหรือไม่
    if (!renter) {
      return res.status(404).json({
        status_code: 6000,
        message: "Renter not found",
        description: "No renter found with the given ID",
      });
    }

    // ✅ เพิ่ม remaining_contract
    if (renter.start_contract && renter.end_contract) {
      const today = new Date();
      const endDate = new Date(renter.end_contract);

      let remaining = 0;
      if (today < endDate) {
        const timeDiff = endDate.getTime() - today.getTime();
        remaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
      }

      renter.dataValues.remaining_contract = remaining;
    }

    res.status(200).json({
      status_code: 8000,
      message: "Success",
      description: "Renter details fetched successfully!",
      data: renter,
    });
  } catch (error) {
    console.error("Error Can't Fetch Renter Details:", error);
    let description = error.message;
    res.status(500).json({
      status_code: 6000,
      message: "Fetch renter details failed",
      description: description,
    });
  }
};

exports.DeleteRenter = async (req, res) => {
  const { id, flag_active, room_id } = req.body;

  try {
    // อัปเดต flag_active ของ renter ที่มี id ตรงกับที่ส่งมาเป็น "N"
    const renter = await Renter.update(
      {
        flag_active: flag_active || "N",
        end_contract: new Date().toISOString().slice(0, 10)  // ✅ ทำให้ remaining_contract = 0
      },
      { where: { id } }
    );

    if (renter[0] === 0) {
      // ตรวจสอบว่ามีการอัปเดตหรือไม่
      return res.status(404).json({
        status_code: 6001,
        message: "Delete renter failed",
        description: "Renter not found or already inactive",
      });
    }

    // เช็คห้องที่ผู้เช่าผูกกับ room_id
    const room = await Room.findOne({ where: { id: room_id } });

    if (!room) {
      return res.status(404).json({
        status_code: 6003,
        message: "Room not found",
        description: "No room found for the given room_id",
      });
    }

    // เช็คว่าห้องนี้ยังมีผู้เช่ารายอื่นหรือไม่
    const otherRenters = await Renter.count({
      where: { room_id: room.id, flag_active: "Y" },
    });

    // ถ้าไม่มีผู้เช่ารายอื่นในห้องนี้แล้ว อัปเดตสถานะห้องเป็น 'Y' (ห้องว่าง)
    if (otherRenters === 0) {
      await Room.update(
        { status_room: "Y" }, // กำหนดค่าให้ status_room เป็น 'Y' (ห้องว่าง)
        { where: { id: room.id } } // ใช้ room.id ในการอัปเดตสถานะห้อง
      );
    }

    res.status(200).json({
      status_code: 8000,
      message: "Success",
      description:
        "Renter marked as inactive and room updated to vacant if no other renters are present",
    });
  } catch (error) {
    console.error("Error Can't Delete Renter:", error);
    res.status(500).json({
      status_code: 6000,
      message: "Delete renter failed",
      description: error.message,
    });
  }
};

exports.UpdateRenterDetails = async (req, res) => {
  const updatedData = req.body; // ข้อมูลใหม่ที่ส่งมา

  try {
    const existingRenter = await Renter.findByPk(updatedData.id);
    if (!existingRenter) {
      throw new Error("Renter not found");
    }

    if (req.file) {
      updatedData.img_profile = req.file.path; // อัปเดตเส้นทางของไฟล์ใหม่
    }

    delete updatedData.start_contract;

    // อัปเดตข้อมูล renter
    await existingRenter.update(updatedData);

    res.status(200).json({
      status_code: 8000,
      message: "Success",
      description: "Renter details updated successfully!",
      data: existingRenter,
    });
  } catch (error) {
    console.error("Error Can't Update Renter Details:", error);
    let description = error.message;
    res.status(404).json({
      status_code: 6000,
      message: "Update renter details failed",
      description: description,
    });
  }
};

exports.GetMasterRenterList = async (req, res) => {
  const { community_id, building_id } = req.body;

  // ตรวจสอบว่ามี community_id หรือไม่
  if (!community_id) {
    return res.status(400).json({
      status_code: 6000,
      message: "Community ID is required",
    });
  }

  try {
    // กำหนดเงื่อนไขการค้นหา
    const conditions = {
      community_id,
      flag_active: "Y", // เฉพาะผู้เช่าที่ยัง active
    };

    // เพิ่มเงื่อนไข building_id หากมีค่า
    if (building_id && building_id !== 0) {
      conditions.building_id = building_id;
    }

    // ดึงข้อมูลผู้เช่าตามเงื่อนไข
    const renterList = await Renter.findAll({
      where: conditions,
      attributes: [
        "id",
        "first_name",
        "last_name",
        "img_profile", // เฉพาะฟิลด์ที่ต้องการ
      ],
      include: [
        {
          model: Building,
          as: "building",
          attributes: ["building_name"], // ดึงชื่ออาคาร
        },
        {
          model: Room,
          as: "room",
          attributes: ["room_number", "floor", "id"], // ดึงข้อมูลห้อง
        },
        {
          model: Role,
          as: "role",
          attributes: ["role_name"], // ดึงข้อมูลบทบาท
        },
      ],
    });

    // ส่งข้อมูลบิลกลับไป (กรณีไม่มีข้อมูลจะส่งเป็นอาร์เรย์ว่าง)
    return res.status(200).json({
      status_code: 8000,
      message: "Success",
      description:
        renterList.length > 0
          ? "Master renter list fetched successfully!"
          : "No renters found for the specified conditions.",
      data: renterList,
    });
  } catch (error) {
    console.error("Error fetching master renter list:", error);
    return res.status(500).json({
      status_code: 6000,
      message: "Fetch master renter list failed",
      description: error.message,
    });
  }
};



exports.EditDetailRenter = async (req, res) => {
  const renterData = req.body;
  const passport_number = req.body.passport_number;
  const identity_card_number = req.body.identity_card_number;

  const t = await connection.transaction(); // ✅ ใช้ transaction

  try {
    if (req.file) {
      renterData.file_contract = req.file.path;
    }

    if (Object.prototype.hasOwnProperty.call(renterData, 'phone_number')) {
      if (!renterData.phone_number || renterData.phone_number.length < 4) {
        throw new Error("Invalid phone_number");
      }
    }

    if (passport_number === "") renterData.passport_number = null;
    if (identity_card_number === "") renterData.identity_card_number = null;

    if (renterData.phone_number && renterData.email) {
      const lastFourDigits = renterData.phone_number.slice(-4);
      let firstUsernameDigits = renterData.email.split("@")[0];
      if (firstUsernameDigits[0] !== firstUsernameDigits[0].toUpperCase()) {
        firstUsernameDigits =
          firstUsernameDigits[0].toUpperCase() + firstUsernameDigits.slice(1);
      }
      renterData.username_renter = `${firstUsernameDigits}${lastFourDigits}`;
    }

    const renterId = renterData.renter_id;
    if (!renterId) throw new Error("Missing renter id");

    const oldRenter = await Renter.findByPk(renterId, { transaction: t });

    if (!oldRenter) throw new Error("Renter not found");

    const oldRoomId = oldRenter.room_id;
    const newRoomId = renterData.room_id;

    // ถ้ามีการเปลี่ยน room_id
    if (newRoomId && oldRoomId && newRoomId !== oldRoomId) {
      // ✅ ปรับห้องเก่าให้ว่าง
      await Room.update({ status_room: 'Y' }, {
        where: { id: oldRoomId },
        transaction: t,
      });

      // ✅ ปรับห้องใหม่ให้ไม่ว่าง
      await Room.update({ status_room: 'N' }, {
        where: { id: newRoomId },
        transaction: t,
      });
    }

    // ✅ อัปเดตข้อมูลผู้เช่า
    const [updatedCount, updatedRows] = await Renter.update(renterData, {
      where: { id: renterId },
      returning: true,
      transaction: t,
    });

    if (updatedCount === 0) {
      throw new Error("Renter not found during update");
    }

    await t.commit(); // ✅ commit เมื่อทุกอย่างผ่าน
    res.status(200).json({
      status_code: 8000,
      message: "Success",
      description: "Renter details updated successfully!",
      data: updatedRows[0],
    });

  } catch (error) {
    await t.rollback(); // ❌ rollback ถ้ามี error
    console.error("Error Can't Edit Renter Details:", error);
    res.status(500).json({
      status_code: 6000,
      message: "Edit renter details failed",
      description: error.message,
    });
  }
};

exports.GetHistoryRenterList = async (req, res) => {
  const { community_id, building_id } = req.body;

  try {
    // ✅ กำหนดเงื่อนไขเริ่มต้น: flag_active = 'Y'
    const conditions = {
      flag_active: "N",
    };

    // ✅ เพิ่ม community_id หากส่งมา
    if (community_id && community_id !== "0" && community_id !== "") {
      conditions.community_id = community_id;
    }

    // ✅ เพิ่ม building_id หากส่งมาและไม่ใช่ 0
    if (building_id && building_id !== 0) {
      conditions.building_id = building_id;
    }

    const renterList = await Renter.findAll({
      where: conditions,
      attributes: [
        "id",
        "first_name",
        "last_name",
        "img_profile",
        "gender",
        "start_contract",
        "end_contract",
        [
          connection.literal(`DATEDIFF(end_contract, start_contract)`),
          "total_day",
        ],
        [
          connection.literal(
            `CASE 
                WHEN CURDATE() < start_contract THEN DATEDIFF(DATE_ADD(end_contract, INTERVAL 1 DAY), start_contract) 
                ELSE GREATEST(DATEDIFF(DATE_ADD(end_contract, INTERVAL 1 DAY), CURDATE()), 0) 
              END`
          ),
          "remaining_contract",
        ],
      ],
      include: [
        {
          model: Building,
          as: "building",
          attributes: ["building_name"],
        },
        {
          model: Room,
          as: "room",
          attributes: ["room_number", "floor", "id"],
        },
        {
          model: Role,
          as: "role",
          attributes: ["role_name"],
        },
      ],
    });

    res.status(200).json({
      status_code: 8000,
      message: "Success",
      description: "Renter list fetched successfully!",
      data: renterList,
    });
  } catch (error) {
    console.error("Error Can't Fetch Renter List:", error);
    res.status(500).json({
      status_code: 6000,
      message: "Fetch renter list failed",
      description: error.message,
    });
  }
};

exports.GetDetailContract = async (req, res) => {
  const { id } = req.body;

  try {
    const renter = await Renter.findOne({
      where: { id },
      attributes: ["start_contract", "end_contract", "file_contract"]
    });

    if (!renter) {
      return res.status(404).json({
        status_code: 6000,
        message: "Renter not found",
        description: "No renter found with the given ID",
      });
    }

    // คำนวณจำนวนวันคงเหลือของสัญญา
    let remaining_contract = 0;
    if (renter.start_contract && renter.end_contract) {
      const today = new Date();
      const endDate = new Date(renter.end_contract);

      if (today < endDate) {
        const diffTime = endDate.getTime() - today.getTime();
        remaining_contract = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
    }

    res.status(200).json({
      status_code: 8000,
      message: "Success",
      description: "Contract details fetched successfully!",
      data: {
        start_contract: renter.start_contract,
        end_contract: renter.end_contract,
        file_contract: renter.file_contract,
        remaining_contract: remaining_contract
      }
    });
  } catch (error) {
    console.error("Error fetching contract details:", error);
    res.status(500).json({
      status_code: 6000,
      message: "Fetch contract details failed",
      description: error.message,
    });
  }
};


