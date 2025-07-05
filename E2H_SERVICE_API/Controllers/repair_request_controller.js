const { Op, literal } = require("sequelize");
const connection = require("../Config/db");
const Users = require("../Models/usersModel");
const Renter = require("../Models/renter_model");
const RepairRequest = require("../Models/repair_request_model");
const RepairSchedule = require("../Models/repair_schedule_model");
const Room = require("../Models/room_model");
const Building = require("../Models/building_model");
const Notification = require("../Models/notification_model");
const NotificationMapping = require("../Models/notification_mapping_model");
const {
  createNotification,
} = require("../Controllers/notification_controller");
// 1. RepairRequest เชื่อมกับ Renter (ผู้เช่าแจ้งซ่อม)
Renter.hasMany(RepairRequest, { foreignKey: "renter_id" });
RepairRequest.belongsTo(Renter, { foreignKey: "renter_id" });

// 2. RepairRequest เชื่อมกับ User (แอดมินที่อนุมัติแจ้งซ่อม)
Users.hasMany(RepairRequest, { foreignKey: "admin_id" });
RepairRequest.belongsTo(Users, { foreignKey: "admin_id" });

// 3. RepairRequest เชื่อมกับ RepairSchedule (นัดหมายซ่อม)
RepairRequest.hasOne(RepairSchedule, { foreignKey: "repair_request_id" });
RepairSchedule.belongsTo(RepairRequest, { foreignKey: "repair_request_id" });

function formatThaiDate(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDate();
  const monthNames = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear() + 543; // แปลง ค.ศ. → พ.ศ.

  return `${day} ${month} ${year}`;
}

// exports.CreateRepairRequest = async (req, res) => {
//   const RequestRepairData = req.body;

//   if (req.files) {
//     // ตรวจสอบว่าแต่ละไฟล์ถูกอัพโหลดหรือไม่
//     if (req.files.photo_url) {
//       const photo_url = `${req.files.photo_url[0].path}`; // สร้าง URL สำหรับรูปภาพ
//       RequestRepairData.photo_url = photo_url; // เพิ่ม path ของรูปภาพลงใน userData
//     }
//     if (req.files.photo_url2) {
//       const photo_url2 = `${req.files.photo_url2[0].path}`; // สร้าง URL สำหรับรูปภาพ
//       RequestRepairData.photo_url2 = photo_url2; // เพิ่ม path ของรูปภาพลงใน userData
//     }
//     if (req.files.photo_url3) {
//       const photo_url3 = `${req.files.photo_url3[0].path}`; // สร้าง URL สำหรับรูปภาพ
//       RequestRepairData.photo_url3 = photo_url3; // เพิ่ม path ของรูปภาพลงใน userData
//     }
//     if (req.files.photo_url4) {
//       const photo_url4 = `${req.files.photo_url4[0].path}`; // สร้าง URL สำหรับรูปภาพ
//       RequestRepairData.photo_url4 = photo_url4; // เพิ่ม path ของรูปภาพลงใน userData
//     }
//     if (req.files.photo_url5) {
//       const photo_url5 = `${req.files.photo_url5[0].path}`; // สร้าง URL สำหรับรูปภาพ
//       RequestRepairData.photo_url5 = photo_url5; // เพิ่ม path ของรูปภาพลงใน userData
//     }
//   }

//   try {
//     if (
//       !RequestRepairData.renter_id ||
//       !RequestRepairData.room_id ||
//       !RequestRepairData.issue_title ||
//       !RequestRepairData.type_repair_id ||
//       !RequestRepairData.issue_description ||
//       !RequestRepairData.callback_phone
//     ) {
//       return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
//     }

//     // สร้างรายการ RepairRequest ใหม่ในฐานข้อมูล
//     const NewRepairRequest = await RepairRequest.create(RequestRepairData);
//     res.status(200).json({
//       status_code: 8000,
//       message: "Success",
//       description: "New RepairRequest created successfully!",
//       data: NewRepairRequest,
//     });
//   } catch (error) {
//     console.error("Error creating RepairRequest:", error);
//     return res.status(500).json({
//       status_code: 6000,
//       message: "Fail",
//       description: "เกิดข้อผิดพลาดในการสร้างรายการแจ้งซ่อม",
//     });
//   }
// };

// controllers/repairRequestController.js

