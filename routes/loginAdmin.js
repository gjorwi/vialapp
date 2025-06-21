const express = require('express');
const router = express.Router();
const UserAdmin = require('../models/userAdmin');
const jwt = require('jsonwebtoken');

router.get('/register', async (req, res) => {
    const email = 'jgjg0503@gmail.com';
    const newUser = new UserAdmin({ email: email });
    try {
        const resultFindEmail = await UserAdmin.findOne({ email });
        if (resultFindEmail) {
            return res.status(200).json({ success: true, authentication: null, error: null });
        }
        const result= await newUser.save();
        console.log(JSON.stringify(result, null, 2));
        res.json({ success: true, authentication: null, error: null });
    } catch (error) {
        console.log(JSON.stringify(error, null, 2));
        res.json({ success: false, authentication: null, error: error });
    }
})

router.post('/userByEmail', async (req, res) => {
  const { email } = req.body;
  console.log('Email:', email);
  try {
    const user = await UserAdmin.findOne({ email });
    if (!user) {
      return res.json({ success: false, authentication: null, error: null, message: 'El usuario no es un administrador' });
    }
    console.log('User found:', user);
    if(user){
        jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) {
                return res.status(500).json({ success: false, authentication: null, error: 'Error al generar el token' });
            }
            res.json({ success: true, authentication: { token: token }, error: null, message: 'Usuario encontrado' });
        });
    }
    
  } catch (error) {
    console.log(JSON.stringify(error, null, 2));
    res.json({ success: false, authentication: null, error: error, message: 'Error al buscar el usuario' });
  }
})

module.exports = router;
