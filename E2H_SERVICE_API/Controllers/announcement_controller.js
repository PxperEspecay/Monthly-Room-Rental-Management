const { literal } = require('sequelize'); // ต้อง import literal
const moment = require("moment-timezone");
const Announcements = require("../Models/announcement_model");
const connection = require("../Config/db");
const AnnouncementRecipients = require("../Models/announcement_recipients_model");
const Renter = require("../Models/renter_model"); // Import model users
const Community = require("../Models/communities_model");
const Notification = require("../Models/notification_model");
const NotificationMapping = require("../Models/notification_mapping_model");
Announcements.hasMany(AnnouncementRecipients, {
  foreignKey: "announcement_id",
});
AnnouncementRecipients.belongsTo(Announcements, {
  foreignKey: "announcement_id",
});
Announcements.belongsTo(Community, { foreignKey: "community_id" });

// exports.CreateAnnouncement = async (req, res) => {
//     const AnnouncementData = req.body;
//     console.log(AnnouncementData,'AnnouncementData');

//     if (req.files) {
//         if (req.files.banner_announcement && req.files.banner_announcement[0]) {
//             AnnouncementData.banner_announcement = req.files.banner_announcement[0].path;
//         }
//         if (req.files.img_announcement && req.files.img_announcement[0]) {
//             AnnouncementData.img_announcement = req.files.img_announcement[0].path;
//         }
//         if (req.files.file_announcement && req.files.file_announcement[0]) {
//             AnnouncementData.file_announcement = req.files.file_announcement[0].path;
//         }
//     }

//     try {
//       const newAnnouncement = await Announcements.create(AnnouncementData);

//       // ส่งข้อมูลตอบกลับหลังจากบันทึกสำเร็จ
//       res.status(200).json({
//         status_code: 8000,
//         message: "Success",
//         description: "Create New Announcement Done!",
//         data: newAnnouncement,
//       });
//     } catch (err) {

//     //   console.error("Error Can't Create Announcement", err);
//       let description = err.message;
//       res.status(500).json({
//         status_code: 6000,
//         message: "Error Can't Create Announcement",
//         description: description,
//       });
//     }
//   };

// exports.CreateAnnouncement = async (req, res) => {
//   const AnnouncementData = req.body;

//   if (req.files) {
//     if (req.files.banner_announcement && req.files.banner_announcement[0]) {
//       AnnouncementData.banner_announcement =
//         req.files.banner_announcement[0].path;
//     }
//     if (req.files.img_announcement && req.files.img_announcement[0]) {
//       AnnouncementData.img_announcement = req.files.img_announcement[0].path;
//     }
//     if (req.files.file_announcement && req.files.file_announcement[0]) {
//       AnnouncementData.file_announcement = req.files.file_announcement[0].path;
//     }
//   }

//   const transaction = await connection.transaction(); // สร้าง Transaction

//   try {
//     // สร้างประกาศใหม่ในตาราง `announcements`
//     const newAnnouncement = await Announcements.create(AnnouncementData, {
//       transaction,
//     });

//     // ดึง user_id ของผู้ใช้ที่อยู่ใน community_id
//     const RenterInCommunity = await Renter.findAll({
//       where: { community_id: AnnouncementData.community_id },
//       attributes: ["id"], // ดึงเฉพาะ user_id
//       raw: true, // คืนค่าเป็น JSON
//     });

//     if (RenterInCommunity.length > 0) {
//       // สร้างรายการสำหรับ `announcement_recipients`
//       const recipients = RenterInCommunity.map((renter) => ({
//         announcement_id: newAnnouncement.id,
//         renter_id: renter.id,
//         is_read: 0,
//         read_at: null,
//       }));

//       // บันทึกข้อมูลผู้รับใน `announcement_recipients`
//       await AnnouncementRecipients.bulkCreate(recipients, { transaction });
//     }

//     // Commit Transaction
//     await transaction.commit();

//     // ส่งข้อมูลตอบกลับหลังจากบันทึกสำเร็จ
//     res.status(200).json({
//       status_code: 8000,
//       message: "Success",
//       description:
//         "Create New Announcement and Assign to Community Members Done!",
//       data: newAnnouncement,
//     });
//   } catch (err) {
//     // Rollback Transaction เมื่อเกิดข้อผิดพลาด
//     await transaction.rollback();

