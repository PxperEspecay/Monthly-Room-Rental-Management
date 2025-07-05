const cron = require("node-cron");
const connection = require("../Config/db");
const BillsNotifications = require("../Models/bills_notifications_model");
const Renter = require("../Models/renter_model");
const Room = require("../Models/room_model");
const Building = require("../Models/building_model");
const BillTypes = require("../Models/bill_types_model");
const Community = require("../Models/communities_model");

const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const { Op, literal } = require("sequelize");
const Notification = require("../Models/notification_model");
const NotificationMapping = require("../Models/notification_mapping_model");

// สร้างความสัมพันธ์ระหว่าง bills_notifications และ bill_types
BillTypes.hasMany(BillsNotifications, {
  foreignKey: "bill_type_id",
  as: "bills",
});

BillsNotifications.belongsTo(BillTypes, {
  foreignKey: "bill_type_id",
  as: "BillType",
});

// Renter มี Room ได้ 1 ห้อง
Renter.belongsTo(Room, { foreignKey: "room_id", as: "Room" });

// Room อาจมีหลาย Renter (กรณีที่ซับซ้อน)
Room.hasMany(Renter, { foreignKey: "room_id", as: "Renters" });

Building.hasMany(Room, { foreignKey: "building_id" });
Room.belongsTo(Building, { foreignKey: "building_id" });

Renter.hasMany(BillsNotifications, {
  foreignKey: "renter_id",
  //   as: "bills",
});

// BillsNotification เชื่อมโยงกับ Renter
BillsNotifications.belongsTo(Renter, {
  foreignKey: "renter_id",
  //   as: "renter",
});

function formatThaiDate(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDate();
  const monthNames = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear() + 543;
  return `${day} ${month} ${year}`;
}

// Job Scheduler: รันทุกวันเวลา 00:00
// cron.schedule("0 0 * * *", async () => {
//   console.log("Running daily bill creation job...");
//   try {
//     console.log("Checking for rent notifications...");

//     const today = new Date();
//     const day = today.getDate(); // วันที่ปัจจุบัน
//     const month = today.getMonth() + 1; // เดือนปัจจุบัน
//     const year = today.getFullYear(); // ปีปัจจุบัน

//     // ดึงข้อมูลผู้เช่าพร้อมข้อมูลห้อง (rooms)
//     const renters = await Renter.findAll({
//       include: {
//         model: Room, // เชื่อมกับตาราง Room
//         attributes: ["monthly_rental_price", "garbage_price"], // ดึงเฉพาะฟิลด์ที่ต้องการ
//       },
//     });

//     for (const renter of renters) {
//       const notificationDate = new Date(year, month, renter.billing_day - 5); // วันที่แจ้งเตือนล่วงหน้า 5 วัน

//       if (
//         notificationDate.getDate() === day &&
//         notificationDate.getMonth() + 1 === month &&
//         notificationDate.getFullYear() === year
//       ) {
//         // ตรวจสอบว่าบิลถูกสร้างหรือยัง
//         const existingNotification = await BillsNotifications.findOne({
//           where: {
//             renter_id: renter.id,
//             month: month,
//             year: year,
//           },
//         });

//         if (!existingNotification) {
//           // คำนวณวันที่ครบกำหนด (due_date)
//           const dueDate = new Date(year, month - 1, renter.billing_day);

//           // ดึงข้อมูลค่าเช่าและค่าขยะจาก Room
//           const monthlyRent = renter.Room?.monthly_rent_amount || 0;
//           const garbageAmount = renter.Room?.garbage_amount || 0;
//           const totalAmount = monthlyRent + garbageAmount;

//           // สร้างบิลใหม่
//           await BillsNotifications.create({
//             renter_id: renter.id,
//             month: month,
//             year: year,
//             monthly_rent_amount: monthlyRent,
//             garbage_amount: garbageAmount,
//             total_amount: totalAmount,
//             due_date: dueDate,
//             payment_status: "unpaid",
//           });

//           console.log(`Created rent notification for renter ID: ${renter.id}`);
//         }
//       }
//     }
//   } catch (error) {
//     console.error("Error creating rent notifications:", error);
//   }
// });

