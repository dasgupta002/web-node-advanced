const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const Schema = mongoose.Schema

const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
})

userSchema.statics.signup = async function(email, password) {
    if(!email || !password) {
        throw Error('All fields are required!')
    } else if(!validator.isEmail(email)) { 
        throw Error('Use a valid mailing address!')
    } else if(!validator.isStrongPassword(password)) { 
        throw Error('Use a stronger password using both alphanumeric charaters!')
    } else {
        const exists = await this.findOne({ email })

        if(exists) {
            throw Error('Mailing address already exists!')
        } else {
            const salt = await bcrypt.genSalt(10)
            const hash = await bcrypt.hash(password, salt)

            const user = await this.create({ email, password: hash })
            return user
        }
    } 
}

userSchema.statics.login = async function(email, password) {
    if(!email || !password) {
        throw Error('All fields are required!')
    } else {
        const user = await this.findOne({ email })

        if(!user) {
            throw Error('Mailing address does not exists!')
        } else {
            const match = await bcrypt.compare(password, user.password)

            if(!match) {
                throw Error('Passwords do not match!')
            } else {
                return user
            }
        }
    } 
}

module.exports = mongoose.model('User', userSchema)