//     console.error("Error Can't Create Announcement", err);
//     res.status(500).json({
//       status_code: 6000,
//       message: "Error Can't Create Announcement",
//       description: err.message,
//     });
//   }
// };


exports.GetAnnouncements = async (req, res) => {
  const { renter_id } = req.body;

  try {
    const announcements = await AnnouncementRecipients.findAll({
      where: { renter_id },
      include: [
        {
          model: Announcements,
        },
      ],
      attributes: ["is_read", "read_at"],
      order: [
        [literal('COALESCE(`Announcement`.`updatedAt`, `Announcement`.`createdAt`)'), 'DESC']
      ]
    });

    // 👇 map เพื่อย้าย is_read และ read_at เข้าไปใน announcement
    const formattedAnnouncements = announcements.map(item => {
      const announcement = item.Announcement?.toJSON() || {};
      announcement.is_read = item.is_read;
      announcement.read_at = item.read_at;
      return announcement;
    });

    res.status(200).json({
      status_code: 8000,
      message: "Success",
      data: formattedAnnouncements,
    });
  } catch (err) {
    res.status(500).json({
      status_code: 6000,
      message: "Error fetching announcements",
      description: err.message,
    });
  }
};



exports.ReadAnnouncement = async (req, res) => {
  const { announcement_id, renter_id } = req.body; // รับ announcement_id และ user_id จาก body

  try {
    // อัปเดตสถานะการอ่าน
    const updated = await AnnouncementRecipients.update(
      {
        is_read: true,
        read_at: new Date(),
      },
      {
        where: {
          announcement_id: announcement_id,
          renter_id: renter_id,
        },
      }
    );

    if (updated[0] === 0) {
      return res.status(404).json({
        status_code: 6000,
        message: "No record found for this announcement and user.",
      });
    }

    res.status(200).json({
      status_code: 8000,
      message: "Announcement marked as read successfully.",
    });
  } catch (err) {
    res.status(500).json({
      status_code: 6000,
      message: "Error updating read status",
      description: err.message,
    });
  }
};

exports.UpdateAnnouncement = async (req, res) => {
  const { id } = req.body;
  const updatedData = req.body;

  // ไฟล์แนบ
  if (req.files) {
    if (req.files.banner_announcement?.[0]) {
      updatedData.banner_announcement = req.files.banner_announcement[0].path;
    }
    if (req.files.img_announcement?.[0]) {
      updatedData.img_announcement = req.files.img_announcement[0].path;
    }
    if (req.files.file_announcement?.[0]) {
      updatedData.file_announcement = req.files.file_announcement[0].path;
    }
  }

  const transaction = await connection.transaction();

  try {
    // ค้นหาและอัปเดตประกาศ
    const announcement = await Announcements.findByPk(id);

    if (!announcement) {
      await transaction.rollback();
      return res.status(404).json({
        status_code: 404,
        message: "Announcement not found",
      });
    }

    await announcement.update(updatedData, { transaction });

    // ✅ ค้นหารายชื่อผู้เช่าที่เคยได้รับประกาศนี้
    const recipients = await AnnouncementRecipients.findAll({
      where: { announcement_id: id },
      attributes: ["renter_id"],
      raw: true,
      transaction,
    });

    if (recipients.length > 0) {
      const now = moment().tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");

      // ✅ สร้าง Notification
      const notification = await Notification.create({
        notification_type: "ประกาศ",
        title: "มีการแก้ไขประกาศ",
        message: `แอดมินมีการแก้ไขประกาศเรื่อง: ${updatedData.title_announcement || announcement.title_announcement}`,
        path: `/renter/announcements/details?id=${announcement.id}`,
        notification_no: announcement.id,
        created_date: now,
      }, { transaction });

      // ✅ Mapping แจ้งเตือนไปยัง renter ทุกคนที่เคยได้รับประกาศนี้
      const notificationMappings = recipients.map(rec => ({
        notification_id: notification.notification_id,
        renter_id: rec.renter_id,
        role_id: 3 // สมมุติว่า role_id 3 คือ renter
      }));

      await NotificationMapping.bulkCreate(notificationMappings, { transaction });
    }

    await transaction.commit();

    res.status(200).json({
      status_code: 8000,
      message: "Success",
      description: "Announcement updated and renters notified successfully!",
      data: announcement,
    });
  } catch (err) {
    await transaction.rollback();
    console.error("Error Can't Update Announcement", err);
    res.status(500).json({
      status_code: 6000,
      message: "Error Can't Update Announcement",
      description: err.message,
    });
  }
};