exports.CreateRepairRequest = async (req, res) => {
  // เริ่ม transaction เพื่อให้มั่นใจว่าทั้งการสร้างคำขอซ่อมและการแจ้งเตือนจะถูกบันทึกพร้อมกัน
  const transaction = await connection.transaction();

  const RequestRepairData = req.body;

  if (req.files) {
    // ตรวจสอบว่าแต่ละไฟล์ถูกอัพโหลดหรือไม่
    if (req.files.photo_url) {
      const photo_url = `${req.files.photo_url[0].path}`; // สร้าง URL สำหรับรูปภาพ
      RequestRepairData.photo_url = photo_url; // เพิ่ม path ของรูปภาพลงใน userData
    }
    if (req.files.photo_url2) {
      const photo_url2 = `${req.files.photo_url2[0].path}`; // สร้าง URL สำหรับรูปภาพ
      RequestRepairData.photo_url2 = photo_url2; // เพิ่ม path ของรูปภาพลงใน userData
    }
    if (req.files.photo_url3) {
      const photo_url3 = `${req.files.photo_url3[0].path}`; // สร้าง URL สำหรับรูปภาพ
      RequestRepairData.photo_url3 = photo_url3; // เพิ่ม path ของรูปภาพลงใน userData
    }
    if (req.files.photo_url4) {
      const photo_url4 = `${req.files.photo_url4[0].path}`; // สร้าง URL สำหรับรูปภาพ
      RequestRepairData.photo_url4 = photo_url4; // เพิ่ม path ของรูปภาพลงใน userData
    }
    if (req.files.photo_url5) {
      const photo_url5 = `${req.files.photo_url5[0].path}`; // สร้าง URL สำหรับรูปภาพ
      RequestRepairData.photo_url5 = photo_url5; // เพิ่ม path ของรูปภาพลงใน userData
    }
  }

  try {
    if (
      !RequestRepairData.renter_id ||
      !RequestRepairData.room_id ||
      !RequestRepairData.issue_title ||
      !RequestRepairData.type_repair_id ||
      !RequestRepairData.issue_description ||
      !RequestRepairData.callback_phone
    ) {
      return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }

    // 1. สร้างรายการ RepairRequest ใหม่ในฐานข้อมูล
    const NewRepairRequest = await RepairRequest.create(RequestRepairData, {
      transaction,
    });

    // 2. ดึงข้อมูลของห้องเพื่อใช้ในการแจ้งเตือน
    const room = await Room.findByPk(RequestRepairData.room_id, {
      transaction,
    });

    // 3. สร้างข้อความแจ้งเตือน
    const notificationData = {
      notification_type: "แจ้งซ่อม",
      title: "มีการแจ้งซ่อมใหม่",
      message: `ผู้เช่าห้อง ${room.room_number} แจ้งซ่อม: ${RequestRepairData.issue_title}`,
      // notification_type: 'repair',
      notification_no: NewRepairRequest.id,
      // reference_type: 'repair_requests',
      path: `/repair-request-management/details?id=${NewRepairRequest.id}&status=waiting_to_check`,
    };

    // 4. บันทึกข้อมูลการแจ้งเตือนลงในตาราง notifications
    const newNotification = await Notification.create(notificationData, {
      transaction,
    });

    // เพิ่มบรรทัดนี้เพื่อให้แน่ใจว่าได้ ID ที่ถูกต้อง
    const verifiedNotification = await Notification.findByPk(
      newNotification.notification_id,
      { transaction }
    );

    console.log("New notification ID:", verifiedNotification.id);

    const renter = await Renter.findByPk(RequestRepairData.renter_id, {
      transaction,
    });

    // 5. ค้นหาแอดมินในระบบเพื่อส่งการแจ้งเตือน
    const admins = await Users.findAll({
      where: { role_id: 2, location: renter.community_id },
      transaction,
    });

    // 6. สร้างการแจ้งเตือนสำหรับแอดมินแต่ละคน
    const notificationMappings = admins.map((admin) => ({
      notification_id: newNotification.notification_id,
      admin_id: admin.id,
      role_id: 2,
    }));

    // 7. บันทึกการแจ้งเตือนในตาราง notification_mapping
    await NotificationMapping.bulkCreate(notificationMappings, { transaction });

    // 8. Commit transaction เมื่อทุกอย่างสำเร็จ
    await transaction.commit();

    res.status(200).json({
      status_code: 8000,
      message: "Success",
      description: "New RepairRequest created successfully!",
      data: NewRepairRequest,
    });
  } catch (error) {
    // Rollback ทุกอย่างหากเกิดข้อผิดพลาด
    await transaction.rollback();

    console.error("Error creating RepairRequest:", error);
    return res.status(500).json({
      status_code: 6000,
      message: "Fail",
      description: "เกิดข้อผิดพลาดในการสร้างรายการแจ้งซ่อม",
    });
  }
};

