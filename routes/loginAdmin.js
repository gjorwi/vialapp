const express = require('express');
const router = express.Router();
const UserAdmin = require('../models/userAdmin');
const jwt = require('jsonwebtoken');

router.get('/register', (req, res) => {
    const email = 'root@root.com';
    const newUser = new UserAdmin({ email: email });
    newUser.save((err, user) => {
        if (err) {
            return res.status(500).json({ success: false, authentication: null, error: 'Error al iniciar la app' });
        }
        res.json({ success: true, authentication: null, error: null });
    });
})

router.get('/userByEmail', (req, res) => {
  const { email } = req.query;
  UserAdmin.findOne({ email }, (err, user) => {
    if (err) {
      return res.status(500).json({ success: false, authentication: null, error: 'Error al buscar el usuario' });
    }
    if (!user) {
      return res.status(401).json({ success: false, authentication: null, error: 'Credenciales inválidas' });
    }
    console.log('User found:', user);
    if(user){
        jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) {
                return res.status(500).json({ success: false, authentication: null, error: 'Error al generar el token' });
            }
            res.json({ success: true, authentication: { token: token }, error: null });
        });
    }
    
  });
});

module.exports = router;
