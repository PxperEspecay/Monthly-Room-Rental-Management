const connection = require("../Config/db");
const { Op, fn, col, literal } = require("sequelize");
const Community = require("../Models/communities_model");
const Building = require("../Models/building_model");
const Room = require("../Models/room_model");
const BillsNotifications = require("../Models/bills_notifications_model");
const Renter = require("../Models/renter_model");
const BillTypes = require("../Models/bill_types_model");
const IssuesReport = require("../Models/issues_report_model");
const Users = require("../Models/usersModel");
const Role = require("../Models/role_model");
const RepairRequest = require("../Models/repair_request_model");
const RepairSchedule = require("../Models/repair_schedule_model");
const RepairType = require("../Models/repair_type_model");
const Announcements = require("../Models/announcement_model");
const AnnouncementRecipients = require("../Models/announcement_recipients_model");

Building.hasMany(Room, { foreignKey: "building_id" });
Room.belongsTo(Building, { foreignKey: "building_id" });
Room.hasMany(Renter, { foreignKey: "room_id" });
Renter.belongsTo(Room, { foreignKey: "room_id" });
BillTypes.hasMany(BillsNotifications, {
  foreignKey: "bill_type_id",
  as: "billsbillNotifications_dash",
});
BillsNotifications.belongsTo(BillTypes, {
  foreignKey: "bill_type_id",
  as: "BillType_dash",
});
Renter.hasMany(BillsNotifications, {
  foreignKey: "renter_id",
});
BillsNotifications.belongsTo(Renter, {
  foreignKey: "renter_id",
  // as: "renter",
});
RepairRequest.belongsTo(RepairType, {
  foreignKey: "type_repair_id",
  as: "RepairType_dash",
});
Announcements.hasMany(AnnouncementRecipients, {
  foreignKey: "announcement_id",
});
AnnouncementRecipients.belongsTo(Announcements, {
  foreignKey: "announcement_id",
});
Announcements.belongsTo(Community, { foreignKey: "community_id" });

// exports.GetDashboardData = async (req, res) => {
//   const { community_id, building_id } = req.body;

//   try {
//     // ห้องทั้งหมดในอาคารนั้น
//     const totalRoom = await Room.count({ where: { building_id } });

//     // ห้องว่าง / ไม่ว่าง
//     const availableRoom = await Room.count({
//       where: { building_id, status_room: "Y" },
//     });
//     const unavailableRoom = await Room.count({
//       where: { building_id, status_room: "N" },
//     });

//     // ผู้เช่าทั้งหมดในอาคารนั้น (เชื่อมผ่าน room)
//     const totalRenter = await Renter.count({
//       include: [{ model: Room, where: { building_id } }],
//     });

//     const activeRenter = await Renter.count({
//       where: { flag_active: "Y" },
//       include: [{ model: Room, where: { building_id } }],
//     });

//     // สัดส่วนเพศจาก renters
//     const maleCount = await Renter.count({
//       where: { gender: "M" },
//       include: [{ model: Room, where: { building_id } }],
//     });

//     const femaleCount = await Renter.count({
//       where: { gender: "F" },
//       include: [{ model: Room, where: { building_id } }],
//     });

//     // สถานะของการแจ้งเรื่อง (ผ่าน Renter -> Room -> Building)
//     const issueStatuses = [
//       "waiting_to_check",
//       "pending",
//       "in_progress",
//       "completed",
//       "rejected",
//       "fail",
//       "cancel",
//     ];
//     const issueStatusCounts = {};
//     for (const status of issueStatuses) {
//       issueStatusCounts[status] = await IssuesReport.count({
//         where: { status, community_id },
//         include: [
//           {
//             model: Renter,
//             include: [
//               {
//                 model: Room,
//                 where: { building_id },
//               },
//             ],
//           },
//         ],
//       });
//     }

//     const totalIssue = await IssuesReport.count({
//       where: { community_id },
//       include: [
//         {
//           model: Renter,
//           include: [{ model: Room, where: { building_id } }],
//         },
//       ],
//     });

//     // สถานะการแจ้งเตือนบิล (ดึงจาก renter -> room -> building)
//     const billStatuses = ["paid", "unpaid", "late", "overdue"];
//     const billStatusCounts = {};
//     for (const payment_status of billStatuses) {
//       billStatusCounts[payment_status] = await BillsNotifications.count({
//         where: { payment_status },
//         include: [
//           { model: Renter, include: [{ model: Room, where: { building_id } }] },
//         ],
//       });
//     }

