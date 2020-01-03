const router = require('express').Router();
const Joi = require('@hapi/joi');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

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
    if (error) return res.status(400).send(error.details[0].message);
    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists ) return res.status(400).send('Email already exists');
    const userExists = await User.findOne({ username: req.body.username });
    if (userExists) return res.status(400).send('User already exists');


    //Hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt)

    const user = new User ({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword
    });

    try {
        await user.save();
        res.send({password: user.password});
    } catch(err) {
        res.status(400).send(err);
    }
});

module.exports = router;
