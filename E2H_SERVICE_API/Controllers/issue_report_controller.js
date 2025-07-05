const connection = require("../Config/db");
const Community = require("../Models/communities_model");
const { Op, literal } = require("sequelize");
const moment = require("moment-timezone");
const Users = require("../Models/usersModel");
const Renter = require("../Models/renter_model");
const Room = require("../Models/room_model");
const IssuesReport = require("../Models/issues_report_model");
const Notification = require("../Models/notification_model");
const NotificationMapping = require("../Models/notification_mapping_model");

IssuesReport.belongsTo(Renter, {
  foreignKey: "renter_id", // กำหนดชื่อฟิลด์ที่เชื่อมโยง
  // as: 'renter',  // ตั้งชื่อ alias สำหรับการเข้าถึง
});
Renter.hasMany(IssuesReport, {
  foreignKey: "renter_id", // ชื่อฟิลด์ที่เชื่อมโยงกับ IssuesReport
  // as: 'issuesReports',  // ตั้งชื่อ alias สำหรับการเข้าถึง
});
Renter.belongsTo(Room, { foreignKey: "room_id" });
Room.hasMany(Renter, { foreignKey: "room_id" });

// exports.CreateIssue = async (req, res) => {
//   const IssueData = req.body;

//   if (req.files) {
//     // ตรวจสอบว่าแต่ละไฟล์ถูกอัพโหลดหรือไม่
//     if (req.files.image_1) {
//       const image_1 = `${req.files.image_1[0].path}`; // สร้าง URL สำหรับรูปภาพ
//       IssueData.image_1 = image_1; // เพิ่ม path ของรูปภาพลงใน userData
//     }
//     if (req.files.image_2) {
//       const image_2 = `${req.files.image_2[0].path}`; // สร้าง URL สำหรับรูปภาพ
//       IssueData.image_2 = image_2; // เพิ่ม path ของรูปภาพลงใน userData
//     }
//     if (req.files.image_3) {
//       const image_3 = `${req.files.image_3[0].path}`; // สร้าง URL สำหรับรูปภาพ
//       IssueData.image_3 = image_3; // เพิ่ม path ของรูปภาพลงใน userData
//     }
//     if (req.files.image_4) {
//       const image_4 = `${req.files.image_4[0].path}`; // สร้าง URL สำหรับรูปภาพ
//       IssueData.image_4 = image_4; // เพิ่ม path ของรูปภาพลงใน userData
//     }
//     if (req.files.image_5) {
//       const image_5 = `${req.files.image_5[0].path}`; // สร้าง URL สำหรับรูปภาพ
//       IssueData.image_5 = image_5; // เพิ่ม path ของรูปภาพลงใน userData
//     }
//   }

//   try {
//     // ตรวจสอบว่ามีข้อมูลครบถ้วนไหม
//     if (
//       !IssueData.community_id ||
//       !IssueData.renter_id ||
//       !IssueData.title ||
//       !IssueData.description
//     ) {
//       return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
//     }

//     // สร้างรายการ issue ใหม่ในฐานข้อมูล
//     const newIssue = await IssuesReport.create(IssueData);
//     res.status(200).json({
//       status_code: 8000,
//       message: "Success",
//       description: "New IssuesReport created successfully!",
//       data: newIssue,
//     });
//   } catch (error) {
//     console.error("Error creating issue:", error);
//     return res.status(500).json({
//       status_code: 6000,
//       message: "Fail",
//       description: "เกิดข้อผิดพลาดในการสร้างการแจ้งเรื่อง",
//     });
//   }
// };

