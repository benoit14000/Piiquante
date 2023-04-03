const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

require('dotenv').config()

exports.signup = (req, res) => {
    bcrypt.hash(req.body.password, 7)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé' }))
                .catch(e => res.status(400).json({ e }));
        })
        .catch(e => res.status(500).json({ e }));
};

exports.login = (req, res) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !' });
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            `${process.env.KEY}`,
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(e => res.status(500).json({ e }));
        })
        .catch(e => res.status(500).json({ e }));
};