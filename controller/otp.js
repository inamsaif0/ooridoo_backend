'use strict';

const { deleteOTPs, addOTP, getOTP } = require('../models/otp');
const { findUser, updateUserById, generateToken } = require('../models/user');
const { generateResponse, parseBody, generateRandomOTP } = require('../utils');
const { STATUS_CODE } = require('../utils/constants');
const { sendEmail } = require('../utils/mailer');

exports.generateOTP = async (req, res, next) => {
    const { email } = parseBody(req.body);
    if (!email) return next({
        data: { status:false },
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: 'Email is required'
    })

    try {
        const user = await findUser({ email });
        if (!user) return next({
            data: { status:false },
            statusCode: STATUS_CODE.NOT_FOUND,
            message: 'User not found'
        });

        // delete all previous OTPs
        await deleteOTPs(email);

        const otpObj = await addOTP({
            email,
            otp: generateRandomOTP(),
        });

        // send email
        await sendEmail(email, "OTP", `Your OTP is ${otpObj.otp}`);
        generateResponse(otpObj, 'OTP resent successfully', res);
    } catch (error) {
        next(new Error(error.message));
    }
}

exports.verifyOTP = async (req, res, next) => {
    const { otp } = parseBody(req.body);
    if (!otp) next({
        status: false,
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: 'OTP is required'
    });

    try {
        const otpObj = await getOTP({ otp });
        if (!otpObj) return next({
            status: false,
            statusCode: STATUS_CODE.NOT_FOUND,
            message: 'Invalid OTP'
        });

        if (otpObj.isExpired()) return next({
            status: false,
            statusCode: STATUS_CODE.BAD_REQUEST,
            message: 'OTP expired'
        });

        const existingUser = await findUser({ email: otpObj.email });
        if (!existingUser) return next({
            status: false,
            statusCode: STATUS_CODE.NOT_FOUND,
            message: 'User not found'
        });

        // update user isVerified to true
        const User = await updateUserById(existingUser._id, { is_verified: true });
        const token = generateToken(existingUser);
        generateResponse({ token, User }, 'email has been verified successfully', res);
    } catch (error) {
        next(new Error(error.message));
    }
}