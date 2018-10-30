var fs = require('fs');
var express = require('express');
var multer = require('multer'); // middleware for handling multipart/form-data
var aggreg = require('../aggregator/aggregator')
const path = require('path');
var rp = require('request-promise');

var router = express.Router();
var storage = multer.memoryStorage()
var upload = multer({ storage: storage }); // to be changed to the above in future versions

router.post('/', upload.any(), function (req, res, next) {
	var fileStr = '';
	// retrieving the files
	var filesToMerge = [];
	for (var i = 0; i < req.files.length; i++) {
    fileStr = req.files[i].buffer.toString();
		filesToMerge.push(fileStr);
	}

	// retrieving  the URLs
	var url = req.body['url'];
	fileStr = '';
	// retrieve the file from the URL
	asyncForEach(url, async urlStr => {
		await	rp(urlStr)
		.then(body => {
			fileStr = body;
			// add retrieved files to the array
			filesToMerge.push(fileStr)
		})
		.catch(err => {
			console.log('Error retrieving the url', err);
		})
	})
	.then(() => {
		var mergedCal = aggreg.merger(filesToMerge);

		fs.writeFileSync('fileToSend.ics', mergedCal);

		console.log('.. sending back file');
		res.download(path.join(__dirname, '../fileToSend.ics'), err => {
			if (err) {
				console.log('Error sending the file', err);
				res.end();
			} else {
				console.log('OK file sent');
				// TODO: delete the file once sent: fs.unlink?
			}
		});
	})
	.catch(err => {
		console.log('Error retrieving the url', err);
	});

	// rp(url[0])
	// .then(body => {
	// 	fileStr = body;
	// 	// add retrieved files to the array
	// 	filesToMerge.push(fileStr);
	// })
	// .catch(err => {
	// 	console.log('Error retrieving the url', err);
	// })
	// .finally(() => {
	// 	var mergedCal = aggreg.merger(filesToMerge);

	// 	fs.writeFileSync('fileToSend.ics', mergedCal);

	// 	console.log('.. sending back file');
	// 	res.download(path.join(__dirname, '../fileToSend.ics'), err => {
	// 		if (err) {
	// 			console.log('Error sending the file', err);
	// 			res.end();
	// 		} else {
	// 			console.log('OK file sent');
	// 			// TODO: delete the file once sent: fs.unlink?
	// 		}
	// 	});
	// });
});

module.exports = router;

// defining an async forEach function
async function asyncForEach (array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}
