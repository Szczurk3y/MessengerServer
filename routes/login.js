const router = require('express').Router()
const Joi = require('@hapi/joi')
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')

dotenv.config()

const loginValidation = data => {
    const schema = Joi.object({
        username: Joi.string().alphanum().min(3).max(25).required(),
        password: Joi.string().min(3).max(255).required()
    })

    return schema.validate(data);
}

router.post('/', async (req, res) => {
    //1st step --> Checking if query has a valid body
    const { error } = loginValidation(req.body)
    if (error) return res.json({ message: error.details[0].message })

    //2nd step --> Checking if user with provided username exists 
    const user = await User.findOne({ username: req.body.username })
    if (!user) return res.json({ message: "User not found" })


    //3rd step --> Comparing passwords
    const valid_passwords = await bcrypt.compare(req.body.password, user.password) //first argument must be a 'what password is given' and the second argument is like 'stored(correct) password'. If it's swapped, comparison wouldn't work 
    if (!valid_passwords) return res.json({ message: "Wrong password" })
    
    const token = await jwt.sign({_username: req.body.username}, process.env.TOKEN_SECRET)
    res.header('auth-token', token)
    return res.json({
        message: "You are now logged in!",
        isLogged: true,
        token: token,
        email: user.email
    })
})

module.exports = router;
