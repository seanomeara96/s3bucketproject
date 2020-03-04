const express = require('express'),
app = express(),
dotenv = require('dotenv'),
AWS = require('aws-sdk')
dotenv.config()
const mongodb = require('mongodb')
AWS.config.update({
    accessKeyId: process.env.AWSACCESSKEYID,
    secretAccessKey: process.env.AWSSECRETKEY
})
const port = process.env.PORT || 3000
let s3 = new AWS.S3()
app.use(express.static('views'))
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.get('/',(req,res)=>{
    res.render('index.html')
})
app.post('/store',(req,res)=>{
    let params = {
        Bucket: process.env.BUCKET,
        Body: req.body.picture,
        Key: req.body.picture
    }
    s3.upload(params,(err,data)=>{
        if(err){
            console.log(err)
        }
        if(data){
            console.log('uploaded in', data.Location)
        }
    })
})
mongodb.connect(process.env.CONNECTIONSTRING,{ useUnifiedTopology: true }).then(()=>{
    console.log('connected')
    app.listen(port,()=>{
        console.log('app is running on ', port)
    })
}).catch((err)=>{console.log(err)})