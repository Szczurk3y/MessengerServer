const router = require('express').Router();
const Joi = require('@hapi/joi');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose')

const registerValidation = data => {
    const schema = Joi.object({
        username: Joi.string().alphanum().min(3).max(25).required(),
        email: Joi.string().min(6).max(255).required().email(),
        password: Joi.string().min(3).max(255).required()
    });

    return schema.validate(data);
}

router.post('/', async (req, res) => {
    const { error } = registerValidation(req.body);
    if (error) return res.json({message: error.details[0].message });
    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists ) return res.json({message: 'Email already exists' });
    const userExists = await User.findOne({ username: req.body.username });
    if (userExists) return res.json({message: 'User already exists' });


    //Hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt)

    const user = new User ({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword
    });

    try { 
        await mongoose.connection.createCollection(req.body.username)
        
        await user.save().then(() => {
            return res.json({
                message: "Successfully registered",
                isRegistered: true
            })
        })
    } catch(err) {
        return res.json({ message: err })
    }
});

module.exports = router;
