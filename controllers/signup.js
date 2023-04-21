const path = require('path');
const bcrypt = require('bcrypt');

exports.getSignUpPage = (req,res,next) => {
    res.status(200).sendFile(path.join(__dirname,'../views/signup.html'));
}

const User = require('../models/user');

exports.postSignUp = (req,res,next) =>{
    const name = req.body.name;
    const mail = req.body.mail;
    const phone = req.body.phone;
    const password = req.body.password;
 
    try{
        bcrypt.hash(password,10,async(err,hash) =>{
            const [data,flag] = await User.findOrCreate({
                where:{mail:mail},
                defaults:{
                    name:name,
                    mail: mail,
                    phone:phone,
                    password:hash ,
                    active:'false'                  
                }
            })

            if(flag)    
            res.status(201).json({SignupStatus:'New User Created'})
            else
            res.status(200).json({SignupStatus:'User already Exists'})
        })
    }
    catch(err){
        res.status(500).json({SignupStatus:'failure'})
    }
   

}