//     const totalBill = await BillsNotifications.count({
//       include: [
//         { model: Renter, include: [{ model: Room, where: { building_id } }] },
//       ],
//     });

//     const billTypeCountsRaw = await BillsNotifications.findAll({
//       include: [
//         { model: Renter, include: [{ model: Room, where: { building_id } }] },
//         { model: BillTypes, as: "BillType_dash", attributes: ["type_name"] },
//       ],
//       attributes: [
//         "bill_type_id",
//         [fn("COUNT", col("BillsNotifications.id")), "count"],
//       ],
//       group: ["bill_type_id", "BillType_dash.type_name"],
//     });

//     const billTypeMap = {};
//     billTypeCountsRaw.forEach((item) => {
//       billTypeMap[item.BillType_dash.type_name] = parseInt(
//         item.dataValues.count
//       );
//     });

//     const incomeFromRentBills = await BillsNotifications.sum("total_amount", {
//       where: {
//         payment_status: { [Op.in]: ["paid", "late"] },
//       },
//       include: [
//         { model: Renter, include: [{ model: Room, where: { building_id } }] },
//         {
//           model: BillTypes,
//           as: "BillType_dash",
//           where: { type_name: "ค่าเช่ารายเดือน" },
//         },
//       ],
//     });

//     const incomeByMonthRaw = await BillsNotifications.findAll({
//       attributes: [
//         [fn("MONTH", col("BillsNotifications.created_at")), "month"],
//         [fn("SUM", col("total_amount")), "total"],
//       ],
//       where: {
//         payment_status: { [Op.in]: ["paid", "late"] },
//       },
//       include: [
//         { model: Renter, include: [{ model: Room, where: { building_id } }] },
//         {
//           model: BillTypes,
//           as: "BillType_dash",
//           where: { type_name: "ค่าเช่ารายเดือน" },
//         },
//       ],
//       group: ["month"],
//       order: [[fn("MONTH", col("BillsNotifications.created_at")), "ASC"]],
//     });

//     const incomeByMonth = {};
//     incomeByMonthRaw.forEach((item) => {
//       const month = item.dataValues.month;
//       const total = parseFloat(item.dataValues.total);
//       incomeByMonth[month] = total;
//     });

//     // จำนวนตามประเภทของการแจ้งเรื่อง
//     const urgentIssuesCount = await IssuesReport.count({
//       where: { urgent_issue: true, community_id },
//       include: [
//         {
//           model: Renter,
//           include: [{ model: Room, where: { building_id } }],
//         },
//       ],
//     });

//     const normalIssuesCount = await IssuesReport.count({
//       where: { urgent_issue: false, community_id },
//       include: [
//         {
//           model: Renter,
//           include: [{ model: Room, where: { building_id } }],
//         },
//       ],
//     });

//     const repairTypeCountsRaw = await RepairRequest.findAll({
//       include: [
//         {
//           model: Renter,
//           include: [{ model: Room, where: { building_id } }],
//         },
//         {
//           model: RepairType,
//           as: "RepairType_dash",
//           attributes: ["type_repair_name"],
//         },
//       ],
//       attributes: [
//         "type_repair_id",
//         [fn("COUNT", col("RepairRequest.id")), "count"],
//       ],
//       group: ["type_repair_id", "RepairType_dash.type_repair_name"],
//     });

//     const repairTypeMap = {};
//     repairTypeCountsRaw.forEach((item) => {
//       repairTypeMap[item.RepairType_dash.type_repair_name] = parseInt(
//         item.dataValues.count
//       );
//     });

//     const repairStatusCountsRaw = await RepairRequest.findAll({
//       include: [
//         {
//           model: Renter,
//           include: [{ model: Room, where: { building_id } }],
//         },
//       ],
//       attributes: ["status", [fn("COUNT", col("RepairRequest.id")), "count"]],
//       group: ["status"],
//     });

//     const repairStatusMap = {};
//     repairStatusCountsRaw.forEach((item) => {
//       repairStatusMap[item.status] = parseInt(item.dataValues.count);
//     });

//     const totalRepair = await RepairRequest.count({
//       include: [
//         { model: Renter, include: [{ model: Room, where: { building_id } }] },
//       ],
//     });