exports.CreateIssue = async (req, res) => {
  const IssueData = req.body;
  const transaction = await connection.transaction(); // เริ่ม transaction

  try {
    // จัดการไฟล์รูปภาพ (ถ้ามี)
    if (req.files) {
      // ตรวจสอบว่าแต่ละไฟล์ถูกอัพโหลดหรือไม่
      if (req.files.image_1) {
        const image_1 = `${req.files.image_1[0].path}`; // สร้าง URL สำหรับรูปภาพ
        IssueData.image_1 = image_1; // เพิ่ม path ของรูปภาพลงใน userData
      }
      if (req.files.image_2) {
        const image_2 = `${req.files.image_2[0].path}`; // สร้าง URL สำหรับรูปภาพ
        IssueData.image_2 = image_2; // เพิ่ม path ของรูปภาพลงใน userData
      }
      if (req.files.image_3) {
        const image_3 = `${req.files.image_3[0].path}`; // สร้าง URL สำหรับรูปภาพ
        IssueData.image_3 = image_3; // เพิ่ม path ของรูปภาพลงใน userData
      }
      if (req.files.image_4) {
        const image_4 = `${req.files.image_4[0].path}`; // สร้าง URL สำหรับรูปภาพ
        IssueData.image_4 = image_4; // เพิ่ม path ของรูปภาพลงใน userData
      }
      if (req.files.image_5) {
        const image_5 = `${req.files.image_5[0].path}`; // สร้าง URL สำหรับรูปภาพ
        IssueData.image_5 = image_5; // เพิ่ม path ของรูปภาพลงใน userData
      }
    }

    // ตรวจสอบข้อมูลที่จำเป็น
    if (
      !IssueData.community_id ||
      !IssueData.renter_id ||
      !IssueData.title ||
      !IssueData.description
    ) {
      return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }

    const dayjs = require("dayjs");
    const utc = require("dayjs/plugin/utc");
    const tz = require("dayjs/plugin/timezone");
    dayjs.extend(utc);
    dayjs.extend(tz);
    // 1. สร้าง issue ใหม่
    const newIssue = await IssuesReport.create(IssueData, { transaction });

    const formattedIssue = {
      ...newIssue.toJSON(),
      createdAt: dayjs(newIssue.createdAt)
        .tz("Asia/Bangkok")
        .format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: dayjs(newIssue.updatedAt)
        .tz("Asia/Bangkok")
        .format("YYYY-MM-DD HH:mm:ss"),
    };

    const renter = await Renter.findByPk(IssueData.renter_id, { transaction });

    if (!renter || !renter.room_id) {
      throw new Error("ไม่พบข้อมูลผู้เช่าหรือห้องพักของผู้เช่า");
    }

    // จากนั้นใช้ room_id ที่ได้ไปดึงข้อมูลห้อง
    const room = await Room.findByPk(renter.room_id, { transaction });

    if (!room) {
      throw new Error("ไม่พบข้อมูลห้องพัก");
    }

    // 3. สร้างข้อความแจ้งเตือน
    const notificationData = {
      notification_type: "แจ้งเรื่อง",
      title: "มีการแจ้งเรื่องใหม่ใหม่",
      message: `ผู้เช่าห้อง ${room.room_number} แจ้งเรื่อง: ${IssueData.title}`,
      // notification_type: 'repair',
      notification_no: newIssue.id,
      // reference_type: 'repair_requests',
      path: `/receive-reported-management/details?id=${newIssue.id}`,
    };

    // 4. บันทึกข้อมูลการแจ้งเตือนลงในตาราง notifications
    const newNotification = await Notification.create(notificationData, {
      transaction,
    });

    const verifiedNotification = await Notification.findByPk(
      newNotification.notification_id,
      { transaction }
    );
    console.log("New notification ID:", verifiedNotification.id);

    // 2. สร้าง notification
    // const message = `มีการแจ้งเรื่องใหม่: ${IssueData.title}`;
    // const path = `/receive-reported-management/details?id=${newIssue.id}`;
    // const notification = await Notification.create({
    //   message: message,
    //   path: path,
    //   type: 'issue',
    //   created_date: new Date()
    // }, { transaction });

    // 3. ดึงแอดมินใน community นั้น
    const admins = await Users.findAll({
      where: {
        role_id: 2, // admin
        location: IssueData.community_id,
      },
      transaction,
    });

    // 4. สร้าง notification mapping
    // const mappings = admins.map(admin => ({
    //   notification_id: notification.id,
    //   user_id: admin.id,
    //   is_read: false
    // }));

    const notificationMappings = admins.map((admin) => ({
      notification_id: newNotification.notification_id,
      admin_id: admin.id,
      role_id: 2,
    }));

    await NotificationMapping.bulkCreate(notificationMappings, { transaction });

    // 5. commit ถ้าทุกอย่างสำเร็จ
    await transaction.commit();

    res.status(200).json({
      status_code: 8000,
      message: "Success",
      description: "New IssuesReport created and notification sent!",
      data: formattedIssue,
    });
  } catch (error) {
    // ❌ เกิด error → rollback
    await transaction.rollback();
    console.error("Error creating issue:", error);

    return res.status(500).json({
      status_code: 6000,
      message: "Fail",
      description: "เกิดข้อผิดพลาดในการสร้างการแจ้งเรื่อง",
    });
  }
};

