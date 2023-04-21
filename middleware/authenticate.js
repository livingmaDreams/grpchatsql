const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.authenticate = (req,res,next) => {
    try{
        const token = req.header('Authorization');
        const user = jwt.verify(token,process.env.JWT_TOKEN);
        User.findByPk(user.userid)
        .then(user => {
            req.user = user;
            next();
        })
    }
    catch(err){
        return res.status(401).json({status:false});
    }
}