// ล่าสุด
cron.schedule("* * * 1 1", async () => {
  console.log("Running daily bill creation job...");

  try {
    // จำลองวันที่เป็น 25 กุมภาพันธ์ 2025 เพื่อทดสอบ
    const today = new Date(2025, 1, 25); // วันที่ปัจจุบัน
    const todayDate = today.getUTCDate();
    const todayMonth = today.getUTCMonth() + 1; // เดือนปัจจุบัน (1-12)
    const todayYear = today.getUTCFullYear();

    console.log(`Today: ${today.toDateString()}`);

    const renters = await Renter.findAll({
      where: { flag_active: "Y" },
      include: {
        model: Room,
        attributes: ["monthly_rental_price", "garbage_price"],
      },
    });

    for (const renter of renters) {
      const billingDay = renter.billing_day;

      if (!billingDay || billingDay < 1 || billingDay > 31) {
        console.log(
          `Skipping Renter ID ${renter.id}, invalid billing_day: ${billingDay}`
        );
        continue;
      }

      // คำนวณเดือนและปีของบิลที่ต้องสร้าง
      let billMonth = todayMonth + 1;
      let billYear = todayYear;
      if (billMonth > 12) {
        billMonth = 1;
        billYear += 1;
      }

      // คำนวณวันที่แจ้งเตือนล่วงหน้า (billing_day - 5)
      let notificationDate = new Date(
        Date.UTC(billYear, billMonth - 1, billingDay)
      );
      notificationDate.setUTCDate(billingDay - 5);

      console.log(
        `Notification Date for Renter ID ${
          renter.id
        }: ${notificationDate.toISOString()}`
      );

      // ตรวจสอบว่าวันนี้เป็นวันแจ้งเตือนหรือไม่
      if (
        notificationDate.getUTCDate() === todayDate &&
        notificationDate.getUTCMonth() + 1 === todayMonth &&
        notificationDate.getUTCFullYear() === todayYear
      ) {
        console.log(
          `Today is the notification date for Renter ID ${renter.id}`
        );

        // ตรวจสอบว่ามีบิลสำหรับเดือนถัดไปแล้วหรือยัง
        const existingNotification = await BillsNotifications.findOne({
          where: {
            renter_id: renter.id,
            month: billMonth,
            year: billYear,
            bill_type_id: 1,
          },
        });

        if (!existingNotification) {
          const dueDate = new Date(
            Date.UTC(billYear, billMonth - 1, billingDay)
          );
          const formattedDueDate = dueDate.toISOString().slice(0, 10);

          const monthlyRent = renter.Room?.monthly_rental_price || 0;
          const garbageAmount = renter.Room?.garbage_price || 0;
          const totalAmount = monthlyRent + garbageAmount;

          console.log(
            `Creating Bill for ${billMonth}/${billYear}: Rent = ${monthlyRent}, Garbage = ${garbageAmount}, Total = ${totalAmount}`
          );

          await BillsNotifications.create({
            renter_id: renter.id,
            bill_type_id: 1,
            month: billMonth,
            year: billYear,
            monthly_rental_price: monthlyRent,
            garbage_price: garbageAmount,
            total_amount: totalAmount,
            due_date: formattedDueDate,
            payment_status: "unpaid",
          });

          console.log(`Created rent notification for renter ID: ${renter.id}`);
        } else {
          console.log(
            `Bill already exists for Renter ID: ${renter.id} for ${billMonth}/${billYear}`
          );
        }
      }
    }
  } catch (error) {
    console.error("Error creating rent notifications:", error);
  }
});

// cron.schedule("* * * * *", async () => {
//   console.log("Running daily bill creation job...");
//   try {
//     // const today = new Date();
//     // const day = today.getDate();
//     // const month = today.getMonth() + 1; // เดือนปัจจุบัน (1-12)
//     // const year = today.getFullYear();

//         const day = 28; // วันที่ปัจจุบัน
//         const month = 7; // เดือนปัจจุบัน
//         const year = 2025;

//     // ดึงข้อมูลผู้เช่าที่มี flag_active = 'Y'
//     const renters = await Renter.findAll({
//       where: { flag_active: "Y" },
//       include: {
//         model: Room,
//         attributes: ["monthly_rental_price", "garbage_price"],
//       },
//     });