exports.EditIssue = async (req, res) => {
  const transaction = await connection.transaction();
  const IssueData = req.body;

  try {
    if (!IssueData.id) {
      return res.status(400).json({ message: "กรุณาระบุ id" });
    }

    // ✅ ดึงข้อมูล Issue เดิม เพื่อนำไปใช้หาข้อมูลเพิ่มเติม
    const existingIssue = await IssuesReport.findByPk(IssueData.id, {
      transaction,
    });

    if (!existingIssue) {
      await transaction.rollback();
      return res.status(404).json({ message: "ไม่พบคำร้องที่ต้องการแก้ไข" });
    }

    // ✅ แปลง urgent_issue จาก string → int
    if (typeof IssueData.urgent_issue === "string") {
      IssueData.urgent_issue = IssueData.urgent_issue === "true" ? 1 : 0;
    } else if (
      typeof IssueData.urgent_issue === "undefined" ||
      IssueData.urgent_issue === ""
    ) {
      IssueData.urgent_issue = 0;
    }

    // 📷 จัดการไฟล์รูปภาพใหม่ถ้ามี
    if (req.files) {
      for (let i = 1; i <= 5; i++) {
        const key = `image_${i}`;
        if (req.files[key]) {
          IssueData[key] = req.files[key][0].path;
        }
      }
    }

    // ✅ 1. อัปเดตข้อมูลการแจ้งเรื่อง
    const updateResult = await IssuesReport.update(IssueData, {
      where: { id: IssueData.id },
      transaction,
    });

    if (updateResult[0] === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: "ไม่พบคำร้องที่ต้องการแก้ไข" });
    }

    // ✅ 2. ดึงข้อมูล renter และห้อง (จาก existing issue)
    const renter = await Renter.findByPk(existingIssue.renter_id, {
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

    // ✅ 3. สร้างข้อความแจ้งเตือน
    const notification = await Notification.create(
      {
        notification_type: "แจ้งเรื่อง",
        title: "มีการอัปเดตคำร้อง",
        message: `ผู้เช่าห้อง ${room.room_number} แก้ไขคำร้อง: ${
          IssueData.title || existingIssue.title
        }`,
        path: `/receive-reported-management/details?id=${IssueData.id}`,
        notification_no: IssueData.id,
        created_date: new Date(),
      },
      { transaction }
    );

    // ✅ 4. หาผู้ดูแล (admin) ที่เกี่ยวข้อง
    const admins = await Users.findAll({
      where: {
        role_id: 2,
        location: existingIssue.community_id,
      },
      transaction,
    });

    if (!admins || admins.length === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: "ไม่พบผู้ดูแลในพื้นที่นี้" });
    }

    // ✅ 5. สร้าง mapping แจ้งเตือน
    const mappings = admins.map((admin) => ({
      notification_id: notification.notification_id,
      admin_id: admin.id,
      role_id: 2,
    }));

    await NotificationMapping.bulkCreate(mappings, { transaction });

    // ✅ 6. commit ทุกอย่าง
    await transaction.commit();

    return res.status(200).json({
      status_code: 8000,
      message: "Success",
      description: "อัปเดตคำร้องสำเร็จและส่งแจ้งเตือนแล้ว",
      data: IssueData,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error editing issue:", error);
    return res.status(500).json({
      status_code: 6000,
      message: "Fail",
      description: "เกิดข้อผิดพลาดในการอัปเดตคำร้อง",
      error: error.message,
    });
  }
};