//     const totalAnnouncements = await Announcements.count({
//       where: { community_id },
//     });

//     const seenAnnouncements = await Announcements.count({
//       where: { community_id },
//       include: [
//         {
//           model: AnnouncementRecipients,
//           where: { is_read: true },
//           required: true,
//         },
//       ],
//     });

//     const unseenAnnouncements = totalAnnouncements - seenAnnouncements;

//     return res.status(200).json({
//       status_code: 8000,
//       data: {
//         totalRoom,
//         availableRoom,
//         unavailableRoom,
//         totalRenter,
//         activeRenter,
//         genderRatio: { male: maleCount, female: femaleCount },
//         totalIssue,
//         issueStatusCounts,
//         issueTypesCount: {
//           urgent: urgentIssuesCount,
//           normal: normalIssuesCount,
//         },
//         bill: {
//           total_bill: totalBill,
//           bill_type: billTypeMap,
//           bill_status: billStatusCounts,
//           income_from_rent: incomeFromRentBills || 0,
//           income_by_month: incomeByMonth,
//         },
//         repair: {
//           repair_req_total: totalRepair,
//           type: repairTypeMap,
//           status: repairStatusMap,
//         },
//         announcements: {
//           total: totalAnnouncements,
//           seen: seenAnnouncements,
//           unseen: unseenAnnouncements,
//         },
//       },
//     });
//   } catch (error) {
//     console.error("[Dashboard Error]", error);
//     return res.status(500).json({
//       status_code: 5000,
//       message: "เกิดข้อผิดพลาดระหว่างการดึงข้อมูล Dashboard",
//       error: error.message,
//     });
//   }
// };

// exports.GetDashboardData = async (req, res) => {
//     let { community_id, building_id } = req.body;
  
//     const hasCommunityFilter = community_id !== undefined && community_id !== null && community_id !== '';
//     const hasBuildingFilter = building_id !== undefined && building_id !== null && building_id !== '';
//     const communityWhere = hasCommunityFilter ? { community_id } : {};
//     const roomWhere = hasBuildingFilter ? { building_id } : {};
  
//     try {
//       const totalRoom = await Room.count({ where: roomWhere });
//       const availableRoom = await Room.count({ where: { ...roomWhere, status_room: 'Y' } });
//       const unavailableRoom = await Room.count({ where: { ...roomWhere, status_room: 'N' } });
  
//       const totalRenter = await Renter.count({ include: [{ model: Room, where: roomWhere }] });
//       const activeRenter = await Renter.count({ where: { flag_active: 'Y' }, include: [{ model: Room, where: roomWhere }] });
//       const maleCount = await Renter.count({ where: { gender: 'M', flag_active: 'Y' }, include: [{ model: Room, where: roomWhere }] });
//       const femaleCount = await Renter.count({ where: { gender: 'F', flag_active: 'Y' }, include: [{ model: Room, where: roomWhere }] });
  
//       const issueStatuses = ['waiting_to_check', 'pending', 'in_progress', 'completed', 'rejected', 'fail', 'cancel'];
//       const issueStatusCounts = {};
//       for (const status of issueStatuses) {
//         issueStatusCounts[status] = await IssuesReport.count({
//           where: { status, ...communityWhere },
//           include: [{ model: Renter, include: [{ model: Room, where: roomWhere }] }]
//         });
//       }
  
//       const totalIssue = await IssuesReport.count({
//         where: { ...communityWhere },
//         include: [{ model: Renter, include: [{ model: Room, where: roomWhere }] }]
//       });
  
//       const billStatuses = ['paid', 'unpaid', 'late', 'overdue'];
//       const billStatusCounts = {};
//       for (const payment_status of billStatuses) {
//         billStatusCounts[payment_status] = await BillsNotifications.count({
//           where: { payment_status },
//           include: [{ model: Renter, include: [{ model: Room, where: roomWhere }] }]
//         });
//       }
  
//       const totalBill = await BillsNotifications.count({
//         include: [{ model: Renter, include: [{ model: Room, where: roomWhere }] }]
//       });
  
