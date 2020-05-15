const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        name: String
    },
    foodItems: [
        {
            type: Object,
            required: true
        }
    ],
    status: {
        type: String,
        required: true
    },
    orderDate: {
        type: Date,
        default: Date.now
    }
});


module.exports = Order = mongoose.model('Order', orderSchema);