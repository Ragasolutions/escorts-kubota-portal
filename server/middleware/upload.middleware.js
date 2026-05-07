const multer = require('multer');

const storage = multer.memoryStorage();
const excelStorage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const excelFilter = (req, file, cb) => {
  const allowed = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'application/csv',
  ]
  if (allowed.includes(file.mimetype) || file.originalname.match(/\.(xlsx|xls|csv)$/)) {
    cb(null, true)
  } else {
    cb(new Error('Only Excel or CSV files are allowed'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

const uploadExcel = multer({
  storage: excelStorage,
  fileFilter: excelFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
})



exports.uploadSingle = upload.single('image');
exports.uploadMultiple = upload.array('images', 5);
exports.uploadExcelFile = uploadExcel.single('image')
