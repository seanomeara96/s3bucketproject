const express = require('express'),
app = express(),
dotenv = require('dotenv'),
AWS = require('aws-sdk'),
path = require('path')
dotenv.config()
const MongoClient = require('mongodb').MongoClient;
const uri = process.env.CONNECTIONSTRING
const client = new MongoClient(uri, { useUnifiedTopology: true, connectTimeoutMS:60000 });
const multer = require('multer')
const multerS3 = require('multer-s3')
AWS.config.update({
    accessKeyId: process.env.AWSACCESSKEYID,
    secretAccessKey: process.env.AWSSECRETKEY
})
const port = process.env.PORT || 3000
let s3 = new AWS.S3()
app.use(express.static('views'))
app.use(express.urlencoded({extended: false}))
app.use(express.json())
let upload = multer({
    storage:multerS3({
        s3:s3,
        bucket:process.env.BUCKET,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req, file, cb)=>{
            cb(null, Date.now().toString()+file.originalname)
          },
          acl: 'public-read'
    })
})
//'IMG_20190509_215112_053.jpg'
app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname+'/views/index.html'))
})
app.get('/thanks',(req,res)=>{
    res.sendFile(path.join(__dirname+'/views/thanks.html'))
})
app.get('/sorry',(req,res)=>{
    res.sendFile(path.join(__dirname+'/views/sorry.html'))
})


app.post('/store',upload.single('picture'),async (req,res)=>{
    console.log(req.file)
    await client.connect().then(async ()=>{
        let collection = await client.db("Images").collection("Images")
        collection.insertOne({"imageLocation":req.file.location})
        .then((i)=>{
            console.log("stored in database at imageLocation: ", i.ops[0].imageLocation)
        })
        .then(()=>{
            client.close()
        })
    }).catch((err)=>{console.log(err)})
    res.redirect('/thanks')
})


app.listen(port,()=>{
    console.log('app is running on ', port)
}) 