exports.GetListIssueForRenter = async (req, res) => {
  const { renter_id } = req.body;

  try {
    if (!renter_id) {
      return res.status(400).json({
        status_code: 4000,
        message: "กรุณาระบุ renter_id",
      });
    }

    const issues = await IssuesReport.findAll({
      where: {
        renter_id,
        status: {
          [Op.notIn]: ["rejected", "completed", "cancel" , "fail"], // ✅ กรอง status ที่ไม่ต้องการ
        },
      },
      order: [
        [
          literal(
            "COALESCE(`IssuesReport`.`updatedAt`, `IssuesReport`.`createdAt`)"
          ),
          "DESC",
        ],
      ],
    });

    if (issues.length === 0) {
      return res.status(200).json({
        status_code: 6000,
        message: "ไม่พบรายการ การแจ้งเรื่องของคุณ",
        data: [],
      });
    }

    return res.status(200).json({
      status_code: 8000,
      message: "Success",
      data: issues,
    });
  } catch (error) {
    console.error("Error fetching List Issue For Renter:", error);
    return res.status(500).json({
      status_code: 6000,
      message: "Fail",
      description: "เกิดข้อผิดพลาดในการดึงประวัติการแจ้งเรื่อง",
    });
  }
};

exports.GetListIssueForAdmin = async (req, res) => {
  const { community_id } = req.body;

  try {
    // ✅ เงื่อนไข super admin: ถ้าไม่ได้ส่ง community_id, หรือส่งมาเป็น '', null → ดึงทั้งหมด
    const whereClause = community_id
      ? { community_id } // ดึงเฉพาะของ community นั้น
      : {}; // ดึงทั้งหมด

    const issues = await IssuesReport.findAll({
      where: whereClause,
      include: [
        {
          model: Renter,
          attributes: ["prefix", "first_name", "last_name"],
          include: [
            {
              model: Room,
              attributes: ["room_number"],
            },
          ],
        },
      ],
      order: [
        [
          literal(
            "COALESCE(`IssuesReport`.`updatedAt`, `IssuesReport`.`createdAt`)"
          ),
          "DESC",
        ],
      ],
    });

    if (issues.length === 0) {
      return res.status(404).json({
        status_code: 4040,
        message: "ไม่พบการแจ้งเรื่อง",
      });
    }

    return res.status(200).json({
      status_code: 8000,
      message: "Success",
      data: issues,
    });
  } catch (error) {
    console.error("Error fetching issues list:", error);
    return res.status(500).json({
      status_code: 6000,
      message: "Fail",
      description: "เกิดข้อผิดพลาดในการดึงข้อมูลการแจ้งเรื่อง",
    });
  }
};

exports.GetIssueDetails = async (req, res) => {
  const { id } = req.body; // รับ id จาก request body

  try {
    // ตรวจสอบว่า id ถูกส่งมาหรือไม่
    if (!id) {
      return res.status(400).json({
        status_code: 4000,
        message: "กรุณาระบุ id",
      });
    }

    // ดึงข้อมูลการแจ้งเรื่องจากฐานข้อมูลตาม id พร้อมข้อมูลจากตาราง Renter (ผู้เช่า) และ Room (ห้อง)
    const issue = await IssuesReport.findOne({
      where: { id: id },
      include: [
        {
          model: Renter, // เชื่อมโยงกับตาราง Renter
          attributes: ["prefix", "first_name", "last_name"], // ดึงเฉพาะฟิลด์ที่ต้องการ
          include: [
            {
              model: Room, // เชื่อมโยงกับตาราง Room
              attributes: ["room_number"], // ดึงฟิลด์ room_number
            },
          ],
        },
      ],
    });

    // ตรวจสอบว่าไม่พบข้อมูล
    if (!issue) {
      return res.status(404).json({
        status_code: 4040,
        message: "ไม่พบการแจ้งเรื่องตาม id ที่ระบุ",
      });
    }

    // ส่งข้อมูลผลลัพธ์
    return res.status(200).json({
      status_code: 8000,
      message: "Success",
      data: issue,
    });
  } catch (error) {
    console.error("Error fetching issue details:", error);
    return res.status(500).json({
      status_code: 6000,
      message: "Fail",
      description: "เกิดข้อผิดพลาดในการดึงข้อมูลการแจ้งเรื่อง",
    });
  }
};

