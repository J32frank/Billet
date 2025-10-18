const express = require('express');
const { authenticateUser } = require('../services/authService');
const { generateToken  } = require('../utils/jwt');
const { authenticateToken } = require('../middleware/auth')


const router = express.Router();

router.post('/login', async (req, res) => {
   try {
       const { email, password } = req.body;
       if (!email || !password) {
           return res.status(400).send({
               error: 'Email and Password are required'
           });
       }

       let authResult;
       try {
           // Try real authentication first
           authResult = await authenticateUser(email, password);
       } catch (supabaseError) {
           console.log('⚠️ Supabase error, using mock auth:', supabaseError.message);
           // Fallback to mock authentication
           const { authenticateUserMock } = require('../services/authService-mock');
           authResult = await authenticateUserMock(email, password);
       }
       
       if(!authResult.success) {
           return res.status(401).send({
               success: false,
               error: authResult.error,
           })
       }
       
       const token = generateToken({
           userId: authResult.user.id,
           useId: authResult.user.id, // Add for backward compatibility
           role: authResult.user.role,
           email: authResult.user.email,
       });

       // Get current active event for context
       let eventId = null;
       let currentEvent = null;
       
       if (authResult.user.role === 'admin') {
           try {
               const supabase = require('../config/database');
               const { data: event } = await supabase
                   .from('events')
                   .select('*')
                   .eq('is_active', true)
                   .order('created_at', { ascending: false })
                   .limit(1)
                   .maybeSingle();
               if (event) {
                   eventId = event.id;
                   currentEvent = event;
               }
           } catch (e) {
               console.log('No active event found for admin');
           }
       } else if (authResult.user.role === 'seller') {
           try {
               const supabase = require('../config/database');
               const { data: seller, error: sellerError } = await supabase
                   .from('sellers')
                   .select(`
                       event_id,
                       events (*)
                   `)
                   .eq('id', authResult.user.id)
                   .single();
               
               console.log('🔍 Seller lookup result:', { seller, sellerError, userId: authResult.user.id });
               
               if (seller && seller.events) {
                   eventId = seller.event_id;
                   currentEvent = seller.events;
                   console.log('✅ Seller event found:', currentEvent.name);
               } else {
                   console.log('⚠️ No event assigned to seller');
               }
           } catch (e) {
               console.log('❌ Error fetching seller event:', e.message);
           }
       }

       console.log('✅ Login successful:', authResult.user.email, 'Role:', authResult.user.role);
       res.json({
           success: true,
           token: token,
           user: authResult.user,
           eventId: eventId,
           currentEvent: currentEvent
       })
   } catch (error) {
       console.log('❌ Login error:', error);
       return res.status(500).json({
           success: false,
           error: 'Internal Server Error during Login',
       })
   }
});

router.post('/logout', authenticateToken, async (req, res) => {
    res.json({
        success: true,
        message: 'Logout successful',
    })
})
router.post('/refresh', authenticateToken , ( req, res) => {
    const newToken = generateToken({
        userId: req.user.id,
        role: req.user.role,
        email: req.user.email,
    })
    res.json({
        success: true,
        token: newToken,
    })
})

module.exports = router;