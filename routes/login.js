const router = require('express').Router();
const Joi = require('@hapi/joi');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const loginValidation = data => {
    const schema = Joi.object({
        username: Joi.string().alphanum().min(3).max(25).required(),
        password: Joi.string().min(3).max(255).required()
    });

    return schema.validate(data);
}

router.post('/', async (req, res) => {
    const { error } = loginValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.status(400).send("User not found");
    const valid_passwords = bcrypt.compare(user.password, req.body.password);
    if (!valid_passwords) return res.send("Wrong password");
    res.send("You are now logged in!");
});

module.exports = router;