//       const billTypeCountsRaw = await BillsNotifications.findAll({
//         include: [
//           { model: Renter, include: [{ model: Room, where: roomWhere }] },
//           { model: BillTypes, as: 'BillType_dash', attributes: ['type_name'] }
//         ],
//         attributes: ['bill_type_id', [fn('COUNT', col('BillsNotifications.id')), 'count']],
//         group: ['bill_type_id', 'BillType_dash.type_name']
//       });
  
//       const billTypeMap = {};
//       billTypeCountsRaw.forEach(item => {
//         billTypeMap[item.BillType_dash.type_name] = parseInt(item.dataValues.count);
//       });
  
//       const incomeFromRentBills = await BillsNotifications.sum('total_amount', {
//         where: { payment_status: { [Op.in]: ['paid', 'late'] } },
//         include: [
//           { model: Renter, include: [{ model: Room, where: roomWhere }] },
//           { model: BillTypes, as: 'BillType_dash', where: { type_name: 'ค่าเช่ารายเดือน' } }
//         ]
//       });
  
//       const incomeByMonthRaw = await BillsNotifications.findAll({
//         attributes: [
//           [fn('MONTH', col('BillsNotifications.created_at')), 'month'],
//           [fn('SUM', col('total_amount')), 'total']
//         ],
//         where: { payment_status: { [Op.in]: ['paid', 'late'] } },
//         include: [
//           { model: Renter, include: [{ model: Room, where: roomWhere }] },
//           { model: BillTypes, as: 'BillType_dash', where: { type_name: 'ค่าเช่ารายเดือน' } }
//         ],
//         group: ['month'],
//         order: [[fn('MONTH', col('BillsNotifications.created_at')), 'ASC']]
//       });
  
//       const incomeByMonth = {};
//       incomeByMonthRaw.forEach(item => {
//         const month = item.dataValues.month;
//         const total = parseFloat(item.dataValues.total);
//         incomeByMonth[month] = total;
//       });
  
//       const urgentIssuesCount = await IssuesReport.count({
//         where: { urgent_issue: true, ...communityWhere },
//         include: [{ model: Renter, include: [{ model: Room, where: roomWhere }] }]
//       });
  
//       const normalIssuesCount = await IssuesReport.count({
//         where: { urgent_issue: false, ...communityWhere },
//         include: [{ model: Renter, include: [{ model: Room, where: roomWhere }] }]
//       });
  
//       const repairTypeCountsRaw = await RepairRequest.findAll({
//         include: [
//           { model: Renter, include: [{ model: Room, where: roomWhere }] },
//           { model: RepairType, as: 'RepairType_dash', attributes: ['type_repair_name'] }
//         ],
//         attributes: ['type_repair_id', [fn('COUNT', col('RepairRequest.id')), 'count']],
//         group: ['type_repair_id', 'RepairType_dash.type_repair_name']
//       });
  
//       const repairTypeMap = {};
//       repairTypeCountsRaw.forEach(item => {
//         repairTypeMap[item.RepairType_dash.type_repair_name] = parseInt(item.dataValues.count);
//       });
  
//       const repairStatusCountsRaw = await RepairRequest.findAll({
//         include: [{ model: Renter, include: [{ model: Room, where: roomWhere }] }],
//         attributes: ['status', [fn('COUNT', col('RepairRequest.id')), 'count']],
//         group: ['status']
//       });
  
//       const repairStatusMap = {};
//       repairStatusCountsRaw.forEach(item => {
//         repairStatusMap[item.status] = parseInt(item.dataValues.count);
//       });
  
//       const totalRepair = await RepairRequest.count({
//         include: [{ model: Renter, include: [{ model: Room, where: roomWhere }] }]
//       });
  
//       const totalAnnouncements = await Announcements.count({ where: { ...communityWhere } });
  
//       const seenAnnouncements = await Announcements.count({
//         where: { ...communityWhere },
//         include: [{ model: AnnouncementRecipients, where: { is_read: true }, required: true }]
//       });
  
//       const unseenAnnouncements = totalAnnouncements - seenAnnouncements;

      
  