exports.EditRepairRequestDetails = async (req, res) => {
  const transaction = await connection.transaction();
  const RequestRepairData = req.body;

  try {
    if (!RequestRepairData.id || !RequestRepairData.renter_id) {
      return res.status(400).json({ message: "กรุณาระบุ id และ renter_id" });
    }

    // 📷 จัดการไฟล์รูปภาพใหม่ถ้ามี
    if (req.files) {
      for (let i = 1; i <= 5; i++) {
        const key = `photo_url${i === 1 ? "" : i}`;
        if (req.files[key]) {
          RequestRepairData[key] = req.files[key][0].path;
        }
      }
    }

    // 1. อัปเดตข้อมูลการแจ้งซ่อม
    const updateResult = await RepairRequest.update(RequestRepairData, {
      where: { id: RequestRepairData.id },
      transaction,
    });

    if (updateResult[0] === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: "ไม่พบรายการแจ้งซ่อม" });
    }

    // ✅ 2. หากมีการขอเลื่อนนัด → บันทึก repair_schedule
    if (
      RequestRepairData.rescheduled_by_renter === true &&
      RequestRepairData.requested_new_date &&
      RequestRepairData.requested_new_time_period
    ) {
      await RepairSchedule.create(
        {
          repair_request_id: RequestRepairData.id,
          selected_date: RequestRepairData.requested_new_date,
          selected_time_period: RequestRepairData.requested_new_time_period,
          status: "reschedule_requested",
          rescheduled_by_renter: true,
        },
        { transaction }
      );
    }

    // ✅ 3. ดึงข้อมูล renter และห้อง
    const renter = await Renter.findByPk(RequestRepairData.renter_id, {
      transaction,
    });

    if (!renter || !renter.room_id) {
      await transaction.rollback();
      return res.status(404).json({ message: "ไม่พบข้อมูลผู้เช่าหรือห้องพัก" });
    }

    const room = await Room.findByPk(renter.room_id, { transaction });

    if (!room) {
      await transaction.rollback();
      return res.status(404).json({ message: "ไม่พบข้อมูลห้องพัก" });
    }

    // ✅ 4. สร้างข้อความแจ้งเตือน
    const notification_type = "แจ้งซ่อม";
    const title = `มีการอัพเดตใหม่`;
    const message = `ผู้เช่าห้อง ${room.room_number} แก้ไขข้อมูลซ่อม: ${RequestRepairData.issue_title}`;
    const path = `/repair-request-management/details?id=${RequestRepairData.id}&status=waiting_to_check`;

    const notification = await Notification.create(
      {
        notification_type,
        title,
        message,
        path,
        // type: 'repair_update',
        notification_no: RequestRepairData.id,
        created_date: new Date(),
      },
      { transaction }
    );

    // ✅ 5. หาผู้ดูแล (admin) ที่เกี่ยวข้อง
    const admins = await Users.findAll({
      where: {
        role_id: 2,
        location: renter.community_id,
      },
      transaction,
    });

    if (!admins || admins.length === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: "ไม่พบผู้ดูแลในพื้นที่นี้" });
    }

    // ✅ 6. สร้าง mapping แจ้งเตือน
    const mappings = admins.map((admin) => ({
      notification_id: notification.notification_id,
      admin_id: admin.id,
      role_id: 2,
    }));

    await NotificationMapping.bulkCreate(mappings, { transaction });

    // ✅ 7. commit ทุกอย่าง
    await transaction.commit();

    return res.status(200).json({
      status_code: 8000,
      message: "Success",
      description: "อัปเดตข้อมูลการแจ้งซ่อมและส่งแจ้งเตือนเรียบร้อยแล้ว",
      data: RequestRepairData,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating RepairRequest:", error);

    return res.status(500).json({
      status_code: 6000,
      message: "Fail",
      description: "เกิดข้อผิดพลาดในการอัปเดตข้อมูลการแจ้งซ่อม",
      error: error.message,
    });
  }
};

