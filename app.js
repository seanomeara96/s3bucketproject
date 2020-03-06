const express = require('express'),
app = express(),
dotenv = require('dotenv'),
AWS = require('aws-sdk'),
path = require('path')
dotenv.config(()=>{
    console.log("configged")
})
const MongoClient = require('mongodb').MongoClient;
const uri = process.env.CONNECTIONSTRING
const client = new MongoClient(uri, { useUnifiedTopology: true, connectTimeoutMS:60000 });

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
    res.sendFile(path.join(__dirname+'/views/index.html'))
})
app.get('/thanks',(req,res)=>{
    res.sendFile(path.join(__dirname+'/views/thanks.html'))
})
app.get('/sorry',(req,res)=>{
    res.sendFile(path.join(__dirname+'/views/sorry.html'))
})
app.post('/store',(req,res)=>{
    let params = {
        Bucket: process.env.BUCKET,
        Body: req.body.picture,
        Key: req.body.picture
    }
    s3.upload(params,async (err,data)=>{
        if(err){
            console.log(err)
            res.redirect('/sorry')
        }
        if(data){
            console.log('img can be found at', data.Location)
            let toStore = {
                "imageLocation":data.Location
            }
            await client.connect().then(async ()=>{
                let collection = await client.db("Images").collection("Images")
                collection.insertOne(toStore).then((i)=>{
                    console.log("stored in mongodb at imageLocation: ",i.ops[0].imageLocation)
                    client.close()
                })
              }).catch(err => console.log(err))
              
            res.redirect('/thanks')
        }
    })
})

app.listen(port,()=>{
    console.log('app is running on ', port)
}) 