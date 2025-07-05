const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = file.originalname.split(".").pop().toLowerCase();

    let prefix = "";

    // ตรวจสอบนามสกุลไฟล์และตั้งชื่อใหม่
    if (["jpg", "jpeg", "png"].includes(fileExtension)) {
      prefix = "img"; // ถ้าเป็นไฟล์รูปภาพ
    } else if (fileExtension === "pdf") {
      prefix = "file_doc"; // ถ้าเป็นไฟล์เอกสาร PDF
    } else {
      prefix = "file"; // กรณีอื่นๆ ที่ไม่ใช่ jpg, jpeg, png, pdf
    }

    cb(null, prefix + "-" + uniqueSuffix + "." + fileExtension);
  },
});

exports.upload = (fieldName) => {
  return multer({ storage: storage }).single(fieldName);
};

exports.upload_img_commu = () => {
  return multer({ storage: storage }).fields([
    { name: "img_commu1", maxCount: 1 },
    { name: "img_commu2", maxCount: 1 },
    { name: "img_commu3", maxCount: 1 },
  ]);
};
exports.upload_multi_file = () => {
  return multer({ storage: storage }).fields([
    { name: "banner_announcement", maxCount: 1 },
    { name: "img_announcement", maxCount: 1 },
    { name: "file_announcement", maxCount: 1 },
  ]);
};

exports.upload_img_issue = () => {
  return multer({ storage: storage }).fields([
      { name: "image_1", maxCount: 1 },
      { name: "image_2", maxCount: 1 },
      { name: "image_3", maxCount: 1 },
      { name: "image_4", maxCount: 1 },
      { name: "image_5", maxCount: 1 },
    ]);
};
exports.upload_photo_issue_repair = () => {
  return multer({ storage: storage }).fields([
      { name: "photo_url", maxCount: 1 },
      { name: "photo_url2", maxCount: 1 },
      { name: "photo_url3", maxCount: 1 },
      { name: "photo_url4", maxCount: 1 },
      { name: "photo_url5", maxCount: 1 },
    ]);
};

// exports.upload_img_issue = multer({
//   storage: storage,
// }).fields([
//   { name: "image_1", maxCount: 1 },
//   { name: "image_2", maxCount: 1 },
//   { name: "image_3", maxCount: 1 },
//   { name: "image_4", maxCount: 1 },
//   { name: "image_5", maxCount: 1 },
// ]);
