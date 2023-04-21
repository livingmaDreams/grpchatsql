const User = require('../models/user.js');
const Forgotpassword = require('../models/forgotpassword');
const sgMail = require('@sendgrid/mail');
const uuid = require('uuid');
const bcrypt = require('bcrypt');

const path = require('path');

exports.getPage = (req,res,next) =>{
    res.sendFile(path.join(__dirname,`../views${req.originalUrl}.html`));
};

exports.getPasswordLink = async(req,res,next) =>{
  const mail = req.body.mail;
  
try{
  const id = uuid.v4();
  let current = new Date();
  current.setMinutes(current.getMinutes() + 2);
  const user = await User.findOne({where:{mail:mail}});
  if(user)
  await user.createForgotpassword({id:id,active:'true',expiresby:current});
  

  sgMail.setApiKey(process.env.SENDGRID_API);
  setTimeout(() =>{
    Forgotpassword.findOne({where:{id:id}})
    .then(user => {
       return user.update({active:'false'})
    }) 
    .catch(err => console.log(err));
  },120000);
 const msg = {
  to: mail, 
  from: 'deepi.sakthivel@outlook.com',
  subject: 'Reset Password Link',
  text: 'Click on this link to reset a password',
  html: `<a href='http://localhost:3000/forgotpassword/${id}'>Reset Password Link</a>`
}
await sgMail.send(msg);

res.status(200).json({Status:'true'});

}
catch(err){
  console.log(err)
    res.status(500).json({Status:'false'});
}
}

exports.getChangePwdPage = (req,res,next) =>{
  const id = req.params.id;
  
  Forgotpassword.findOne({where:{id:id}})
  .then(user =>{
    if(user.active == 'true')
    res.sendFile(path.join(__dirname,`../views/changepassword.html`)); 
    else
    res.sendFile(path.join(__dirname,`../views/expiredlink.html`));
  })
   
}

exports.postResetPassword = async (req,res,next) =>{
  const pwd = req.body.pwd;
  const id = req.body.id;

  try{
    const user = await Forgotpassword.findOne({where:{id:id}});
    const userid = user.userId;
    const mainUser = await User.findOne({where:{id:userid}})
    
    bcrypt.hash(pwd,10,async (err,hash) =>{
      await mainUser.update({password:hash});
    })
    res.status(201).json({passwordchanged: 'success'});
  }
  catch(err){
    res.status(500).json({passwordchanged: 'failure'});
  }
}

