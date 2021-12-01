const mongoose = require('mongoose')
const { isEmail } = require('validator')
const bcrypt = require('bcrypt')
const Schema = mongoose.Schema

const userSchema = new Schema({
    email: { 
        type: String, 
        required: [true, 'Mailing address is required!'], 
        unique: true, 
        lowercase: true,
        validate: [isEmail, 'Submit a valid mailing address!'] 
    },
    password: {  
        type: String, 
        required: [true, 'User password is required!'], 
        minlength: [6, 'User password should be atleast six characters long!'] 
    }
})

userSchema.pre('save', async function(next) {
    const salt = await bcrypt.genSalt()
    this.password = await bcrypt.hash(this.password, salt)
    
    next()
})

userSchema.statics.loginUser = async function(email, password) {
    const user = await this.findOne({ email })

    if(user) {
        const isMatch = await bcrypt.compare(password, user.password)
        if(isMatch) {
            return user
        } else {
            throw new Error('User password is incorrect!')
        }
    } else {
        throw new Error('Mailing address not found!')
    }
}

module.exports = mongoose.model('User', userSchema)