exports.DeleteAnnouncement = async (req, res) => {
  const { id } = req.body;

  const transaction = await connection.transaction(); // สร้าง Transaction

  try {
    // ค้นหาประกาศที่ต้องการลบ
    const announcement = await Announcements.findByPk(id);

    if (!announcement) {
      return res.status(404).json({
        status_code: 404,
        message: "Announcement not found",
      });
    }

    // ลบข้อมูลในตาราง `announcement_recipients` ที่เกี่ยวข้อง
    await AnnouncementRecipients.destroy({
      where: { announcement_id: id },
      transaction,
    });

    // ลบข้อมูลในตาราง `announcements`
    await Announcements.destroy({
      where: { id },
      transaction,
    });

    // Commit Transaction
    await transaction.commit();

    // ส่งข้อมูลตอบกลับเมื่อสำเร็จ
    res.status(200).json({
      status_code: 8000,
      message: "Success",
      description: "Announcement deleted successfully!",
    });
  } catch (err) {
    // Rollback Transaction เมื่อเกิดข้อผิดพลาด
    await transaction.rollback();

    console.error("Error Can't Delete Announcement", err);
    res.status(500).json({
      status_code: 6000,
      message: "Error Can't Delete Announcement",
      description: err.message,
    });
  }
};

exports.GetHistoryAnnouncements = async (req, res) => {
  try {
    // ดึงประกาศทั้งหมดจากตาราง Announcements
    const allAnnouncements = await Announcements.findAll({
      include: [
        {
          model: AnnouncementRecipients,
          // as: 'recipients', // Alias ตรงกับ hasMany
          attributes: ["renter_id", "is_read", "read_at"], // ดึงเฉพาะข้อมูลที่ต้องการ
        },
        {
          model: Community, // เชื่อมกับตาราง Community
          attributes: ["community_name_th"], // ดึงเฉพาะชื่อชุมชน
        },
      ],
      attributes: [
        "id",
        "title_announcement",
        "body_announcement",
        "announcement_type",
        "admin_id",
        "community_id",
        "createdAt",
      ], // เลือกฟิลด์จากตาราง Announcements
      order: [["createdAt", "DESC"]], // เรียงลำดับตามวันที่สร้าง (ล่าสุดอยู่บนสุด)
    });

    const formattedAnnouncements = allAnnouncements.map((announcement) => {
      const community = announcement.Community
        ? announcement.Community.community_name_th
        : null;
      const recipients = announcement.AnnouncementRecipients;

      return {
        id: announcement.id,
        title_announcement: announcement.title_announcement,
        body_announcement: announcement.body_announcement,
        announcement_type: announcement.announcement_type,
        admin_id: announcement.admin_id,
        community_id: announcement.community_id,
        location_name: community, // ใช้ชื่อ Community
        createdAt: announcement.createdAt,
        Renter_read: recipients, // เปลี่ยนชื่อเป็น Renter_read
      };
    });

    res.status(200).json({
      status_code: 8000,
      message: "Success",
      data: formattedAnnouncements,
    });
  } catch (err) {
    res.status(500).json({
      status_code: 6000,
      message: "Error fetching all announcements",
      description: err.message,
    });
  }
};

exports.GetAnnouncementDetails = async (req, res) => {
  try {
    const { id } = req.body;

    // ตรวจสอบว่ามี id และ community_id หรือไม่
    if (!id) {
      return res.status(400).json({
        status_code: 4000,
        message: "Invalid request. Please provide id",
      });
    }

    // ดึงข้อมูลจากตาราง announcements
    const announcement = await Announcements.findOne({
      where: { id },
      attributes: [
        "id",
        "announcement_type",
        "banner_announcement",
        "title_announcement",
        "body_announcement",
        "img_announcement",
        "file_announcement",
        "createdAt",
        "updatedAt",
      ],
    });

    // ตรวจสอบว่าพบข้อมูลหรือไม่
    if (!announcement) {
      return res.status(404).json({
        status_code: 4040,
        message: "ไม่พบข้อมูลประกาศจาก ID นี้",
      });
    }

    // ส่งข้อมูล response
    return res.status(200).json({
      status_code: 8000,
      message: "Success",
      data: announcement,
    });
  } catch (error) {
    // จัดการข้อผิดพลาด
    return res.status(500).json({
      status_code: 6000,
      message: "Error retrieving announcement details",
      description: error.message,
    });
  }
};