//     for (const renter of renters) {
//       let notificationMonth = month;
//       let notificationYear = year;
//       let dueMonth = month;
//       let dueYear = year;

//       if (renter.billing_day === 1) {
//         // ถ้า billing_day = 1, แจ้งเตือนในเดือนก่อนหน้า
//         notificationMonth = month === 1 ? 12 : month - 1;
//         notificationYear = month === 1 ? year - 1 : year;
//         dueMonth = month; // due_date ยังอยู่ในเดือนปัจจุบัน
//         dueYear = year;
//       } else {
//         // ปกติแจ้งเตือนก่อน 5 วันในเดือนเดียวกัน
//         notificationMonth = month;
//         notificationYear = year;
//         dueMonth = month;
//         dueYear = year;
//       }

//       // คำนวณวันที่แจ้งเตือน
//       const notificationDate = new Date(
//         notificationYear,
//         notificationMonth - 1,
//         renter.billing_day
//       );
//       notificationDate.setDate(notificationDate.getDate() - 5);

//       // คำนวณ due_date
//       const dueDate = new Date(dueYear, dueMonth - 1, renter.billing_day);
//       const formattedDueDate = dueDate.toISOString().slice(0, 10);

//       console.log(
//         `Notification Date for Renter ID ${renter.id}: ${notificationDate}`
//       );

//       // ตรวจสอบว่าวันนี้ตรงกับวันแจ้งเตือนหรือไม่
//       if (
//         notificationDate.getDate() === day &&
//         notificationDate.getMonth() + 1 === month &&
//         notificationDate.getFullYear() === year
//       ) {
//         console.log(
//           `Today is the notification date for Renter ID ${renter.id}`
//         );

//         // ตรวจสอบว่าบิลถูกสร้างแล้วหรือยัง
//         const existingNotification = await BillsNotifications.findOne({
//           where: {
//             renter_id: renter.id,
//             month: dueMonth,
//             year: dueYear,
//           },
//         });

//         if (!existingNotification) {
//           const monthlyRent = renter.Room?.monthly_rental_price || 0;
//           const garbageAmount = renter.Room?.garbage_price || 0;
//           const totalAmount = monthlyRent + garbageAmount;

//           console.log(
//             `Creating Bill: Rent = ${monthlyRent}, Garbage = ${garbageAmount}, Total = ${totalAmount}`
//           );

//           // สร้างบิลใหม่
//           await BillsNotifications.create({
//             renter_id: renter.id,
//             bill_type_id: 1,
//             month: dueMonth,
//             year: dueYear,
//             monthly_rental_price: monthlyRent,
//             garbage_price: garbageAmount,
//             total_amount: totalAmount,
//             due_date: formattedDueDate,
//             payment_status: "unpaid",
//           });

//           console.log(`Created rent notification for renter ID: ${renter.id}`);
//         } else {
//           console.log(`Bill already exists for Renter ID: ${renter.id}`);
//         }
//       }
//     }
//   } catch (error) {
//     console.error("Error creating rent notifications:", error);
//   }
// });

exports.GetBillRentalByRenterID = async (req, res) => {
  const { renter_id } = req.body; // รับ renter_id จาก request body

  try {
    // ตรวจสอบว่ามีการส่ง renter_id มาใน request หรือไม่
    if (!renter_id) {
      return res.status(400).json({
        status_code: 4000,
        message: "กรุณาระบุ renter_id",
      });
    }

    // ดึงข้อมูลบิลสำหรับ renter_id พร้อมข้อมูลประเภทบิล
    const bills = await BillsNotifications.findAll({
      where: { 
        renter_id: renter_id,
        payment_status: "unpaid"
       },
      include: [
        {
          model: BillTypes, // เชื่อมโยงกับตาราง bill_types
          as: "BillType", // ระบุ alias
          attributes: ["type_name"], // ดึงเฉพาะ type_name
        },
      ],
      order: [["due_date", "DESC"]], // เรียงตามวันที่ครบกำหนด (ล่าสุดก่อน)
    });

    // ตรวจสอบว่าพบบิลหรือไม่
    if (bills.length === 0) {
      return res.status(404).json({
        status_code: 4040,
        message: "ไม่พบข้อมูลบิลสำหรับ renter_id นี้",
      });
    }

    // ส่งข้อมูลบิลกลับไป
    return res.status(200).json({
      status_code: 8000,
      message: "Success",
      data: bills,
    });
  } catch (error) {
    console.error("Error fetching bills for renter:", error);
    return res.status(500).json({
      status_code: 6000,
      message: "Fail",
      description: "เกิดข้อผิดพลาดในการดึงข้อมูลบิล",
    });
  }
};

