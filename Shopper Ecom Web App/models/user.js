const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  mailingAddress: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetKey: { type: String, required: false },
  keyExpires: { type: Date, required: false },
  cart: { 
    items: [
      { 
        productID: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true }
      }
    ]
  }
});

userSchema.methods.addItem = function(product) {
    const index = this.cart.items.findIndex((item) => {
      return item.productID.toString() === product._id.toString();
    });

    let quantity = 1;
    const updated = [ ...this.cart.items ];
  
    if (index >= 0) {
      quantity = this.cart.items[index].quantity + 1;
      updated[index].quantity = quantity;
    } else {
      updated.push({ productID: product._id, quantity: quantity });
    }
    
    const cart = { items: updated };
    this.cart = cart;
    return this.save();
};
  
userSchema.methods.removeItem = function(productID) {
    const updated = this.cart.items.filter((item) => item.productID.toString() !== productID.toString());
    this.cart.items = updated;
    return this.save();
};
  
userSchema.methods.clearCart = function() {
    this.cart = { items: [] };
    return this.save();
};  

module.exports = mongoose.model('User', userSchema);