const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const fs= require('fs');
const fileUpload = require('express-fileupload');

const app = express()
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('order'));
app.use(fileUpload());

const port = 5000

app.get('/', (req, res) => {
  res.send('Hello World!')
})


const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.scmea.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true ,useUnifiedTopology: true });
client.connect(err => {
  const ordercollection = client.db("agency").collection("order");
  const admincollection = client.db("agency").collection("admin");
  const reviewcollection = client.db("agency").collection("review");
  const servicecollection = client.db("agency").collection("service");

  app.post('/addreview',(req,res) => {
    const adddata = req.body;
    reviewcollection.insertOne(adddata)
    .then(result=>{
      res.send("result")

    })
  })

  app.post('/addadmin',(req,res) => {
    const adddata = req.body;
    admincollection.insertOne(adddata)
    .then(result=>{
      res.send("result")

    })
  })

  app.post('/addorder', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const description = req.body.description;
    const price = req.body.price;

    console.log(name , email , file);
    const newImg = file.data;
    
    const encImg = newImg.toString('base64');
    

    var image = {
        contentType: file.mimetype,
        size: file.size,
        img: Buffer.from(encImg, 'base64')
    };

    ordercollection.insertOne({ name, email, description, price , image })
        .then(result => {
            res.send(result.insertedCount > 0);
        })
})
app.get('/readOrder',(req,res) => {
    ordercollection.find({email:req.query.email})
    .toArray((err , documents)=>{
      res.send(documents)
    })
  })
  app.get('/readallservice',(req,res) => {
    ordercollection.find({})
    .toArray((err , documents)=>{
      res.send(documents)
    })
  })

  app.get('/homeserviceshow',(req,res) => {
    servicecollection.find({}).limit(4)
    .toArray((err , documents)=>{
      res.send(documents)
    })
  })

  app.get('/readreview',(req,res) => {
    reviewcollection.find({}).limit(4)
    .toArray((err , documents)=>{
      res.send(documents)
    })
  })

  app.post('/isAdmin', (req, res) => {
    const email = req.body.email;
    admincollection.find({ email: email })
        .toArray((err, admin) => {
            res.send(admin.length > 0);
        })
})

app.post('/addservice', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const description = req.body.description;

    const newImg = file.data;
    
    const encImg = newImg.toString('base64');
    

    var image = {
        contentType: file.mimetype,
        size: file.size,
        img: Buffer.from(encImg, 'base64')
    };

    servicecollection.insertOne({ name, description,image })
        .then(result => {
            res.send(result.insertedCount > 0);
        })
})
});

app.listen(process.env.PORT || port)