exports.GetHistoryBillByRenterID = async (req, res) => {
  const { renter_id } = req.body; // รับ renter_id จาก request body

  try {
    // ตรวจสอบว่ามีการส่ง renter_id มาใน request หรือไม่
    if (!renter_id) {
      return res.status(400).json({
        status_code: 4000,
        message: "กรุณาระบุ renter_id",
      });
    }

    // ดึงข้อมูลบิลเฉพาะที่มีสถานะ paid หรือ late
    const bills = await BillsNotifications.findAll({
      where: { 
        renter_id: renter_id, 
        payment_status: { [Op.in]: ["paid", "late"] } // กรองเฉพาะสถานะ paid และ late
      },
      include: [
        {
          model: BillTypes, // เชื่อมโยงกับตาราง bill_types
          as: "BillType", // ระบุ alias
          attributes: ["type_name"], // ดึงเฉพาะ type_name
        },
      ],
      order: [["due_date", "DESC"]], // เรียงตามวันที่ครบกำหนด (ล่าสุดก่อน)
    });

    // ตรวจสอบว่าพบบิลหรือไม่
    if (bills.length === 0) {
      return res.status(404).json({
        status_code: 4040,
        message: "ไม่พบประวัติการชำระบิลสำหรับ renter_id นี้",
      });
    }

    // ส่งข้อมูลบิลกลับไป
    return res.status(200).json({
      status_code: 8000,
      message: "Success",
      data: bills,
    });
  } catch (error) {
    console.error("Error fetching history bills for renter:", error);
    return res.status(500).json({
      status_code: 6000,
      message: "Fail",
      description: "เกิดข้อผิดพลาดในการดึงประวัติการชำระบิล",
    });
  }
};

exports.GetBillListByCommunityID = async (req, res) => {
  const { community_id } = req.body;

  try {
    // ✅ ถ้าไม่ได้ส่ง community_id → ดึงผู้เช่าทุกคน
    const whereRenter = {};

    if (community_id && community_id !== "0" && community_id !== "") {
      whereRenter.community_id = community_id;
    }

    const renters = await Renter.findAll({
      attributes: ["id"],
      where: whereRenter,
    });

    if (renters.length === 0) {
      return res.status(404).json({
        status_code: 4040,
        message: "ไม่พบข้อมูลผู้เช่า",
      });
    }

    const renterIds = renters.map((renter) => renter.id);

    const bills = await BillsNotifications.findAll({
      where: {
        renter_id: { [Op.in]: renterIds },
      },
      include: [
        {
          model: Renter,
          as: "Renter",
          attributes: ["id", "prefix", "first_name", "last_name"],
          include: [
            {
              model: Room,
              as: "Room",
              attributes: ["id", "room_number", "building_id"],
            },
          ],
        },
        {
          model: BillTypes,
          as: "BillType",
          attributes: ["type_name"],
        },
      ],
      order: [
        // ✅ เรียงลำดับจาก updated_at มาก่อน
        [
          literal("COALESCE(`BillsNotifications`.`updated_at`, `BillsNotifications`.`created_at`)"),
          "DESC",
        ],
      ],
    });

    if (bills.length === 0) {
      return res.status(404).json({
        status_code: 4041,
        message: "ไม่พบข้อมูลบิล",
      });
    }

    return res.status(200).json({
      status_code: 8000,
      message: "Success",
      data: bills,
    });
  } catch (error) {
    console.error("Error fetching bills by community_id:", error);
    return res.status(500).json({
      status_code: 6000,
      message: "Fail",
      description: "เกิดข้อผิดพลาดในการดึงข้อมูลบิล",
    });
  }
};


