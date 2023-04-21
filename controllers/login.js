const path = require('path');


exports.getLoginPage = (req,res,next) => {
  res.status(200).sendFile(path.join(__dirname,'../views/login.html'));
};

const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

function generateToken(id){
    return jwt.sign({userid:id},process.env.JWT_TOKEN);
}

exports.postLogin = async (req,res,next) => {

    const mail = req.body.mail;
    const password = req.body.password;

try{
    const data = await User.findAll({where:{mail:mail}});
    
    bcrypt.compare(password,data[0].password,async (err,result)=>{
           if(err)
              res.status(500).json({loginStatus:'something went wrong'});
            if(result === false)
            res.status(401).json({loginStatus:'wrongpassword'});
            else{
              await data[0].update({active:'true'});
              res.status(200).json({LoginStatus:'userfound',token: generateToken(data[0].id),userName: data[0].name});
            }
            
        })        
      }
    catch(err){
        res.status(404).json({loginStatus:'usernotfound'})
    }
};