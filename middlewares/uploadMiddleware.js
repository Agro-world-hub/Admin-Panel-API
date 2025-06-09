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
    // Allowed extensions
    const filetypes = /\.(csv|xlsx|xls)$/i;
    const extname = filetypes.test(path.extname(file.originalname));

    // Allowed MIME types
    const mimetypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/octet-stream",
    ];
    const mimetype = mimetypes.includes(file.mimetype);

    console.log("File validation:", {
      filename: file.originalname,
      extname: path.extname(file.originalname),
      mimetype: file.mimetype,
      extValid: extname,
      mimeValid: mimetype,
    });

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Only Excel/CSV files are allowed. Detected: ${file.mimetype}`
        )
      );
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

module.exports = upload;
