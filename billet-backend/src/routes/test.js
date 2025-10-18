const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        status: 200,
        message: 'Welcome to the test',
    })
})

try {
    const supabase = require('../config/database');
    console.log('Supabase require successfully in test.js');
    router.get('/db', async (req, res) => {
      try {
          const {data, error} = await  supabase.from('admins').select('email');
          if (error) throw  error;
          res.json({
              status: 200,
              success: true,
              email: data
          });
      } catch (error) {
          res.status(500).json({error: error.message});
      }

    });
} catch (err) {
    console.log('Request failed with error:', err);

    router.get('/db', async (req, res) => {
        res.status(500).json({
            error: 'Database connection not available',
            details: err.details,
        })
    });
}


module.exports = router;