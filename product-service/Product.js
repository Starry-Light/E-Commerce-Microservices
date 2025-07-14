const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    name: String,
    description: String,
    price: Number,
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

Product = mongoose.model('product', ProductSchema)
module.exports = Product