const { Model, DataTypes, Sequelize } = require("sequelize");
const sequelize = new Sequelize("e2h_db", "root", "", {
  host: "localhost",
  dialect: "mysql",
  timezone: "+07:00",
  dialectOptions: {
    timezone: "+07:00",
    dateStrings: true,
    typeCast: true,
  },
});

class IssuesReport extends Model {}

IssuesReport.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    community_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Community",
        key: "id",
      },
    },
    renter_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Renter",
        key: "id",
      },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image_1: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    image_2: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    image_3: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    image_4: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    image_5: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    callback_phone: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "waiting_to_check",
        "pending",
        "in_progress",
        "completed",
        "rejected",
        "fail",
        "cancel"
      ),
      defaultValue: "waiting_to_check",
    },
    urgent_issue: {
      type: DataTypes.BOOLEAN(1),
      allowNull: true,
      defaultValue: 0,
    },
    pending_reason_by_admin: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    pending_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    pending_by_admin: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    in_progress_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    in_progress_by_admin: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completed_by_admin: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    reject_reason_by_admin: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    rejected_at: {
      type: DataTypes.DATE,
      allowNull: true,
      // defaultValue: DataTypes.NOW,
    },
    rejected_by_admin: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    cancelled_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cancelled_by_renter: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // createdAt: {
    //   type: DataTypes.DATE,
    //   allowNull: true,
    //   defaultValue: DataTypes.NOW,
    // },
    // updatedAt: {
    //   type: DataTypes.DATE,
    //   allowNull: true,
    //   defaultValue: DataTypes.NOW,
    // },
  },
  {
    sequelize,
    modelName: "IssuesReport",
    tableName: "issues_report", // ชื่อ table ในฐานข้อมูล
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    // underscored: true
  }
);

module.exports = IssuesReport;