exports.UpdateRepairRequestStatus = async (req, res) => {
  const transaction = await connection.transaction();

  try {
    const { id, status, admin_id, rescheduled_reason_by_admin } = req.body;

    const repairRequest = await RepairRequest.findByPk(id, { transaction });

    if (!repairRequest) {
      await transaction.rollback();
      return res.status(404).json({ message: "ไม่พบการแจ้งซ่อม" });
    }

    const now = new Date();

    // อัปเดต admin_id และ status พื้นฐาน
    repairRequest.admin_id = admin_id;
    repairRequest.status = status;

    // ✅ กรณี approved → เปลี่ยนเป็น pending + แจ้งเตือน
    if (status === "approved") {
      repairRequest.status = "pending";
      repairRequest.approved_at = now
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      const repair_request = await RepairRequest.findByPk(id, { transaction });
      const renter = await Renter.findByPk(repairRequest.renter_id, {
        transaction,
      });

      if (renter) {
        const room = await Room.findByPk(repairRequest.room_id, {
          transaction,
        });

        const notification_type = "แจ้งซ่อม";
        const title = "แจ้งเตือนตรวจสอบนัดหมายซ่อมแซมเรียบร้อยแล้ว";
        const message = `การนัดหมายวันซ่อม: ${repair_request.issue_title} ห้อง: ${room.room_number} ได้รับการตรวจสอบเรียบร้อยแล้ว รอดำเนินการ`;
        const path = `/renter/repair-request/details?id=${id}&status=completed`;

        const notification = await Notification.create(
          {
            notification_type,
            title,
            message,
            path,
            notification_no: id,
            created_date: new Date(),
          },
          { transaction }
        );

        await NotificationMapping.create(
          {
            notification_id: notification.notification_id,
            renter_id: renter.id,
            role_id: renter.role_id,
          },
          { transaction }
        );
      }
    }

    // ✅ กรณี acknowledged → สร้างแจ้งเตือน
    if (status === "acknowledged") {
      const repair_request = await RepairRequest.findByPk(id, { transaction });
      const renter = await Renter.findByPk(repairRequest.renter_id, {
        transaction,
      });

      if (renter) {
        const room = await Room.findByPk(repairRequest.room_id, {
          transaction,
        });

        const notification_type = "แจ้งซ่อม";
        const title = "แจ้งเตือนการตรวจสอบคำร้องแจ้งซ่อม";
        const message = `คำร้องแจ้งซ่อม: ${repair_request.issue_title} ของห้อง: ${room.room_number} ได้รับการตรวจสอบเรียบร้อยแล้ว กรุณาเลือกวันนัดหมายเข้าซ่อมแซม`;
        const path = `/renter/repair-request/details?id=${id}&status=acknowledged`;

        const notification = await Notification.create(
          {
            notification_type,
            title,
            message,
            path,
            notification_no: id,
            created_date: new Date(),
          },
          { transaction }
        );

        await NotificationMapping.create(
          {
            notification_id: notification.notification_id,
            renter_id: renter.id,
            role_id: renter.role_id,
          },
          { transaction }
        );
      }
    }

    // ✅ กรณี rejected → สร้างหรืออัปเดตตารางนัดใหม่ และ set acknowledged
    if (status === "rejected") {
      const existingSchedule = await RepairSchedule.findOne({
        where: { repair_request_id: id },
        transaction,
      });

      let selected_date = "";
      let selected_time_period = "";

      if (existingSchedule) {
        selected_date = existingSchedule.selected_date;
        selected_time_period = existingSchedule.selected_time_period;

        await RepairSchedule.update(
          {
            rescheduled_by_admin: true,
            rescheduled_reason_by_admin,
            updated_at: now,
          },
          {
            where: { id: existingSchedule.id },
            transaction,
          }
        );
      } else {
        // หากไม่มีตารางเดิม selected_date/time จะไม่ถูกใช้
        await RepairSchedule.create(
          {
            repair_request_id: id,
            rescheduled_by_admin: true,
            rescheduled_reason_by_admin,
            created_at: now,
            updated_at: now,
          },
          { transaction }
        );
      }

      // อัปเดตสถานะเป็น acknowledged
      repairRequest.status = "acknowledged";

      // 🔔 ส่งแจ้งเตือนไปยัง renter
      const repair_request = await RepairRequest.findByPk(id, { transaction });
      const renter = await Renter.findByPk(repairRequest.renter_id, {
        transaction,
      });

      if (renter) {
        const room = await Room.findByPk(repairRequest.room_id, {
          transaction,
        });
        const formattedDate = formatThaiDate(selected_date);

        const notification_type = "แจ้งซ่อม";
        const title = "การนัดหมายถูกปฏิเสธ";
        const message = `การนัดหมายในวันที่ ${formattedDate} ช่วงเวลา ${selected_time_period} ไม่สามารถดำเนินการได้ เนื่องจาก ${rescheduled_reason_by_admin} กรุณาเลือกวันนัดหมายมาใหม่`;
        const path = `/renter/repair-request/details?id=${id}&status=acknowledged`;

        const notification = await Notification.create(
          {
            notification_type,
            title,
            message,
            path,
            notification_no: id,
            created_date: new Date(),
          },
          { transaction }
        );

        await NotificationMapping.create(
          {
            notification_id: notification.notification_id,
            renter_id: renter.id,
            role_id: renter.role_id,
          },
          { transaction }
        );
      }
    }

    // ✅ กรณี in_progress → แจ้งเตือน
    if (status === "in_progress") {
      const repair_request = await RepairRequest.findByPk(id, { transaction });
      const renter = await Renter.findByPk(repairRequest.renter_id, {
        transaction,
      });

      if (renter) {
        const room = await Room.findByPk(repairRequest.room_id, {
          transaction,
        });

        const notification_type = "แจ้งซ่อม";
        const title = "แจ้งเตือนงานกำลังดำเนินการ";
        const message = `ช่างกำลังเข้าดำเนินการซ่อม: ${repair_request.issue_title} ห้อง: ${room.room_number} ตามวันที่ได้นัดหมายไว้`;
        const path = `/renter/repair-request/details?id=${id}&status=in_progress`;

        const notification = await Notification.create(
          {
            notification_type,
            title,
            message,
            path,
            notification_no: id,
            created_date: new Date(),
          },
          { transaction }
        );

        await NotificationMapping.create(
          {
            notification_id: notification.notification_id,
            renter_id: renter.id,
            role_id: renter.role_id,
          },
          { transaction }
        );
      }
    }

    // ✅ กรณี completed → แจ้งเตือน
    if (status === "completed") {
      const repair_request = await RepairRequest.findByPk(id, { transaction });
      const renter = await Renter.findByPk(repairRequest.renter_id, {
        transaction,
      });

      if (renter) {
        const room = await Room.findByPk(repairRequest.room_id, {
          transaction,
        });

        const notification_type = "แจ้งซ่อม";
        const title = "แจ้งเตือนงานดำเนินการเสร็จสิ้นแล้ว";
        const message = `งานซ่อม: ${repair_request.issue_title} ห้อง: ${room.room_number} ดำเนินการเรียบร้อยแล้ว`;
        const path = `/renter/repair-request/details?id=${id}&status=completed`;

        const notification = await Notification.create(
          {
            notification_type,
            title,
            message,
            path,
            notification_no: id,
            created_date: new Date(),
          },
          { transaction }
        );

        await NotificationMapping.create(
          {
            notification_id: notification.notification_id,
            renter_id: renter.id,
            role_id: renter.role_id,
          },
          { transaction }
        );
      }
    }

    // ✅ Save final update
    await repairRequest.save({ transaction });
    await transaction.commit();

    return res.status(200).json({
      status_code: 8000,
      message: "Success",
      description: "Admin updated repair request status",
      data: repairRequest,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("UpdateRepairRequestStatus error:", error);
    return res.status(500).json({
      status_code: 6000,
      error: "เกิดข้อผิดพลาด",
      details: error.message,
    });
  }
};

exports.SelectDateTimeForRepair = async (req, res) => {
  const transaction = await connection.transaction();

  try {
    const {
      repair_request_id,
      selected_date,
      selected_time_period,
      renter_id,
    } = req.body;

    if (
      !repair_request_id ||
      !selected_date ||
      !selected_time_period ||
      !renter_id
    ) {
      return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }

    // สร้างตารางเวลาซ่อม
    const repairSchedule = await RepairSchedule.create(
      {
        repair_request_id,
        selected_date,
        selected_time_period,
        status: "waiting",
      },
      { transaction }
    );

    await RepairRequest.update(
      { status: "scheduled" },
      {
        where: { id: repair_request_id },
        transaction,
      }
    );

    // ดึงข้อมูล renter เพื่อตรวจสอบห้อง
    const renter = await Renter.findByPk(renter_id, { transaction });

    if (!renter || !renter.room_id) {
      await transaction.rollback();
      return res.status(404).json({ message: "ไม่พบข้อมูลผู้เช่าหรือห้องพัก" });
    }

    // ดึงข้อมูลห้อง
    const room = await Room.findByPk(renter.room_id, { transaction });

    if (!room) {
      await transaction.rollback();
      return res.status(404).json({ message: "ไม่พบข้อมูลห้องพัก" });
    }

    const repair_request = await RepairRequest.findByPk(repair_request_id, {
      transaction,
    });
    if (!repair_request) {
      await transaction.rollback();
      return res.status(404).json({ message: "ไม่พบข้อมูลรายการแจ้งซ่อม" });
    }

    // สร้างข้อความแจ้งเตือน
    const notification_type = "แจ้งซ่อม";
    const title = "มีการแจ้งเตือนการนัดหมายช่าง";
    const message = `ผู้เช่าห้อง ${room.room_number} เลือกวันนัดหมายช่างในงาน: ${repair_request.issue_title} กรุณาตรวจสอบ`;
    const path = `/repair-request-management/details?id=${repair_request_id}&status=waiting`;

    const notification = await Notification.create(
      {
        notification_type,
        title,
        message,
        path,
        notification_no: repair_request_id,
      },
      { transaction }
    );

    //  หาผู้ดูแล (admin) ของอาคารหรือ community เดียวกัน
    const admins = await Users.findAll({
      where: {
        role_id: 2, // สมมุติว่า 2 คือ admin
        location: renter.community_id,
      },
      transaction,
    });

    if (!admins || admins.length === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: "ไม่พบผู้ดูแลในพื้นที่นี้" });
    }

    //  สร้าง mapping การแจ้งเตือน
    const notificationMappings = admins.map((admin) => ({
      notification_id: notification.notification_id,
      admin_id: admin.id,
      role_id: 2,
    }));

    await NotificationMapping.bulkCreate(notificationMappings, { transaction });

    //  commit ถ้าทุกอย่างสำเร็จ
    await transaction.commit();

    return res.status(200).json({
      status_code: 8000,
      message: "Success",
      description: "เลือกวันเวลานัดหมายช่างสำเร็จ และส่งแจ้งเตือนแล้ว",
      data: repairSchedule,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("SelectDateTimeForRepair error:", error);
    return res.status(500).json({
      status_code: 6000,
      message: "Fail",
      description: "เกิดข้อผิดพลาดขณะเลือกวันเวลานัดหมาย",
      error: error.message,
    });
  }
};

exports.UpdateRepairScheduledStatus = async (req, res) => {
  try {
    const { id, status, confirmed_by_admin } = req.body;

    if (!id || !status) {
      return res.status(400).json({ message: "กรุณาระบุ ID และสถานะ" });
    }

    // ค้นหา RepairSchedule ตาม ID
    const repairSchedule = await RepairSchedule.findByPk(id);

    if (!repairSchedule) {
      return res.status(404).json({ message: "ไม่พบข้อมูลตารางซ่อม" });
    }

    // อัปเดตสถานะ
    repairSchedule.status = status;

    // ถ้าหากแอดมินเป็นผู้ยืนยันวันซ่อม ให้บันทึกค่า confirmed_by_admin เป็น true
    if (confirmed_by_admin !== undefined) {
      repairSchedule.confirmed_by_admin = confirmed_by_admin;
    }

    await repairSchedule.save();

    return res
      .status(200)
      .json({ message: "อัปเดตสถานะสำเร็จ", data: repairSchedule });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "เกิดข้อผิดพลาด", details: error.message });
  }
};

