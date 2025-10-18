const express = require('express');
const { generateToken } = require('../utils/jwt');
const { authenticateToken, requireAdmin, requireSeller } = require('../middleware/auth');


const router = express.Router();

router.get('/public', (req, res) =>{
    res.json({message:"Public endpoint -anyone can access "});
} );

router.get('/protected', (req, res) => {
    res.json({
        message:"Protected endpoint",
        user: req.user,
    })
})


router.get('/admin-only', (req, res) => {
    res.json({
        message: "Admin only can access",
        user: req.user,
    })
})


router.get('/seller-only', (req, res) => {
    res.json({
        message: "Seller workspace",
        user: req.user,
    })
})

router.get('/optional', (req, res) => {
    res.json({
        message:"Optional auth endpoint",
        user: req.user || 'Guess',
    })
})


router.get('/test-tokens', (req, res) => {
    const adminToken = generateToken({
        userId: 'test-admin-124',
        role: 'admin',
        name: "System Developer",
        email: 'admin@gmail.com'
    });

    const sellerToken = generateToken({
        userId: 'test-seller-467',
        role: "seller",
        email: 'seller@gmail.com'
    })

    res.json({adminToken, sellerToken})
})


module.exports = router;