import express from "express"
const router = express.Router()
// import StartUp from '../../models/startUp/register.js';
import {prisma} from "../../prisma/prisma.js";
import { transport } from "../../packages/mailer/index.js";

import jwt from 'jsonwebtoken';
// OTP
import otpGenerator from 'otp-generator';

//POST
router.post('/', async (req, res) => {
    try {
        // const startUpDetails = await StartUp.findOne({ email: req.body.email })
        
        const startUpDetails=await prisma.startup.findUnique({where:{email:req.body.email}})
        console.log(startUpDetails);
        
        if (startUpDetails === null) {
            res.status(401).json({
                status: 401,
                message: "Account does not exist"
            })
        }
        else {
            const otp = otpGenerator.generate(6, { digits:true,lowerCaseAlphabets:false, upperCaseAlphabets: false, specialChars: false });
            // const findAndUpdateStartup=await StartUp.findOneAndUpdate({email:req.body.email},{
            //     $set:{
            //         otp: otp
            //     }
            // },{ 'new': true })
            console.info(otp)
            const findAndUpdateStartup=await prisma.startup.update({where:{email:req.body.email},data:{otp:otp}})
            delete findAndUpdateStartup.otp
            res.status(200).json({
                status: 200,
                startUpDetails: findAndUpdateStartup
            })
            var mailOptions = {
                from: process.env.MAILER_ID,
                to: findAndUpdateStartup.email,
                subject: "Your One-Time Password (OTP) for Sign In Verification",
                html: `
                    Dear ${findAndUpdateStartup.companyName},<br><br>
                    Please enter the following OTP to complete the sign in process: <b>${otp}
               `
            };
            transport.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                }
            });
        }
    }
    catch (err) {
        res.status(500).json({
            status: 500,
            message: err.message
        })
    }
})

//OTP Verify
router.post('/otp/verify', async (req, res) => {
    try {
        // const startUpDetails = await StartUp.findOne({ email: req.body.email })
        const startUpDetails=await prisma.startup.findUnique({where:{email:req.body.email},include:{founder:true}})
        if (startUpDetails.otp === req.body.otp) {
            const token = jwt.sign({ _id: startUpDetails._id }, process.env.JWT_SECRET)
            res.status(200).json({
                status: 200,
                startUpDetails: startUpDetails,
                token: token
            })
        }
        else {
            res.status(401).json({
                status: 401,
                message: "Wrong OTP"
            })
        }
    }
    catch (err) {
        res.status(500).json({
            status: 500,
            message: err.message
        })
    }
})

export default router