exports.AdminRequestReschedule = async (req, res) => {
  try {
    const { id, rescheduled_reason } = req.body;

    if (!id || !rescheduled_reason) {
      return res
        .status(400)
        .json({ message: "กรุณาระบุ ID และเหตุผลการเลื่อน" });
    }

    // ค้นหา RepairSchedule ตาม ID
    const repairSchedule = await RepairSchedule.findByPk(id);

    if (!repairSchedule) {
      return res.status(404).json({ message: "ไม่พบข้อมูลตารางซ่อม" });
    }

    // อัปเดตข้อมูลการเลื่อน
    repairSchedule.status = "admin_reschedule";
    repairSchedule.rescheduled_by_admin = true;
    repairSchedule.rescheduled_reason = rescheduled_reason;
    repairSchedule.confirmed_by_admin = false;

    await repairSchedule.save();

    // 🔔 ส่งการแจ้งเตือนไปยังผู้เช่า (สามารถใช้ WebSocket, Email, หรือ Push Notification)
    // notifyRenter(repairSchedule.renter_id, `แอดมินขอเลื่อนวันซ่อม: ${rescheduled_reason}`);

    return res.status(200).json({
      message: "ส่งคำขอเลื่อนวันซ่อมไปยังผู้เช่าสำเร็จ",
      data: repairSchedule,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "เกิดข้อผิดพลาด", details: error.message });
  }
};

