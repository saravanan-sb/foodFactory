const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
    vendor: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vendor'
        }
    },
    ingredients: [
        {
            type: Object,
        }
    ]
});


module.exports = Ingredient = mongoose.model('Ingredient', ingredientSchema);