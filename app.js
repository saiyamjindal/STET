var express = require('express')
var app = express()
app.set("view engine", "ejs")
app.use(express.static('public'))
var fs = require('fs')
var path=require('path')
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
const nodemailer = require('nodemailer');
var multer= require('multer')

var storage = multer.diskStorage({
   destination: "./public/uploads/",
   filename: (req,file,cb)=>{
       cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname));
   }
});
var singleupload = multer({ storage: storage }).single('file')

app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 1160000 } }))
const secret = 'abcdefg';

const uploadSchema = new Schema({
    username: String,
    email: {
        type: String,
        unique: true
    },
    password: String,
    image: String,

});
const upload = mongoose.model('upload', uploadSchema);

const TaskSchema = new Schema({
    candname: String,
    candadd: String,
    Fname: String,
    Dob: String,
    Gender: String,
    quemed: String,
    Coe: String,
    email: {
        type: String,
        unique: true
    },
    password: String,
    signature: String
});
const Task = mongoose.model('Task', TaskSchema);

app.get('/', (req, res) => {
    res.render("index")
})

app.get('/404', (req, res) => {
    res.send("404 error")
})

app.get('/login', (req, res) => {
    res.render('loginsih')
})
app.get('/syllabus', (req, res) => {
    res.render('syllabus')
})
app.get('/contact_us', (req, res) => {
    res.render('contact')
})
app.get('/FAQs', (req, res) => {
    res.render('faq2')
})
app.get('/results', (req, res) => {
    res.render('result')
})
app.get('/hindi',(req,res)=>{
    res.render('hindi')
})
app.post('/login', urlencodedParser, (req, res) => {
    Task.findOne({ password: req.body.password, email: req.body.email }, function (err, doc) {
        if (err) {
            console.log(err, 'error')
            res.redirect('/')
            return
        }
        if (_.isEmpty(doc)) {
            res.render('loginsih', { message: "Please check email/password" })
        } else {
            req.session.task = doc
            res.redirect('/login/welcome')
        }
    })

})

app.get('/register', (req, res) => {
    res.render('form')
})
app.post('/register',singleupload, urlencodedParser, (req, res) => {
    let newTask = new Task();
    newTask.candname = req.body.candname;
    newTask.candadd = req.body.candadd;
    newTask.Fname = req.body.Fname;
    newTask.Dob = req.body.Dob;
    newTask.Gender = req.body.Gender;
    newTask.quemed = req.body.quemed;
    newTask.Coe = req.body.Coe;
    newTask.email = req.body.email;
    newTask.password = req.body.password;
    newTask.signature= req.file.filename;
    newTask.save(function (err) {
        if (err) {
            console.log(err, 'error')
            return
        }
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'examstet@gmail.com',
                pass: '$t@t1234'
            }
        });
        let mailOptions = {
            from: 'examstet@gmail.com',
            to: req.body.email,
            subject: 'Successful Submission of Application Form (STET-2020)',
            text: 'Dear candidate,\n\nYour Application form for STET-2020 has been submitted successfully.\n\nPlease visit the website for further updates.\n\nIt is an auto generated mail so please do not reply.\n\n-Regards, STET-2020\n Govt. of Sikkim',    
        };
        transporter.sendMail(mailOptions, function (err, data) {
            if (err) {
                console.log('Error Occurs');
            } else {
                console.log('Email Sent');


            }

        });

        res.redirect('/')

    });
})
const checkLogIn = (req, res, next) => {
    if (req.session.task) {
        next();
    } else {
        res.redirect('/404')
    }
}
app.get('/login/welcome', checkLogIn, (req, res) => {
    res.render('user', { user: req.session.task })
})

app.post('/user', urlencodedParser, (req, res) => {
    res.redirect('/')
})
app.get('/login/welcome/admitcard',singleupload, (req, res) => {
    ses = req.session.task
    Task.findOne({ email: ses.email }, function (err, docs) {
        if (err) {
            console.log(err, 'error')
            return
        }
        upload.findOne({ email: ses.email }, function (err, data) {
            if (err) {
                console.log(err, 'error')
                return
            }
            res.render('admitcard', { tasks: docs, uploads: data, edit: false })
        });

    });

})


app.listen(3000, () => {
    console.log("Server is running")
})