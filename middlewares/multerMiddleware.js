const multer = require("multer");

module.exports = (folderName) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, `media/${folderName}`)
    },
    filename: (req, file, cb) => {
      cb(null, `f_${file.fieldname}_${Math.random() * 2563555}_${Date.now()}_${file.originalname}`);
    }
  });

  return multer({ storage });
}