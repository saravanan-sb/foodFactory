const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator');
const Vendor = require('../../models/Vendor');
const Ingredient = require('../../models/Ingredients');



//@route       POST api/vendor
//@desc        new orders
//@access      Private



/**
 * @swagger
 * /api/vendors/register:
 *  post:
 *    description: Create a new vendor
 *    responses:
 *      '200':
 *        description: A successful response
 *      '400':
 *        description: Vendor already exist   
 */

router.post('/register', [
    check('email', 'Please include a vaild email').isEmail(),
    // check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    try {
        const vendor = await Vendor.findOne({ email: req.body.email });
        if (vendor) return res.status(400).json({ error: 'user already registred please sign in' });
        else {

            const vendor = {
                email: req.body.email,
                password: '',
            }
            vendor.password = await bcrypt.hash(req.body.password, 10);

            const newVendor = new Vendor(vendor);
            const { id, email } = await newVendor.save();

            const payload = {
                user: {
                    id,
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
 * /api/vendors/login:
 *  post:
 *    description: Vendor login
 *    responses:
 *      '200':
 *        description: A successful response
 *      '404':
 *        description: No Vendor found  
 *      '400':
 *         description: Invalid credentials
 */


router.post('/login', [
    check('email', 'Please include a vaild email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
    try {
        const vendor = await Vendor.findOne({ email: req.body.email });

        if (!vendor) return res.status(404).json({ err: 'No user found' });
        else {
            const vendorPass = await bcrypt.compare(req.body.password, vendor.password);
            if (!vendorPass) return res.json({ err: 'IVC' });

            const payload = {
                user: {
                    id: vendor.id,
                    email: vendor.email
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
 * /api/vendor/addingredients:
 *  post:
 *    description: vendor adding ingredients
 *    responses:
 *      '200':
 *        description: A successful response 
 *      '500':
 *         description: Internal error
 */

router.post('/addingredients', auth, async (req, res) => {
    try {
        const data = {
            vendor: {
                id: req.user.id,
            },
            ingredients: req.body.ingredients
        }

        const remaining = await Ingredient.create(data)
        res.status(200).json(remaining);
    } catch (error) {
        console.log(error.message)
        res.status(500).json('internal server errror');
    }
})



/**
 * @swagger
 * /api/vendor/getingredients:
 *  get:
 *    description: vendor adding ingredients
 *    responses:
 *      '200':
 *        description: A successful response 
 *      '500':
 *         description: Internal error
 */
router.get('/getingredients', auth, async (req, res) => {
    try {
        const allIng = await Ingredient.find({})
        const specficOrder = []
        allIng.forEach((ingredient) => {
            console.log(ingredient)
            if (ingredient.vendor.id.equals(req.user.id)) {
                specficOrder.push(ingredient.ingredients)
            }
        })
        console.log(specficOrder[0])
        res.status(200).json({
            ingredients: specficOrder
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json('internal server errror');
    }
})


/**
 * @swagger
 * /api/vendor/lessthanthreshold:
 *  get:
 *    description: vendor adding ingredients
 *    responses:
 *      '200':
 *        description: A successful response 
 *      '500':
 *         description: Internal error
 */

router.get('/lessthanthreshold', auth, async (req, res) => {
    try {
        const allIng = await Ingredient.find({})
        const specficOrder = []
        const result = []
        allIng.forEach((ingredient) => {
            console.log(ingredient)
            if (ingredient.vendor.id.equals(req.user.id)) {
                specficOrder.push(ingredient.ingredients)
            }
        })
        specficOrder[0].forEach(ingredient => {
            if (ingredient.availabele < ingredient.threshold) {
                result.push(ingredient)
            }
        })
        res.status(200).json({
            lessthanthreshold: result
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json('internal server errror');
    }
})


module.exports = router;