exports.CreateAnnouncement = async (req, res) => {
  const AnnouncementData = req.body;

  // แปลง target_renter_ids จาก JSON string เป็น array
  if (AnnouncementData.target_renter_ids) {
    try {
      AnnouncementData.target_renter_ids = JSON.parse(
        AnnouncementData.target_renter_ids
      );
    } catch (err) {
      return res.status(400).json({
        status_code: 6000,
        message: "Invalid target_renter_ids format",
        description: "target_renter_ids should be a valid JSON string.",
      });
    }
  }

  // จัดการไฟล์แนบ
  if (req.files) {
    if (req.files.banner_announcement?.[0]) {
      AnnouncementData.banner_announcement =
        req.files.banner_announcement[0].path;
    }
    if (req.files.img_announcement?.[0]) {
      AnnouncementData.img_announcement = req.files.img_announcement[0].path;
    }
    if (req.files.file_announcement?.[0]) {
      AnnouncementData.file_announcement = req.files.file_announcement[0].path;
    }
  }

  const transaction = await connection.transaction();

  

  try {
    const now = moment().tz("Asia/Bangkok").toDate();
    const newAnnouncement = await Announcements.create({
      ...AnnouncementData,
      createdAt: now,
      updatedAt: now
    }, { transaction });

    let recipients = [];

    // ✅ รวบรวมผู้รับ
    if (AnnouncementData.target_renter_ids?.length > 0) {
      recipients = AnnouncementData.target_renter_ids.map((renterId) => ({
        announcement_id: newAnnouncement.id,
        renter_id: renterId,
        is_read: 0,
        read_at: null,
      }));
    } else if (AnnouncementData.community_id) {
      const RenterInCommunity = await Renter.findAll({
        where: {
          community_id: AnnouncementData.community_id,
          flag_active: "Y",
        },
        attributes: ["id"],
        raw: true,
      });

      if (RenterInCommunity.length > 0) {
        recipients = RenterInCommunity.map((renter) => ({
          announcement_id: newAnnouncement.id,
          renter_id: renter.id,
          is_read: 0,
          read_at: null,
        }));
      }
    }

    // ✅ บันทึกผู้รับ
    if (recipients.length > 0) {
      await AnnouncementRecipients.bulkCreate(recipients, { transaction });

      // ✅ สร้าง Notification
      const now = moment().tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");

      // ✅ สร้างข้อความตามประเภทประกาศ
      let messageText = "";

      if (AnnouncementData.announcement_type === "I") {
        messageText = `ประกาศ"สำคัญ"เรื่อง: ${AnnouncementData.title_announcement}`;
      } else {
        messageText = `ประกาศเรื่อง: ${AnnouncementData.title_announcement}`;
      }

      // ✅ สร้าง Notification
      const notification = await Notification.create(
        {
          notification_type: "ประกาศ",
          title: "มีประกาศใหม่",
          message: messageText,
          path: `/renter/announcements/details?id=${newAnnouncement.id}`,
          notification_no: newAnnouncement.id,
          created_date: now,
        },
        { transaction }
      );

      // ✅ สร้าง NotificationMapping ให้ผู้เช่าทุกคนที่เกี่ยวข้อง
      const notificationMappings = recipients.map((rec) => ({
        notification_id: notification.notification_id,
        renter_id: rec.renter_id,
        role_id: 3, // สมมุติว่า role_id 3 คือ renter
      }));

      await NotificationMapping.bulkCreate(notificationMappings, {
        transaction,
      });
    }

    await transaction.commit();

    res.status(200).json({
      status_code: 8000,
      message: "Success",
      description: "Create New Announcement, Recipients & Notification Done!",
      data: newAnnouncement,
    });
  } catch (err) {
    await transaction.rollback();
    console.error("Error Can't Create Announcement", err);
    res.status(500).json({
      status_code: 6000,
      message: "Error Can't Create Announcement",
      description: err.message,
    });
  }
};