exports.RenterSelectNewDate = async (req, res) => {
  const transaction = await connection.transaction();

  try {
    const {
      id, // repair_schedule id
      rescheduled_by_renter,
      requested_new_date,
      requested_new_time_period,
    } = req.body;

    // ตรวจสอบข้อมูล
    if (
      !id ||
      !rescheduled_by_renter ||
      !requested_new_date ||
      !requested_new_time_period
    ) {
      return res.status(400).json({
        message: "กรุณาระบุข้อมูลให้ครบ: id, วันที่ใหม่, ช่วงเวลา และเหตุผล",
      });
    }

    // 1. ค้นหา RepairSchedule
    const repairSchedule = await RepairSchedule.findByPk(id, { transaction });

    if (!repairSchedule) {
      await transaction.rollback();
      return res.status(404).json({ message: "ไม่พบข้อมูลตารางซ่อม" });
    }

    if (
      repairSchedule.status !== "waiting" &&
      repairSchedule.status !== "renter_reschedule"
    ) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ message: "ไม่สามารถเลือกวันใหม่ได้ในสถานะนี้" });
    }

    // 2. อัปเดตข้อมูลใหม่ใน RepairSchedule
    repairSchedule.status = "renter_reschedule";
    repairSchedule.requested_new_date = requested_new_date;
    repairSchedule.requested_new_time_period = requested_new_time_period;
    repairSchedule.rescheduled_by_renter = rescheduled_by_renter;

    await repairSchedule.save({ transaction });

    // 3. ดึงข้อมูล RepairRequest และอัปเดต status เป็น scheduled
    const repairRequest = await RepairRequest.findByPk(
      repairSchedule.repair_request_id,
      { transaction }
    );

    if (!repairRequest) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ message: "ไม่พบรายการแจ้งซ่อมที่เชื่อมโยง" });
    }

    // ✅ อัปเดตสถานะเป็น scheduled
    repairRequest.status = "scheduled";
    await repairRequest.save({ transaction });

    const renter = await Renter.findByPk(repairRequest.renter_id, {
      transaction,
    });

    if (!renter || !renter.room_id) {
      await transaction.rollback();
      return res.status(404).json({ message: "ไม่พบข้อมูลผู้เช่าหรือห้องพัก" });
    }

    const room = await Room.findByPk(renter.room_id, { transaction });
    if (!room) {
      await transaction.rollback();
      return res.status(404).json({ message: "ไม่พบข้อมูลห้องพัก" });
    }
    const formattedDate = formatThaiDate(requested_new_date);

    // 4. สร้างแจ้งเตือน
    const notification_type = "แจ้งซ่อม";
    const title = `ผู้เช่าเลือกวันนัดหมายมาใหม่`;
    const message = `ผู้เช่าห้อง ${room.room_number} ขอเลื่อนวันนัดหมายช่างใหม่: ${formattedDate} (ช่วง${requested_new_time_period})`;
    const path = `/repair-request-management/details?id=${repairRequest.id}&status=waiting`;

    const notification = await Notification.create(
      {
        notification_type,
        title,
        message,
        path,
        type: "repair_reschedule_request",
        notification_no: repairRequest.id,
        created_date: new Date(),
      },
      { transaction }
    );

    // 5. หาผู้ดูแล (admin) ที่เกี่ยวข้อง
    const admins = await Users.findAll({
      where: {
        role_id: 2,
        location: renter.community_id || renter.location,
      },
      transaction,
    });

    if (!admins || admins.length === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: "ไม่พบผู้ดูแลในพื้นที่นี้" });
    }

    const notificationMappings = admins.map((admin) => ({
      notification_id: notification.notification_id,
      admin_id: admin.id,
      role_id: 2,
    }));

    await NotificationMapping.bulkCreate(notificationMappings, { transaction });

    // 6. commit ทุกอย่าง
    await transaction.commit();

    return res.status(200).json({
      status_code: 8000,
      message: "เลือกวันใหม่สำเร็จ รอการยืนยันจากแอดมิน",
      data: repairSchedule,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("RenterSelectNewDate error:", error);
    return res.status(500).json({
      status_code: 6000,
      message: "เกิดข้อผิดพลาด",
      details: error.message,
    });
  }
};

