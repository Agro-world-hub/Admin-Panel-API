const multer = require("multer");
const path = require("path");

// Set up memory storage engine
const storage = multer.memoryStorage();

// Set up file filter to allow only image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only images are allowed"));
  }
};

// Initialize multer with the memory storage engine and file filter
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: function (req, file, cb) {
    // Allowed Excel/CSV extensions
    const excelFiletypes = /\.(csv|xlsx|xls)$/i;
    const isExcel = excelFiletypes.test(path.extname(file.originalname));

    // Allowed Excel MIME types
    const excelMimetypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/octet-stream",
    ];

    // Allowed image extensions
    const imageFiletypes = /\.(jpg|jpeg|png|gif)$/i;
    const isImage = imageFiletypes.test(path.extname(file.originalname));

    // Allowed image MIME types
    const imageMimetypes = ["image/jpeg", "image/png", "image/gif"];

    const isValid =
      (isExcel && excelMimetypes.includes(file.mimetype)) ||
      (isImage && imageMimetypes.includes(file.mimetype));

    if (isValid) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel/CSV or image files (JPG/PNG/GIF) are allowed."));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

module.exports = upload;