exports.UpdateIssueStatus = async (req, res) => {
  const transaction = await connection.transaction();

  try {
    const {
      issue_id,
      status,
      admin_id,
      pending_reason_by_admin,
      reject_reason_by_admin,
    } = req.body;

    if (!issue_id || !status || !admin_id) {
      await transaction.rollback();
      return res.status(400).json({
        status_code: 4000,
        message: "กรุณาระบุ issue_id, status และ admin_id",
      });
    }

    const issue = await IssuesReport.findByPk(issue_id, { transaction });

    if (!issue) {
      await transaction.rollback();
      return res.status(404).json({
        status_code: 4040,
        message: "ไม่พบการแจ้งเรื่องตาม id ที่ระบุ",
      });
    }
    const now = moment().tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");

    // const now = new Date();

    // อัปเดตสถานะ
    issue.status = status;
    issue.admin_id = admin_id;

    // อัปเดต field ตาม status
    switch (status) {
      case "pending":
        if (pending_reason_by_admin) {
          issue.pending_reason_by_admin = pending_reason_by_admin;
        }
        issue.pending_at = now;
        issue.pending_by_admin = admin_id;
        break;

      case "in_progress":
        issue.in_progress_at = now;
        issue.in_progress_by_admin = admin_id;
        break;

      case "completed":
        issue.completed_at = now;
        issue.completed_by_admin = admin_id;
        break;

      case "rejected":
        if (reject_reason_by_admin) {
          issue.reject_reason_by_admin = reject_reason_by_admin;
        }
        issue.rejected_at = now;
        issue.rejected_by_admin = admin_id;
        break;

      // waiting_to_check → ไม่ทำอะไรเพิ่มเติม
    }

    await issue.save({ transaction });

    // หา renter และ room
    const renter = await Renter.findByPk(issue.renter_id, { transaction });

    let room = null;
    if (renter && renter.room_id) {
      room = await Room.findByPk(renter.room_id, { transaction });
    }

    if (renter && room) {
      const notification_type = "แจ้งเรื่อง";
      let title = "";
      let message = "";
      const path = `/renter/issues/details?id=${issue.id}&status=${status}`;

      switch (status) {
        case "pending":
          title = "อยู่ระหว่างรอการดำเนินการ";
          message = `เรื่อง: ${issue.title} ห้อง: ${room.room_number} ได้รับการตรวจสอบแล้ว รอดำเนินการ`;
          if (pending_reason_by_admin) {
            message += ` (${pending_reason_by_admin})`;
          }
          break;

        case "in_progress":
          title = "กำลังดำเนินการตามคำร้อง";
          message = `เจ้าหน้าที่กำลังดำเนินการตามเรื่อง: ${issue.title} ห้อง: ${room.room_number}`;
          break;

        case "completed":
          title = "เรื่องที่แจ้งดำเนินการเสร็จสิ้นแล้ว";
          message = `เรื่อง: ${issue.title} ห้อง: ${room.room_number} ได้รับการดำเนินการเรียบร้อยแล้ว`;
          break;

        case "fail":
          title = "ดำเนินการไม่สำเร็จ";
          message = `เรื่อง: ${issue.title} ห้อง: ${room.room_number} ดำเนินการไม่สำเร็จ กรุณาติดต่อแอดมิน`;
          break;

        case "rejected":
          title = "การแจ้งเรื่องถูกปฏิเสธ";
          message = `เรื่อง: ${issue.title} ห้อง: ${room.room_number} ถูกปฏิเสธโดยเจ้าหน้าที่`;
          if (reject_reason_by_admin) {
            message += ` เนื่องจาก ${reject_reason_by_admin}`;
          }
          break;

        default:
          break;
      }

      if (title && message) {
        const notification = await Notification.create(
          {
            notification_type,
            title,
            message,
            path,
            notification_no: issue.id,
            created_date: now,
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

    await transaction.commit();

    return res.status(200).json({
      status_code: 8000,
      message: "Success",
      description: "อัปเดตสถานะการแจ้งเรื่องเรียบร้อยแล้ว",
      data: issue,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("UpdateIssueStatus error:", error);
    return res.status(500).json({
      status_code: 6000,
      message: "เกิดข้อผิดพลาดในการอัปเดตสถานะ",
      details: error.message,
    });
  }
};

exports.CancelThisIssue = async (req, res) => {
  const transaction = await connection.transaction();

  try {
    const { issue_id, status, renter_id } = req.body;

    if (!issue_id || !status || !renter_id) {
      await transaction.rollback();
      return res.status(400).json({
        status_code: 4000,
        message: "กรุณาระบุ issue_id, status และ renter_id",
      });
    }

    if (status !== "cancel") {
      await transaction.rollback();
      return res.status(400).json({
        status_code: 4001,
        message: "status ที่อนุญาตในฟังก์ชันนี้คือ 'cancel' เท่านั้น",
      });
    }

    const issue = await IssuesReport.findByPk(issue_id, { transaction });

    if (!issue) {
      await transaction.rollback();
      return res.status(404).json({
        status_code: 4040,
        message: "ไม่พบการแจ้งเรื่องตาม id ที่ระบุ",
      });
    }

    // ✅ ตรวจสอบว่า status เดิมเป็น waiting_to_check หรือ pending เท่านั้น
    if (issue.status !== "waiting_to_check" && issue.status !== "pending") {
      await transaction.rollback();
      return res.status(403).json({
        status_code: 4030,
        message: `ไม่สามารถยกเลิกได้ เนื่องจากสถานะปัจจุบันคือ '${issue.status}'`,
      });
    }

    const now = moment().tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");

    issue.status = "cancel";
    issue.cancelled_at = now;
    issue.cancelled_by_renter = renter_id;

    await issue.save({ transaction });

    // หา renter, room, และ admin
    const renter = await Renter.findByPk(renter_id, { transaction });

    let room = null;
    if (renter?.room_id) {
      room = await Room.findByPk(renter.room_id, { transaction });
    }

    // ✅ ดึงแอดมินทุกคนใน community เดียวกัน
    const admins = await Users.findAll({
      where: {
        location: issue.community_id,
        role_id: 2, 
      },
      transaction,
    });

    // ✅ สร้าง Notification
    if (room && admins.length > 0) {
      const notification_type = "แจ้งเรื่อง";
      const title = "ผู้เช่ายกเลิกการแจ้งเรื่อง";
      const message = `ผู้เช่าห้อง: ${room.room_number} ได้ยกเลิกการแจ้งเรื่อง: ${issue.title} `;
      const path = `/receive-reported-management/details?id=${issue.id}`;
      
      const notification = await Notification.create(
        {
          notification_type,
          title,
          message,
          path,
          notification_no: issue.id,
          created_date: now,
        },
        { transaction }
      );

      // ✅ วน insert NotificationMapping ให้แอดมินทุกคน
      for (const admin of admins) {
        await NotificationMapping.create(
          {
            notification_id: notification.notification_id,
            admin_id: admin.id,
            role_id: admin.role_id,
          },
          { transaction }
        );
      }
    }

    await transaction.commit();

    return res.status(200).json({
      status_code: 8000,
      message: "Success",
      description: "ยกเลิกการแจ้งเรื่องเรียบร้อยแล้ว",
      data: issue,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("CancelThisIssue error:", error);
    return res.status(500).json({
      status_code: 6000,
      message: "เกิดข้อผิดพลาดในการยกเลิกการแจ้งเรื่อง",
      details: error.message,
    });
  }
};

exports.GetHistoryIssueForRenter = async (req, res) => {
  const { renter_id } = req.body;

  try {
    if (!renter_id) {
      return res.status(400).json({
        status_code: 4000,
        message: "กรุณาระบุ renter_id",
      });
    }

    const issues = await IssuesReport.findAll({
      where: {
        renter_id,
        status: {
          [Op.in]: ["completed", "cancel", "rejected" , "fail"],
        },
      },
      order: [
        [
          literal(
            "COALESCE(`IssuesReport`.`updatedAt`, `IssuesReport`.`createdAt`)"
          ),
          "DESC",
        ],
      ],
    });

    if (issues.length === 0) {
      return res.status(200).json({
        status_code: 6000,
        message:
          "ไม่พบประวัติการแจ้งเรื่องที่เสร็จสิ้นแล้ว / ยกเลิก / ถูกปฏิเสธ",
        data: [],
      });
    }

    return res.status(200).json({
      status_code: 8000,
      message: "Success",
      data: issues,
    });
  } catch (error) {
    console.error("Error fetching completed/canceled/rejected issues:", error);
    return res.status(500).json({
      status_code: 6000,
      message: "Fail",
      description: "เกิดข้อผิดพลาดในการดึงประวัติการแจ้งเรื่อง",
    });
  }
};