exports.RenterRequestReschedule = async (req, res) => {
  try {
    const {
      id,
      requested_new_date,
      requested_new_start_time,
      requested_new_end_time,
      reschedule_reason_by_renter,
    } = req.body;

    if (
      !id ||
      !requested_new_date ||
      !requested_new_start_time ||
      !requested_new_end_time ||
      !reschedule_reason_by_renter
    ) {
      return res.status(400).json({ message: "กรุณาระบุข้อมูลให้ครบถ้วน" });
    }

    // ค้นหา RepairSchedule ตาม ID
    const repairSchedule = await RepairSchedule.findByPk(id);

    if (!repairSchedule) {
      return res.status(404).json({ message: "ไม่พบข้อมูลตารางซ่อม" });
    }

    // ตรวจสอบว่าสามารถร้องขอเลื่อนได้หรือไม่ (ต้องไม่อยู่ในสถานะ confirmed แล้ว)
    if (repairSchedule.status === "confirmed") {
      return res.status(400).json({
        message: "ไม่สามารถร้องขอเลื่อนได้ เนื่องจากได้รับการยืนยันแล้ว",
      });
    }

    // อัปเดตข้อมูลคำขอเลื่อนจากผู้เช่า
    repairSchedule.status = "waiting"; // รอแอดมินตรวจสอบ
    repairSchedule.rescheduled_by_renter = true;
    repairSchedule.requested_new_date = requested_new_date;
    repairSchedule.requested_new_start_time = requested_new_start_time;
    repairSchedule.requested_new_end_time = requested_new_end_time;
    repairSchedule.reschedule_reason_by_renter = reschedule_reason_by_renter;

    await repairSchedule.save();

    // 🔔 แจ้งเตือนแอดมินว่าผู้เช่าร้องขอเลื่อนวันซ่อม
    // notifyAdmin(repairSchedule.admin_id, `ผู้เช่าร้องขอเลื่อนวันซ่อมเป็น ${requested_new_date} เวลา ${requested_new_start_time} - ${requested_new_end_time}`);

    return res.status(200).json({
      message: "ร้องขอเลื่อนวันซ่อมสำเร็จ กำลังรอการยืนยันจากแอดมิน",
      data: repairSchedule,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "เกิดข้อผิดพลาด", details: error.message });
  }
};