exports.UploadSlip = async (req, res) => {
  try {
    const { id, detail_bill_from_renter } = req.body;

    if (!id) {
      return res.status(400).json({
        status_code: 4001,
        message: "กรุณาระบุ bill_id",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status_code: 4002,
        message: "กรุณาอัปโหลดไฟล์สลิป",
      });
    }

    const slipFilePath = req.file.path;

    // ตรวจสอบว่าบิลมีอยู่หรือไม่
    const bill = await BillsNotifications.findOne({ where: { id } });
    if (!bill) {
      fs.unlinkSync(slipFilePath);
      return res.status(404).json({
        status_code: 4040,
        message: "ไม่พบข้อมูลบิลที่ระบุ",
      });
    }

    const formData = new FormData();
    formData.append("files", fs.createReadStream(slipFilePath));

    const headers = {
      ...formData.getHeaders(),
      "x-authorization": "SLIPOKWCTKNA0",
    };

    console.log("Sending Request to SlipOK:", {
      url: "https://api.slipok.com/api/line/apikey/37318",
      headers,
      filePath: slipFilePath,
    });

    const slipResponse = await axios.post(
      "https://api.slipok.com/api/line/apikey/37318",
      formData,
      { headers }
    );
    const slipOKResult = slipResponse.data;

    console.log("SlipOK Response:", slipOKResult);

    const transRef = slipOKResult?.data?.transRef;
    const amount = slipOKResult?.data?.amount;
    const billTotalAmount = parseFloat(bill.total_amount);

    console.log("SlipOK TransRef:", transRef);
    console.log("SlipOK Amount:", amount);
    console.log("Bill Total Amount:", billTotalAmount);

    // ตรวจสอบ TransRef ว่ามีซ้ำในฐานข้อมูลหรือไม่
    const existingSlip = await BillsNotifications.findOne({
      where: { trans_ref: transRef },
    });
    if (existingSlip) {
      fs.unlinkSync(slipFilePath);
      return res.status(400).json({
        status_code: 4008,
        message: "สลิปนี้ถูกใช้ไปแล้ว",
        description: "TransRef ซ้ำกับบิลอื่น",
      });
    }

    // ตรวจสอบยอดเงิน
    if (amount !== billTotalAmount) {
      fs.unlinkSync(slipFilePath);
      return res.status(400).json({
        status_code: 4005,
        message: "จำนวนเงินในสลิปไม่ตรงกับจำนวนเงินในบิล",
      });
    }

    const transTimestamp = new Date(slipOKResult.data.transTimestamp);
    const dueDate = new Date(bill.due_date);

    console.log("Trans Timestamp:", transTimestamp);
    console.log("Due Date:", dueDate);

    let paymentStatus = "paid";
    if (transTimestamp > dueDate) {
      paymentStatus = "late";
    }

    // ย้ายไฟล์ไปยังโฟลเดอร์ถาวร
    const permanentPath = `uploads/slips/${req.file.filename}`;
    fs.renameSync(slipFilePath, permanentPath);

    // อัปเดตบิลในฐานข้อมูล
    bill.img_slip = permanentPath;
    bill.payment_status = paymentStatus;
    bill.paid_at = transTimestamp;
    bill.trans_ref = transRef; // บันทึก TransRef
    bill.detail_bill_from_renter = detail_bill_from_renter || null;
    await bill.save();

    return res.status(200).json({
      status_code: 8000,
      message: "อัปโหลดสลิปสำเร็จและผ่านการตรวจสอบ",
      data: {
        bill_id: bill.id,
        img_slip: bill.img_slip,
        payment_status: bill.payment_status,
        paid_at: bill.paid_at,
        trans_ref: bill.trans_ref,
        detail_bill_from_renter : detail_bill_from_renter || null
      },
    });
  } catch (error) {
    console.error("Error processing slip upload:", error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      status_code: 6000,
      message: "เกิดข้อผิดพลาดในการอัปโหลดสลิป",
      description: error.message,
    });
  }
};

