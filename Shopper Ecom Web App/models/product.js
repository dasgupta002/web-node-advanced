const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    price: { type: Number, required: true },
    imageURL: { type: String, required: true }
});

module.exports = mongoose.model('Product', productSchema);