exports.GetRepairRequestsListForRenter = async (req, res) => {
  try {
    const { renter_id } = req.body;

    if (!renter_id) {
      return res.status(400).json({ message: "กรุณาระบุ renter_id" });
    }

    // ดึงข้อมูลการแจ้งซ่อมของผู้เช่าที่สถานะไม่ใช่ completed หรือ cancel
    const repairRequests = await RepairRequest.findAll({
      where: {
        renter_id,
        status: {
          [Op.notIn]: ["completed", "cancel"],
        },
      },
      include: [
        {
          model: RepairSchedule,
          required: false,
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      status_code: 8000,
      message: "Success",
      description: "Get Repair Request List successfully!",
      data: repairRequests,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "เกิดข้อผิดพลาด", details: error.message });
  }
};

exports.GetRepairRequestsListForAdmin = async (req, res) => {
  try {
    const { community_id } = req.body;

    const whereBuilding = {};

    if (community_id) {
      whereBuilding.community_id = community_id;
    }

    const repairRequests = await RepairRequest.findAll({
      include: [
        {
          model: Renter,
          attributes: [
            "prefix",
            "first_name",
            "last_name",
            "nick_name",
            "room_id",
          ],
          include: {
            model: Room,
            attributes: ["building_id", "room_number", "floor"],
            include: {
              model: Building,
              attributes: ["building_name"],
              where: whereBuilding, // ✅ ใช้เงื่อนไขแบบ dynamic
            },
          },
        },
        {
          model: RepairSchedule,
          required: false,
        },
      ],
      order: [
        [
          // ✅ ใช้ COALESCE เพื่อเรียงจาก updated_at ถ้ามี ไม่งั้นใช้ created_at
          literal("COALESCE(`RepairRequest`.`updated_at`, `RepairRequest`.`created_at`)"),
          "DESC",
        ],
      ],
    });

    return res.status(200).json({
      status_code: 8000,
      message: "Success",
      description: "Get Repair Request List successfully!",
      data: repairRequests,
    });
  } catch (error) {
    console.error("Error fetching repair requests:", error);
    return res.status(500).json({
      status_code: 6000,
      message: "เกิดข้อผิดพลาด",
      details: error.message,
    });
  }
};

exports.GetRepairRequestsDetails = async (req, res) => {
  try {
    const { repair_request_id } = req.body;

    if (!repair_request_id) {
      return res.status(400).json({ message: "กรุณาระบุ repair_request_id" });
    }

    // ค้นหา RepairRequest พร้อมข้อมูลที่เกี่ยวข้อง
    const repairRequest = await RepairRequest.findOne({
      where: { id: repair_request_id },
      include: [
        {
          model: Renter,
          attributes: [
            "prefix",
            "first_name",
            "last_name",
            "nick_name",
            "room_id",
          ],
          include: [
            {
              model: Room,
              attributes: ["building_id", "room_number", "floor"],
              include: [
                {
                  model: Building,
                  attributes: ["building_name"],
                },
              ],
              required: false,
            },
          ],
          required: false,
        },
        {
          model: RepairSchedule,
          required: false,
        },
      ],
    });

    if (!repairRequest) {
      return res.status(404).json({ message: "ไม่พบข้อมูลการแจ้งซ่อมนี้" });
    }

    // แปลงข้อมูลทั้งหมดให้อยู่ใน plain object
    const requestData = repairRequest.get({ plain: true });
    const renter = requestData.Renter;
    const room = renter?.Room;
    const building = room?.Building;

    // รวมข้อมูลทั้งหมดไว้ใน Renter
    const mergedRenter = renter
      ? {
          prefix: renter.prefix,
          first_name: renter.first_name,
          last_name: renter.last_name,
          nick_name: renter.nick_name,
          room_id: renter.room_id,
          building_id: room?.building_id || null,
          room_number: room?.room_number || null,
          floor: room?.floor || null,
          building_name: building?.building_name || null,
        }
      : null;

    // ส่งออก response แบบ flatten
    const result = {
      ...requestData,
      Renter: mergedRenter,
    };

    // ลบค่าเดิมที่ซ้อนอยู่ (ป้องกันความซ้ำซ้อน)
    if (result.Renter?.Room) delete result.Renter.Room;

    return res.status(200).json({
      status_code: 8000,
      message: "Success",
      description: "Get Repair Request Details Successfully!",
      data: result,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "เกิดข้อผิดพลาด", details: error.message });
  }
};

exports.GetHistoryRepairRequestsListForRenter = async (req, res) => {
  try {
    const { renter_id } = req.body;

    if (!renter_id) {
      return res.status(400).json({ message: "กรุณาระบุ renter_id" });
    }

    const repairRequests = await RepairRequest.findAll({
      where: {
        renter_id,
        status: ["completed", "cancel"], // ดึงเฉพาะ status ที่ต้องการ
      },
      include: [
        {
          model: RepairSchedule,
          required: false,
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      status_code: 8000,
      message: "Success",
      description: "Get History Repair Request List successfully!",
      data: repairRequests,
    });
  } catch (error) {
    return res.status(500).json({
      error: "เกิดข้อผิดพลาด",
      details: error.message,
    });
  }
};
