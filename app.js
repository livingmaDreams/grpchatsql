const express = require('express');
const app = express();

const bp = require('body-parser');
app.use(bp.json());
app.use(bp.urlencoded({ extended:true}));

const dotenv = require('dotenv');
dotenv.config();

const cors = require('cors');
app.use(cors({
    origin:"http://13.55.186.26",
    methods: ['GET','POST']
}));

const path = require('path');
app.use(express.static(path.join(__dirname,'public')));


const signUpRouter = require('./routes/signup');
app.use('/signup',signUpRouter);

const loginRouter = require('./routes/login');
app.use('/login',loginRouter);

const forgotpasswordRouter = require('./routes/forgotpassword.js');
app.use('/forgotpassword',forgotpasswordRouter);

const multer  = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const homeRouter = require('./routes/home');
app.use('/home',upload.single('file'),homeRouter);

const User = require('./models/user');
const Member = require('./models/member');
const Group = require('./models/group');
const Message = require('./models/message');
const Forgotpassword = require('./models/forgotpassword');

User.belongsToMany(Group,{ through: Member});
Group.belongsToMany(User,{through: Member});

Message.belongsTo(User);
User.hasMany(Message);

Message.belongsTo(Group)
Group.hasMany(Message);


User.hasMany(Forgotpassword);
Forgotpassword.belongsTo(User);

const sequelize = require('./util/database');

sequelize
.sync()
.then(()=> app.listen(3000))
.catch(err => console.log(err));

