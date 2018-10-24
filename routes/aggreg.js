var fs = require('fs');
var express = require('express');
var router = express.Router();
var multer = require('multer'); //middleware for handling multipart/form-data
// var upload = multer({ dest: 'uploads/' });
var storage = multer.memoryStorage()
var upload = multer({ storage: storage }); // to be changed to the above in future versions
var aggreg = require('../aggregator/aggregator')

const path = require('path');

router.post('/', upload.any(), function(req, res, next) {
  // retrieving the 2 files
  console.log(".. retrieving files");
  var filesToMerge = [req.files[0].buffer.toString(),req.files[1].buffer.toString()];
  console.log("OK files retrieved");

  if (req.files === null){
    new Error("no files transmitted");
  }
  console.log(".. merging calendars");
  var mergedCal = aggreg.merger(filesToMerge);
  console.log("OK calendars merged");

  console.log(".. converting calendar to file")
  fs.writeFileSync('fileToSend.ics', mergedCal);
  console.log('OK file created');

  console.log(".. sending back file");
  res.download(path.join(__dirname, "../fileToSend.ics"), err => {
    if (err) {
      console.log('Error sending the file', err);
      res.end();
    }
    else {
      console.log("OK file sent");
      // TODO: delete the file once sent: fs.unlink?
    }
  });

});

module.exports = router;
