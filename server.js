const aws = require('aws-sdk');
const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const bucket = 'sr-vault-demo'
​
const app = express();
​
  var options = {
    apiVersion: 'v1', // default
    endpoint: 'http://127.0.0.1:8100', // default
  };
  
  // get new instance of the client
  var vault = require("node-vault")(options);
  
  vault.write('aws/sts/testrole1',{ lease: '10m' })
  .then((result) => {
    const roleId = result.data.access_key;
    const secretId = result.data.secret_key;
​
    // Set S3 endpoint
var creds = new aws.Credentials(result.data.access_key, result.data.secret_key, result.data.security_token);
console.log(creds);
const s3Endpoint = new aws.Endpoint('s3.eu-central-1.amazonaws.com');
const s3 = new aws.S3({
  credentials: creds,
  endpoint: s3Endpoint
});
​
const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: bucket,
     //acl: 'public-read',
      key: function (request, file, cb) {
        console.log(file);
        cb(null, file.originalname);
      }
    })
  }).array('upload', 1);
​
  app.post('/upload', function (request, response, next) {
    upload(request, response, function (error) {
      if (error) {
        console.log(error);
        return response.redirect("/error");
      }
      console.log('File uploaded successfully.');
      response.redirect("/success");
    });
  });
​
​
app.use(express.static('public'));
​
app.get('/', function (request, response) {
    response.sendFile(__dirname + '/public/index.html');
  });
  
  app.get("/success", function (request, response) {
    response.sendFile(__dirname + '/public/success.html');
  });
  
  app.get("/error", function (request, response) {
    response.sendFile(__dirname + '/public/error.html');
  });
​
  app.listen(8080, function () {
    console.log('Server listening on port 8080.');
  });
​
​
   })