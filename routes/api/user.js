const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const config = require('config');
const sgMail = require('@sendgrid/mail');
const { check, validationResult } = require('express-validator');
var emailotp = {}




//@route       POST api/users
//@desc        register user
//@access      Public

/**
 * @swagger
 * /api/users/register:
 *  post:
 *    description: Create a new user
 *    responses:
 *      '200':
 *        description: A successful response
 *      '400':
 *        description: User already exist   
 */

router.post('/register', [
    check('name', 'name is required')
        .not()
        .isEmpty(),
    check('email', 'Please include a vaild email').isEmail(),
    // check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    try {
        const user = await User.findOne({ email: req.body.email });
        if (user) return res.status(400).json({ error: 'user already registred please sign in' });
        else {

            const user = {
                email: req.body.email,
                password: '',
                name: req.body.name
            }
            user.password = await bcrypt.hash(req.body.password, 10);

            const newUser = new User(user);
            const { id, name, email } = await newUser.save();

            const payload = {
                user: {
                    id,
                    name,
                    email
                }
            }
            let token = await jwt.sign(payload, config.get('jwtSecret'));
            res.status(200).json({
                token
            })
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).json('internal server error')
    }
});



/**
 * @swagger
 * /api/users/login:
 *  post:
 *    description: User login
 *    responses:
 *      '200':
 *        description: A successful response
 *      '404':
 *        description: No user found  
 *      '400':
 *         description: Invalid credentials
 */


router.post('/login', [
    check('email', 'Please include a vaild email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({ err: 'No user found' });
        else {
            const userPass = await bcrypt.compare(req.body.password, user.password);
            if (!userPass) return res.status(400).json({ err: 'IVC' });

            const payload = {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            }
            let token = await jwt.sign(payload, config.get('jwtSecret'));
            res.status(200).json({
                token
            })
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).json('internal server errror');
    }
})


/**
 * @swagger
 * /api/users/deactivate:
 *  put:
 *    description: User login
 *    responses:
 *      '200':
 *        description: A successful response
 *      '404':
 *        description: No user found  
 */


router.put('/deactivate', [
    check('email', 'Please include a vaild email').isEmail(),
], async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        console.log(user)
        if (!user) return res.status(404).json({ err: 'No user found' });
        else {
            const updatedUser = await User.findOneAndUpdate(req.body.email, {
                active: !user.active
            })
            res.status(200).json({
                msg: 'Successfully Updated'
            })
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).json('internal server errror');
    }
})




router.post('/resetpassword', [
    check('email', 'Please include a vaild email').isEmail(),
], async (req, res) => {

    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({ err: 'No user found' });
        else {

            let email = req.body.email;
            let digits = '0123456789';
            let OTP = '';
            for (let i = 0; i < 14; i++) {
                OTP += digits[Math.floor(Math.random() * 10)];
            }
            emailotp[email] = OTP;

            sgMail.setApiKey(config.get('sendgridKey'));
            const msg = {
                to: email,
                from: 'test@example.com',
                subject: 'Sending with SendGrid is Fun',
                text: 'and easy to do anywhere, even with Node.js',
                html: `<h1>${OTP}</h1>`,
            };
            sgMail.send(msg);

            res.status(200).json({
                'message': 'OTP sent successfully'
            })
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).json('internal server errror');
    }
});





router.post('/verifyotp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (emailotp.hasOwnProperty(email)) {
            if (emailotp[email] === otp) {
                res.status(200).json({
                    'validOTP': true
                })
            } else {
                res.status(400).json({
                    'validOTP': false
                });
            }
        } else {
            res.status(400).json({
                'message': 'email not found'
            });
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).json('internal server errror');
    }
});


/**
 * @swagger
 * /api/users/updatepassword:
 *  put:
 *    description: User password change
 *    responses:
 *      '200':
 *        description: A successful response
 *      '400':
 *        description: Something went wrong  
 */


router.put('/updatepassword', async (req, res) => {
    try {
        const userData = req.body;
        if (emailotp.hasOwnProperty(userData.email)) {
            let newPass = await bcrypt.hash(userData.password, 10);
            const user = await User.findOneAndUpdate({
                password: newPass
            })

            delete emailotp[userData.email]

            return res.status(200).json({
                message: 'Successfully updated'
            })
        }
        return res.status(400).json({
            err: 'Something went wrong'
        })

    } catch (error) {
        console.log(error.message)
        res.status(500).json('internal server errror');
    }
});



module.exports = router;