exports.GetBillDetails = async (req, res) => {
  try {
    const { id } = req.body; // รับ bill_id จาก request body

    // ตรวจสอบว่ามีการส่ง id มาหรือไม่
    if (!id) {
      return res.status(400).json({
        status_code: 4001,
        message: "กรุณาระบุ bill_id",
      });
    }

    // ดึงข้อมูลบิลจากฐานข้อมูล พร้อมรายละเอียดผู้เช่าและห้อง
    const bill = await BillsNotifications.findOne({
      where: { id },
      include: [
        {
          model: Renter, // เชื่อมโยงกับตาราง Renter (ผู้เช่า)
          attributes: ["id", "prefix", "first_name", "last_name"], // ดึงข้อมูลผู้เช่า
          include: [
            {
              model: Room, // เชื่อมโยงกับตาราง Room (ห้อง)
              attributes: ["id", "room_number", "building_id"], // ดึงข้อมูลห้อง
              include: [
                {
                  model: Building, // เชื่อมโยงกับตาราง Building เพื่อดึงชื่ออาคาร
                  attributes: ["building_name"], // ดึงชื่ออาคารจากตาราง Building
                },
              ],
            },
            {
              model: Community, // เชื่อมโยงกับตาราง Community
              attributes: ["id", "community_name_th"], // ดึงข้อมูล Community
            },
          ],
        },
        {
          model: BillTypes,
          as: "BillType",
          attributes: ["type_name"],
        },
      ],
    });
    

    // ตรวจสอบว่าพบบิลหรือไม่
    if (!bill) {
      return res.status(404).json({
        status_code: 4040,
        message: "ไม่พบข้อมูลบิลตาม id ที่ระบุ",
      });
    }

    // ส่งข้อมูลบิลกลับไป
    return res.status(200).json({
      status_code: 8000,
      message: "Success",
      data: bill,
    });
  } catch (error) {
    console.error("Error fetching bill details:", error);

    return res.status(500).json({
      status_code: 6000,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลบิล",
      description: error.message,
    });
  }
};

exports.GetMasterBillType = async (req, res) => {
  try {
    // ดึงข้อมูล bill_types ทั้งหมด
    const billTypes = await BillTypes.findAll({
      attributes: ["id", "type_name", "description"],
      order: [["id", "ASC"]], // เรียงตาม id
    });

    // ตรวจสอบว่าพบข้อมูลหรือไม่
    if (billTypes.length === 0) {
      return res.status(200).json({
        status_code: 8000,
        message: "No bill types found.",
        data: [],
      });
    }

    // ส่งข้อมูลผลลัพธ์
    return res.status(200).json({
      status_code: 8000,
      message: "Success",
      description: "Fetched bill types successfully!",
      data: billTypes,
    });
  } catch (error) {
    console.error("Error fetching bill types:", error);
    return res.status(500).json({
      status_code: 6000,
      message: "Fail",
      description: "Error retrieving bill types",
      error: error.message,
    });
  }
};

