const path = require('path');

exports.getHomePage = (req,res,next) => {
  res.status(200).sendFile(path.join(__dirname,'../views/home.html'));
};

const User = require('../models/user');
const { Op } = require("sequelize");
const aws = require('aws-sdk');


function uploadToS3(data,filename){
   
  const BUCKET_NAME=process.env.BUCKET_NAME;
  const IAM_USER_KEY=process.env.IAM_USER_KEY;
  const IAM_USER_SECRET=process.env.IAM_USER_SECRET;

  let s3Bucket = new aws.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET
  });


  var params = {
    Bucket: BUCKET_NAME,
    Key:filename,
    Body:data.buffer,
    ACL: 'public-read'
  };

  return new Promise((res,rej) =>{
      s3Bucket.upload(params,(err,s3res) =>{
          if(err)
          rej(err)
          else
          res(s3res.Location);
      });
  })

}


exports.postMessage = async (req,res,next) =>{
  const grpName = req.body.grpName;
  let msg = req.body.msg;
  const id = req.user.id;
  let file;
  let fileUrl;
  try{
  if(req.file){
    let filename;
   file = req.file.originalname;
  if(file.includes('.jpg'))
     filename = `${id}/${new Date()}.jpg`;
  else if(file.includes('.pdf'))
    filename = `${id}/${new Date()}.pdf`;
    fileUrl = await uploadToS3(req.file,filename);
    msg = fileUrl;
}   
  const grp = await Group.findOne({where:{name:grpName}});
    await grp.createMessage({message:msg,userId:id});
   res.status(200).json({status:'success',url:fileUrl})
  }
  catch(err){
    console.log(err);
    res.status(500).json({status:'failure'})};
}

exports.getGroups = (req,res,next) =>{
  const group =[];
  req.user
  .getGroups()
  .then(grp =>{
    for(let i of grp){
      const obj = {};
      obj.admin = i.member.admin;
      obj.name = i.name
      group.push(obj);
    }
    res.status(200).json({groups:group})
  })
  .catch(err => console.log(err))
}

exports.getAllUsers = async (req,res,next) =>{
  const userList =[];
  try{
  const users = await User.findAll();
  for(let i of users)
  userList.push(i.name);
  res.status(200).json({users:userList});
  }
  catch(err){
    res.status(500).json({status:'failed'});
  }
}

exports.getGroupMsg = async(req,res,next) =>{
  const grpName = req.query.groupname;
  let msgCount = req.query.msgcount;

  const grpMsg=[];
  try{
  const grp = await Group.findOne({where:{name:grpName}})
    const msg = await grp.getMessages({where:{id:{[Op.gt]:msgCount}}});
   if(msg != ''){
   msgCount = msg[msg.length-1].id;
   for(let i of msg){
    const obj={};
    const user = await User.findOne({where:{id:i.userId}});
    obj.name = user.name;
    obj.message = i.message;
     grpMsg.push(obj);
   }
   res.status(200).json({Msg:grpMsg,msgCount:msgCount})
  }
  else
  res.status(200).json({message: '',msgCount:msgCount});

  }
  catch(err){
    console.log(err)
    res.status(500).json({status:'failed',msgCount:msgCount});
  }
}

const Group = require('../models/group');

exports.createGroup = async (req,res,next) =>{
 const grpName = req.body.grpName;
 const id = req.user.id;
 const usr = req.body.user;
try{
const grp = await req.user.createGroup({name:grpName,createdby:id},{through:{admin:'true'}});

for(let i of usr){
  const usr = await User.findOne({where:{name:i}})
   await grp.addUser(usr,{through:{admin:'false'}})
}  
res.status(200).json({status:'Grp has been created'})
}
catch(err){
   res.status(500).json({status:'Failed'});
 }
}

exports.updateGroup = async (req,res,next) =>{
  const grpName = req.body.name;
  const usr = req.body.user;
  const admin = req.body.admin;
 try{
 const grp = await Group.findOne({where:{name:grpName}});
 const allUser = await grp.getUsers();
 const allUsr = [];
 for(let i of allUser)
  allUsr.push(i.name);

 for(let i of usr){
   const usr = await User.findOne({where:{name:i}})
   if(!allUser.includes(i)){
   if(admin.includes(i))
    await grp.addUser(usr,{through:{admin:'true'}})
    else
    await grp.addUser(usr,{through:{admin:'false'}})
   }
  }
  for(let i of allUsr){
    const user = await User.findOne({where:{name:i}})
    if(!usr.includes(i))
    await grp.removeUser(user.id);
  }
 res.status(200).json({status:'Grp has been created'})
 }
 catch(err){
    res.status(500).json({status:'Failed'});
  }
 }

exports.getAllUserGroup = async (req,res,next) =>{
  const grpName = req.query.grpname;
  const userList =[];
  const adminList = [];
  const userAllList = [];
  try{
  const grp = await Group.findOne({where:{name:grpName}});
  const allUser = await grp.getUsers();
  const user = await User.findAll();
  const admin = await grp.getUsers({through:{where:{admin:'true'}}});
  for(let i of allUser)
  userList.push(i.name);
  for(let i of admin)
  adminList.push(i.name);
  for(let i of user)
  userAllList.push(i.name);
  res.status(200).json({admin:adminList, users:userList,allusers: userAllList});
  }
  catch(err){
    res.status(500).json({status:'failed'});
  }

}

exports.logOut = (req,res,next) =>{

  req.user
  .update({active:'false'})
  .then(data => res.status(200).json({status:'Logout success'}))
  .catch(err => res.status(500).json({status:'Logout failure'}));
}