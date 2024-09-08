'use strict';

const { verify } = require('jsonwebtoken');
const { findUser } = require('../models/user');
const { STATUS_CODE } = require('../utils/constants');
let storedUserId = null;


module.exports = (roles) => {
    return (req, res, next) => {
        const token = req.header('token') ;
        if (!token) return next({
            statusCode: STATUS_CODE.UNAUTHORIZED,
            message: 'unauthorized request!'
        });

        verify(token, process.env.JWT_SECRET, async function (err, decoded) {
            if (err) return next(new Error("Invalid Token"))
            else {
                const userObj = await findUser({ _id: decoded.id });
                if (!userObj) return next(new Error("User not found!"));
                if (!userObj.isActive) return next({
                    statusCode: STATUS_CODE.FORBIDDEN,
                    message: 'Your account is deactivated, please contact admin',
                });

                req.user = decoded;
                console.log('this is role',roles)
                // if (!roles.includes(req.user.role)) return next({
                //     data:{ status: false},
                //     statusCode: STATUS_CODE.UNAUTHORIZED,
                //     message: 'Unauthorized access!'
                // });

                next();
            }
        });
    }
}
