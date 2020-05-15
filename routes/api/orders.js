const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const Order = require('../../models/Orders');
const User = require('../../models/User');


//@route       POST api/orders
//@desc        new orders
//@access      Public



/**
 * @swagger
 * /api/orders:
 *  post:
 *    description: Create a new order
 *    responses:
 *      '200':
 *        description: A successful response
 *      '500':
 *        description: Internal error   
 */
router.post('/', auth, async (req, res) => {
    try {
        const newOrder = {
            user: {
                id: req.user.id,
                name: req.user.name
            },
            foodItems: req.body.foodItems
        }

        const order = await Order.create(newOrder)
        res.json(order);

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error')
    }
});


/**
 * @swagger
 * /api/orders:
 *  get:
 *    description: Get all the orders
 *    responses:
 *      '200':
 *        description: A successful response
 *      '500':
 *        description: Internal error   
 */

router.get('/getorders', auth, async (req, res) => {
    try {
        const allOrders = await Order.find({})
        const specficOrder = []
        allOrders.forEach((order) => {
            if (order.user.id.equals(req.user.id)) {
                console.log(order.foodItems)
                specficOrder.push(order.foodItems)
            }
        })
        res.status(200).json({
            orders: specficOrder
        })

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error')
    }
});


module.exports = router;