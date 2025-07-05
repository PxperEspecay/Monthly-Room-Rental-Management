const Notification = require("../Models/notification_model"); // ปรับตามชื่อโมเดลของคุณ
const Renter = require("../Models/renter_model");
const Users = require("../Models/usersModel");
const Role = require("../Models/role_model");
const NotificationMapping = require("../Models/notification_mapping_model");

Notification.hasMany(NotificationMapping, {
  foreignKey: "notification_id",
  as: 'notification_mappings'
});

NotificationMapping.belongsTo(Notification, {
  foreignKey: "notification_id",
  as: 'notification'
});

exports.GetNotification = async (req, res) => {
  try {
    const { renter_id, admin_id } = req.body;

    // ตรวจสอบว่ามีการส่ง renter_id หรือ admin_id อย่างน้อยหนึ่งตัว
    if (!renter_id && !admin_id) {
      return res.status(400).json({
        status_code: 4000,
        message: "Fail",
        description: "กรุณาระบุ renter_id หรือ admin_id",
      });
    }

    // เริ่มต้นสร้างเงื่อนไขการค้นหา
    let whereCondition = {};

    // กำหนดเงื่อนไขตาม role ที่ส่งมา
    if (renter_id) {
      whereCondition.renter_id = renter_id;
    } else if (admin_id) {
      whereCondition.admin_id = admin_id;
    }

    // ดึงข้อมูล notification_mapping พร้อมกับข้อมูล notification ที่เกี่ยวข้อง
    const notificationMappings = await NotificationMapping.findAll({
      where: whereCondition,
      include: [
        {
          model: Notification,
          as: "notification", // ชื่อ association ที่กำหนดในโมเดล
          attributes: ["message", "path", "create_date","notification_type", "notification_no"],
        },
      ],
      order: [
        ["create_date", "DESC"], // เรียงตามวันที่สร้างล่าสุด
      ],
      attributes: ["notification_map_id","notification_id", "is_read", "create_date"],
    });

    // นับจำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน
    const unreadTotal = await NotificationMapping.count({
      where: {
        ...whereCondition,
        is_read: false,
      },
    });

    // ตรวจสอบข้อมูลที่ได้จาก NotificationMappings
    if (!notificationMappings || notificationMappings.length === 0) {
      return res.status(404).json({
        status_code: 4040,
        message: "No notifications found",
        description: "ไม่พบข้อมูลการแจ้งเตือน",
      });
    }

    const formattedNotifications = notificationMappings.map((mapping) => {
      const notification = mapping.notification;
    
      if (!notification) {
        console.error(`No notification found for mapping ID: ${mapping.id}`);
        return {
          notification_map_id: mapping.id,
          notification_id: mapping.notification_id,
          path: null,
          message: null,
          notification_type: null,
          notification_no: null, // 👈 fallback กรณีไม่มีข้อมูล
          is_read: mapping.is_read,
          create_date: mapping.create_date,
        };
      }
    
      return {
        notification_map_id: mapping.notification_map_id,
        notification_id: mapping.notification_id,
        path: notification.path || '',
        message: notification.message || '',
        notification_type: notification.notification_type || '',
        notification_no: notification.notification_no || '',
        is_read: mapping.is_read,
        create_date: mapping.create_date,
      };
    });

    // ส่งข้อมูลกลับไป
    return res.status(200).json({
      status_code: 8000,
      message: "Success",
      description: "Get notification successfully.",
      data: {
        unread_total: unreadTotal,
        notifications: formattedNotifications,
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({
      status_code: 5000,
      message: "Fail",
      description: "เกิดข้อผิดพลาดในการดึงข้อมูลการแจ้งเตือน",
      error: error.message,
    });
  }
};

exports.ReadNotification = async (req, res) => {
    try {
      const { notification_map_id } = req.body;
  
      // ตรวจสอบว่าได้ส่ง notification_map_id มาไหม
      if (!notification_map_id) {
        return res.status(400).json({
          status_code: 4000,
          message: "Fail",
          description: "กรุณาระบุ notification_map_id",
        });
      }
  
      // ค้นหาการแจ้งเตือนที่ตรงกับ notification_map_id
      const notificationMapping = await NotificationMapping.findOne({
        where: { notification_map_id : notification_map_id },
      });
  
      // ตรวจสอบว่าพบการแจ้งเตือน
      if (!notificationMapping) {
        return res.status(404).json({
          status_code: 4040,
          message: "Fail",
          description: "ไม่พบการแจ้งเตือน",
        });
      }
  
      // อัพเดตสถานะ is_read เป็น true
      notificationMapping.is_read = true;
      await notificationMapping.save();
  
      // ส่งข้อมูลกลับ
      return res.status(200).json({
        status_code: 8000,
        message: "Success",
        description: "อ่านการแจ้งเตือนสำเร็จ",
        data: {
          notification_map_id: notificationMapping.id,
          is_read: notificationMapping.is_read,
        },
      });
    } catch (error) {
      console.error("Error reading notification:", error);
      return res.status(500).json({
        status_code: 5000,
        message: "Fail",
        description: "เกิดข้อผิดพลาดในการอ่านการแจ้งเตือน",
        error: error.message,
      });
    }
  };
  
