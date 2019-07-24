

const aws = require('aws-sdk');
const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const bucket = process.env.BUCKET

const app = express();

  var options = {
    apiVersion: 'v1', // default
    endpoint: 'http://127.0.0.1:8100', // default
  };
  
  // get new instance of the client
  var vault = require("node-vault")(options);
  
  vault.write('aws/sts/s3creds')
  .then((result) => {
    const roleId = result[0].data.access_key;
    const secretId = result[1].data.secret_key;

    const accessparams = {
      accessKeyId: result[0].data.access_key,
      secretAccessKey: result[1].data.secret_key,
      sessionToken: result[2].data.security_token,
    };
    // Set S3 endpoint
const s3Endpoint = new aws.Endpoint('s3.eu-west-2.amazonaws.com');
const s3 = new aws.S3({
  accessparams: accessparams,
  endpoint: s3Endpoint
});

const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: bucket,
      acl: 'public-read',
      key: function (request, file, cb) {
        console.log(file);
        cb(null, file.originalname);
      }
    })
  }).array('upload', 1);

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


app.use(express.static('public'));

app.get('/', function (request, response) {
    response.sendFile(__dirname + '/public/index.html');
  });
  
  app.get("/success", function (request, response) {
    response.sendFile(__dirname + '/public/success.html');
  });
  
  app.get("/error", function (request, response) {
    response.sendFile(__dirname + '/public/error.html');
  });

  app.listen(8080, function () {
    console.log('Server listening on port 8080.');
  });


   })
