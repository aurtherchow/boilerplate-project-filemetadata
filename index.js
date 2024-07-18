var express = require('express');
var cors = require('cors');
require('dotenv').config()
var app = express();
const bodyParser = require('body-parser');
const { connectDB, defineModel, addNewRecord, findByFields, findById, findByIdAndInsert } = require('./mongo/dbCommon');
const fileModel = require('./mongo/file');
const multer = require('multer');
const { DateTime } = require('luxon');
const path = require('path');
const fs = require('fs');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

connectDB(process.env.MONGO_URI);

const logRequestDetails = (req, res, next) => {
  if (req.method === 'POST') {
    console.log('--- Incoming POST Request ---');
    console.log('URL:', req.originalUrl);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Body:', JSON.stringify(res.body, null, 2));
    console.log('-----------------------------');
  

    const originalSend = res.send;
    res.send = function (body) {
      console.log('--- Outgoing Response ---');
      console.log('Status Code:', res.statusCode);
      console.log('Body:', body);
      originalSend.apply(res, arguments);
  };
}
  next();
};

app.use(logRequestDetails);


app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


const getCurrentDateFolder = () => {
  return DateTime.now().toFormat('yyyy-MM-dd');
};

// Set up storage options for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const currentDateFolder = getCurrentDateFolder();
    const uploadPath = path.join(__dirname, 'uploads', currentDateFolder);
    
    // Create the folder if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

app.route('/api/fileanalyse')
   .post(upload.single('upfile'), (req, res) => {
     const fileData = {
       name: req.file.filename,
       type: req.file.mimetype,
       size: req.file.size
     };

     addNewRecord(fileModel, fileData)
       .then(savedFile => {
         res.json({
           name: savedFile.name,
           type: savedFile.type,
           size: savedFile.size
         });
       })
       .catch(err => {
         console.error('Error saving file information:', err);
         res.status(500).json({ message: 'Server error', error: err });
       });
   });


const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});
