var express = require('express')
var app = express()

app.set("view engine", "ejs")
app.use(express.static(__dirname+"./public/"));
//app.use('/static', express.static('public'))

var fs = require('fs')
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/newdb', { useNewUrlParser: true });
var session = require('express-session')
var _ = require("lodash")
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const crypto = require('crypto');

var bodyParser = require("body-parser")
// var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 1160000 } }))
const secret = 'abcdefg';
var multer = require('multer')

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
        // should be a very very random string
        let ext = file.originalname.split('.')[1]
        let filename = file.fieldname + '-' + Date.now() + '.' + ext
        cb(null, filename)
    }
})


var singleupload = multer({ storage: storage }).single('file')

var multipleupload = multer({ storage: storage }).array('file')
const uploadSchema = new Schema({
    username:String,
    email: {
        type: String,
        unique: true
    },
    password: String,
    image:String,
   // image1:String
});
const upload = mongoose.model('upload', uploadSchema);
app.get('/',(req,res)=>{
    res.render('digilocker')
})
app.get('/register', (req, res) => {
    res.render('registersih')
})
app.post('/register', urlencodedParser, (req, res) => {
    let newupload = new upload();
    newupload.username = req.body.username;
    newupload.email = req.body.email;
    newupload.password = req.body.password;  
    newupload.save(function (err) {
        if (err) {
            console.log(err, 'error')
            return
        }
        res.redirect('/')

    });
})
app.get('/login', (req, res) => {
    res.render('loginsih')
})

app.post('/login', urlencodedParser, (req, res) => {
    upload.findOne({ password: req.body.password, email: req.body.email }, function (err, doc) {
        if (err) {
            console.log(err, 'error')
            res.redirect('/')
            return
        }
        if (_.isEmpty(doc)) {
            res.render('loginsih', { message: "Please check email/password" })
        } else {
            req.session.upload= doc
            res.redirect('/login/ind')
        }
    })

})
      
app.get('/login/ind', (req, res) => {
    res.render('ind', { fileUploaded: false })
})
 
app.post('/login/ind', singleupload, (req, res) => {
    ses = req.session.upload
    upload.findOne({ email:ses.email}, function (err, docs) {
        if (err) {
            console.log(err, 'error')
            return
        }
        docs.image = req.file.filename
       // res.render('ind', { fileUploaded: true })
          docs.save(function (err) {
            if (err) {
                console.log(err, 'error')
                return
            }
            res.render('ind', { fileUploaded: true })
        });  

    });

   /* imageFile = req.file.filename
    
    
    let newupload = new upload();
    newupload.nm = req.body.nm;
    newupload.email = req.body.email;
    newupload.password = req.body.password;
    newupload.image = imageFile;
    newupload.save(function (err) {
        if (err) {
            console.log(err, 'error')
            return
        }
        res.render('ind', { fileUploaded: true })
    });  */
   
})

/*app.post('/login/multiple', multipleupload, (req, res) => {
    
  imageFile = req.file.filename
    
    
    
    newupload.save(function (err) {
        if (err) {
            console.log(err, 'error')
            return
        }
        res.render('ind', { fileUploaded: true })
    });  
})*/
app.get('/login/multiple', multipleupload, (req, res) => {
    res.render('ind', { fileUploaded: true })
})
app.post('/login/multiple', multipleupload, (req, res) => {
    res.render('ind', { fileUploaded: true })
})
app.listen(3001, () => {
    console.log("Server is running")
})