exports.CreateBill = async (req, res) => {
  const transaction = await connection.transaction();

  try {
    const {
      renter_id,
      month = null,
      year = null,
      bill_type_id,
      monthly_rental_price = 0,
      garbage_price = 0,
      fee_price = 0,
      repair_airconditioner_price = 0,
      wash_airconditioner_price = 0,
      fines_price = 0,
      other_price = 0,
      due_date,
    } = req.body;

    let detailBillData = null;
    if (bill_type_id !== 1 && req.body.detail_bill) {
      try {
        detailBillData = JSON.stringify(JSON.parse(req.body.detail_bill));
      } catch (error) {
        await transaction.rollback();
        return res.status(400).json({
          status_code: 4002,
          message: "รูปแบบของ detail_bill ไม่ถูกต้อง",
          description: "กรุณาส่งข้อมูล detail_bill เป็น JSON ที่ถูกต้อง",
        });
      }
    }

    if (!renter_id || !bill_type_id || !due_date) {
      await transaction.rollback();
      return res.status(400).json({
        status_code: 4000,
        message: "Missing required fields",
        description: "กรุณาระบุ renter_id, bill_type_id และ due_date",
      });
    }

    const renter = await Renter.findOne({
      where: { id: renter_id, flag_active: "Y" },
      transaction,
    });

    if (!renter) {
      await transaction.rollback();
      return res.status(404).json({
        status_code: 4040,
        message: "ไม่พบข้อมูลผู้เช่าหรือผู้เช่าไม่ได้อยู่ในสถานะ Active",
      });
    }

    const billType = await BillTypes.findOne({
      where: { id: bill_type_id },
      transaction,
    });

    if (!billType) {
      await transaction.rollback();
      return res.status(404).json({
        status_code: 4041,
        message: "ไม่พบประเภทบิลที่ระบุ",
      });
    }

    if (bill_type_id === 1) {
      if (!month || !year) {
        await transaction.rollback();
        return res.status(400).json({
          status_code: 4003,
          message: "Missing required fields for rental bill",
          description: "สำหรับบิลค่าเช่า กรุณาระบุ month และ year",
        });
      }

      const existingBill = await BillsNotifications.findOne({
        where: {
          renter_id: parseInt(renter_id),
          month: parseInt(month),
          year: parseInt(year),
          bill_type_id: parseInt(bill_type_id),
        },
        transaction,
      });

      if (existingBill) {
        await transaction.rollback();
        return res.status(200).json({
          status_code: 4001,
          message: "บิลค่าเช่าของเดือนและปีนี้ถูกสร้างไปแล้ว",
        });
      }
    }

    const total_amount =
      parseFloat(monthly_rental_price) +
      parseFloat(garbage_price) +
      parseFloat(fee_price) +
      parseFloat(repair_airconditioner_price) +
      parseFloat(fines_price) +
      parseFloat(other_price) +
      parseFloat(wash_airconditioner_price);

    // ✅ 1. สร้างบิล
    const newBill = await BillsNotifications.create({
      renter_id,
      month,
      year,
      bill_type_id,
      monthly_rental_price,
      garbage_price,
      fee_price,
      fines_price,
      repair_airconditioner_price,
      wash_airconditioner_price,
      other_price,
      total_amount,
      due_date,
      payment_status: "unpaid",
      notification_sent: true,
      detail_bill: detailBillData,
    }, { transaction });

    
    
    // ✅ 2. สร้าง Notification สำหรับ Renter
    const dueDateThai = formatThaiDate(due_date);
    const notification_type = 'บิล';
    const title = "แจ้งเตือนบิลชำระเงินใหม่";
    const message = `คุณมีบิล ${billType.bill_type_name} ที่ต้องชำระก่อนวันที่ ${dueDateThai}`;
    const path = `/renter/bills/details?id=${newBill.id}`;

    const notification = await Notification.create(
      {
        notification_type,
        title,
        message,
        path,
        notification_no: newBill.id,
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

    await transaction.commit();

    return res.status(201).json({
      status_code: 8000,
      message: "Success",
      description: "สร้างบิลสำเร็จและส่งแจ้งเตือนไปยังผู้เช่าเรียบร้อย",
      data: newBill,
    });

  } catch (error) {
    await transaction.rollback();
    console.error("Error creating bill:", error);
    return res.status(500).json({
      status_code: 6000,
      message: "เกิดข้อผิดพลาดในการสร้างบิล",
      description: error.message,
    });
  }
};

exports.DeleteBill = async (req, res) => {
  try {
    const { bill_id } = req.body;

    // ตรวจสอบว่ามีการส่ง bill_id มาหรือไม่
    if (!bill_id) {
      return res.status(400).json({
        status_code: 4000,
        message: "Missing required field",
        description: "กรุณาระบุ bill_id",
      });
    }

    // ค้นหาบิลที่ต้องการลบ
    const bill = await BillsNotifications.findOne({ where: { id: bill_id } });

    // ถ้าบิลไม่มีอยู่ ให้แจ้งเตือนว่าไม่พบ
    if (!bill) {
      return res.status(404).json({
        status_code: 4040,
        message: "ไม่พบบิลที่ระบุ",
      });
    }

    // ลบบิลออกจากฐานข้อมูล
    await bill.destroy();

    // ส่งผลลัพธ์กลับ
    return res.status(200).json({
      status_code: 8000,
      message: "Success",
      description: "ลบบิลสำเร็จ",
    });
  } catch (error) {
    console.error("Error deleting bill:", error);
    return res.status(500).json({
      status_code: 6000,
      message: "เกิดข้อผิดพลาดในการลบบิล",
      description: error.message,
    });
  }
};

exports.UpdateBill = async (req, res) => {
  try {
    const dataBill = req.body;

    let detailBillData = null;
    if (dataBill.bill_type_id !== 1 && dataBill.detail_bill) {
      try {
        detailBillData = JSON.stringify(JSON.parse(dataBill.detail_bill)); // ตรวจสอบให้เป็น JSON String
      } catch (error) {
        return res.status(400).json({
          status_code: 4002,
          message: "รูปแบบของ detail_bill ไม่ถูกต้อง",
          description: "กรุณาส่งข้อมูล detail_bill เป็น JSON ที่ถูกต้อง",
        });
      }
    }

    // ตรวจสอบค่าที่จำเป็นต้องมี
    if (!dataBill.bill_id || !dataBill.renter_id || !dataBill.bill_type_id || !dataBill.due_date) {
      return res.status(400).json({
        status_code: 4000,
        message: "Missing required fields",
        description: "กรุณาระบุ bill_id, renter_id, bill_type_id และ due_date",
      });
    }

    // ตรวจสอบว่าบิลมีอยู่หรือไม่
    const existingBill = await BillsNotifications.findOne({ where: { id: dataBill.bill_id } });
    if (!existingBill) {
      return res.status(404).json({
        status_code: 4044,
        message: "ไม่พบบิลที่ต้องการอัปเดต",
      });
    }

    // ตรวจสอบว่าผู้เช่ามีอยู่หรือไม่
    const renter = await Renter.findOne({
      where: { id: dataBill.renter_id, flag_active: "Y" },
    });
    if (!renter) {
      return res.status(404).json({
        status_code: 4040,
        message: "ไม่พบข้อมูลผู้เช่าหรือผู้เช่าไม่ได้อยู่ในสถานะ Active",
      });
    }

    // ตรวจสอบว่าประเภทบิลมีอยู่หรือไม่
    const billType = await BillTypes.findOne({ where: { id: dataBill.bill_type_id } });
    if (!billType) {
      return res.status(404).json({
        status_code: 4041,
        message: "ไม่พบประเภทบิลที่ระบุ",
      });
    }

    // ตรวจสอบความถูกต้องของ month และ year สำหรับบิลประเภทค่าเช่า (bill_type_id = 1)
    if (dataBill.bill_type_id === 1 && (!dataBill.month || !dataBill.year)) {
      return res.status(400).json({
        status_code: 4003,
        message: "Missing required fields for rental bill",
        description: "สำหรับบิลค่าเช่า (bill_type_id = 1) กรุณาระบุ month และ year",
      });
    }

    // คำนวณ total_amount (รวมค่าใช้จ่ายทั้งหมด)
    const total_amount =
      parseFloat(dataBill.monthly_rental_price || 0) +
      parseFloat(dataBill.garbage_price || 0) +
      parseFloat(dataBill.fee_price || 0) +
      parseFloat(dataBill.repair_airconditioner_price || 0) +
      parseFloat(dataBill.wash_airconditioner_price || 0) +
      parseFloat(dataBill.fines_price || 0) +
      parseFloat(dataBill.other_price || 0);

    // อัปเดตบิลที่มีอยู่
    await BillsNotifications.update(
      {
        renter_id: dataBill.renter_id,
        month: dataBill.month,
        year: dataBill.year,
        bill_type_id: dataBill.bill_type_id,
        monthly_rental_price: dataBill.monthly_rental_price,
        garbage_price: dataBill.garbage_price,
        fee_price: dataBill.fee_price,
        fines_price: dataBill.fines_price,
        repair_airconditioner_price: dataBill.repair_airconditioner_price,
        wash_airconditioner_price: dataBill.wash_airconditioner_price,
        other_price: dataBill.other_price,
        total_amount: total_amount,
        due_date: dataBill.due_date,
        payment_status: dataBill.payment_status || existingBill.payment_status,
        detail_bill: detailBillData || existingBill.detail_bill,
      },
      { where: { id: dataBill.bill_id } }
    );

    // ดึงข้อมูลบิลที่อัปเดตล่าสุด
    const updatedBill = await BillsNotifications.findOne({ where: { id: dataBill.bill_id } });

    // ส่งผลลัพธ์กลับ
    return res.status(200).json({
      status_code: 8000,
      message: "Success",
      description: "อัปเดตบิลสำเร็จ",
      data: updatedBill,
    });
  } catch (error) {
    console.error("Error updating bill:", error);
    return res.status(500).json({
      status_code: 6000,
      message: "เกิดข้อผิดพลาดในการอัปเดตบิล",
      description: error.message,
    });
  }
};