//       return res.status(200).json({
//         status_code: 8000,
//         data: {
//           totalRoom,
//           availableRoom,
//           unavailableRoom,
//           totalRenter,
//           activeRenter,
//           genderRatio: { male: maleCount, female: femaleCount },
//           totalIssue,
//           issueStatusCounts,
//           issueTypesCount: { urgent: urgentIssuesCount, normal: normalIssuesCount },
//           bill: {
//             total_bill: totalBill,
//             bill_type: billTypeMap,
//             bill_status: billStatusCounts,
//             income_from_rent: incomeFromRentBills || 0,
//             income_by_month: incomeByMonth
//           },
//           repair: {
//             repair_req_total: totalRepair,
//             type: repairTypeMap,
//             status: repairStatusMap
//           },
//           announcements: {
//             total: totalAnnouncements,
//             seen: seenAnnouncements,
//             unseen: unseenAnnouncements
//           }
//         }
//       });
//     } catch (error) {
//       console.error('[Dashboard Error]', error);
//       return res.status(500).json({
//         status_code: 5000,
//         message: 'เกิดข้อผิดพลาดระหว่างการดึงข้อมูล Dashboard',
//         error: error.message
//       });
//     }
//   };


exports.GetDashboardData = async (req, res) => {
  let { community_id, building_id } = req.body;

  const isAllCommunities =
    community_id === 0 ||
    community_id === '0' ||
    community_id === '' ||
    community_id === null ||
    community_id === undefined;

  const hasCommunityFilter = !isAllCommunities;

  const isAllBuildings = building_id === 0 || building_id === '0';
  const hasBuildingFilter = !isAllBuildings && building_id !== undefined && building_id !== null;

  const roomWhere = hasBuildingFilter ? { building_id } : {};

  const includeRoomWithBuilding = {
    model: Room,
    where: roomWhere,
    required: true,
    include: hasCommunityFilter
      ? [{ model: Building, where: { community_id }, required: true }]
      : []
  };

  try {
    const totalRoom = await Room.count({
      where: roomWhere,
      include: hasCommunityFilter
        ? [{ model: Building, where: { community_id }, required: true }]
        : []
    });

    const availableRoom = await Room.count({
      where: { ...roomWhere, status_room: 'Y' },
      include: hasCommunityFilter
        ? [{ model: Building, where: { community_id }, required: true }]
        : []
    });

    const unavailableRoom = await Room.count({
      where: { ...roomWhere, status_room: 'N' },
      include: hasCommunityFilter
        ? [{ model: Building, where: { community_id }, required: true }]
        : []
    });

    const totalRenter = await Renter.count({ include: [includeRoomWithBuilding] });
    const activeRenter = await Renter.count({
      where: { flag_active: 'Y' },
      include: [includeRoomWithBuilding]
    });

    const maleCount = await Renter.count({
      where: { gender: 'M', flag_active: 'Y' },
      include: [includeRoomWithBuilding]
    });

    const femaleCount = await Renter.count({
      where: { gender: 'F', flag_active: 'Y' },
      include: [includeRoomWithBuilding]
    });

    const issueStatuses = ['waiting_to_check', 'pending', 'in_progress', 'completed', 'rejected', 'fail', 'cancel'];
    const issueStatusCounts = {};
    for (const status of issueStatuses) {
      issueStatusCounts[status] = await IssuesReport.count({
        where: { status },
        include: [{ model: Renter, required: true, include: [includeRoomWithBuilding] }]
      });
    }

    const totalIssue = await IssuesReport.count({
      include: [{ model: Renter, required: true, include: [includeRoomWithBuilding] }]
    });

    const billStatuses = ['paid', 'unpaid', 'late', 'overdue'];
    const billStatusCounts = {};
    for (const payment_status of billStatuses) {
      billStatusCounts[payment_status] = await BillsNotifications.count({
        where: { payment_status },
        include: [{ model: Renter, required: true, include: [includeRoomWithBuilding] }]
      });
    }

    const totalBill = await BillsNotifications.count({
      include: [{ model: Renter, required: true, include: [includeRoomWithBuilding] }]
    });

    const billTypeCountsRaw = await BillsNotifications.findAll({
      include: [
        { model: Renter, required: true, include: [includeRoomWithBuilding] },
        { model: BillTypes, as: 'BillType_dash', attributes: ['type_name'] }
      ],
      attributes: ['bill_type_id', [fn('COUNT', col('BillsNotifications.id')), 'count']],
      group: ['bill_type_id', 'BillType_dash.type_name']
    });

    const billTypeMap = {};
    billTypeCountsRaw.forEach(item => {
      billTypeMap[item.BillType_dash.type_name] = parseInt(item.dataValues.count);
    });

    const incomeFromRentBills = await BillsNotifications.sum('total_amount', {
      where: { payment_status: { [Op.in]: ['paid', 'late'] } },
      include: [
        { model: Renter, required: true, include: [includeRoomWithBuilding] },
        { model: BillTypes, as: 'BillType_dash', where: { type_name: 'ค่าเช่ารายเดือน' } }
      ]
    });

    const incomeByMonthRaw = await BillsNotifications.findAll({
      attributes: [
        [fn('MONTH', col('BillsNotifications.created_at')), 'month'],
        [fn('SUM', col('total_amount')), 'total']
      ],
      where: { payment_status: { [Op.in]: ['paid', 'late'] } },
      include: [
        { model: Renter, required: true, include: [includeRoomWithBuilding] },
        { model: BillTypes, as: 'BillType_dash', where: { type_name: 'ค่าเช่ารายเดือน' } }
      ],
      group: ['month'],
      order: [[fn('MONTH', col('BillsNotifications.created_at')), 'ASC']]
    });

    const incomeByMonth = {};
    incomeByMonthRaw.forEach(item => {
      const month = item.dataValues.month;
      const total = parseFloat(item.dataValues.total);
      incomeByMonth[month] = total;
    });

    const urgentIssuesCount = await IssuesReport.count({
      where: { urgent_issue: true },
      include: [{ model: Renter, required: true, include: [includeRoomWithBuilding] }]
    });

    const normalIssuesCount = await IssuesReport.count({
      where: { urgent_issue: false },
      include: [{ model: Renter, required: true, include: [includeRoomWithBuilding] }]
    });

    const repairTypeCountsRaw = await RepairRequest.findAll({
      include: [
        { model: Renter, required: true, include: [includeRoomWithBuilding] },
        { model: RepairType, as: 'RepairType_dash', attributes: ['type_repair_name'] }
      ],
      attributes: ['type_repair_id', [fn('COUNT', col('RepairRequest.id')), 'count']],
      group: ['type_repair_id', 'RepairType_dash.type_repair_name']
    });

    const repairTypeMap = {};
    repairTypeCountsRaw.forEach(item => {
      repairTypeMap[item.RepairType_dash.type_repair_name] = parseInt(item.dataValues.count);
    });

    const repairStatusCountsRaw = await RepairRequest.findAll({
      include: [{ model: Renter, required: true, include: [includeRoomWithBuilding] }],
      attributes: ['status', [fn('COUNT', col('RepairRequest.id')), 'count']],
      group: ['status']
    });

    const repairStatusMap = {};
    repairStatusCountsRaw.forEach(item => {
      repairStatusMap[item.status] = parseInt(item.dataValues.count);
    });

    const totalRepair = await RepairRequest.count({
      include: [{ model: Renter, required: true, include: [includeRoomWithBuilding] }]
    });

    const totalAnnouncements = await Announcements.count({
      where: hasCommunityFilter ? { community_id } : {}
    });

    const seenAnnouncements = await Announcements.count({
      where: hasCommunityFilter ? { community_id } : {},
      include: [{ model: AnnouncementRecipients, where: { is_read: true }, required: true }]
    });

    const unseenAnnouncements = totalAnnouncements - seenAnnouncements;

    return res.status(200).json({
      status_code: 8000,
      data: {
        totalRoom,
        availableRoom,
        unavailableRoom,
        totalRenter,
        activeRenter,
        genderRatio: { male: maleCount, female: femaleCount },
        totalIssue,
        issueStatusCounts,
        issueTypesCount: { urgent: urgentIssuesCount, normal: normalIssuesCount },
        bill: {
          total_bill: totalBill,
          bill_type: billTypeMap,
          bill_status: billStatusCounts,
          income_from_rent: incomeFromRentBills || 0,
          income_by_month: incomeByMonth
        },
        repair: {
          repair_req_total: totalRepair,
          type: repairTypeMap,
          status: repairStatusMap
        },
        announcements: {
          total: totalAnnouncements,
          seen: seenAnnouncements,
          unseen: unseenAnnouncements
        }
      }
    });
  } catch (error) {
    console.error('[Dashboard Error]', error);
    return res.status(500).json({
      status_code: 5000,
      message: 'เกิดข้อผิดพลาดระหว่างการดึงข้อมูล Dashboard',
      error: error.message
    });
  }
};



  
