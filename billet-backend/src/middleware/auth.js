const  {  verifyToken, decodeToken} = require('../utils/jwt');
const {authenticateUser} = require("../services/authService");
const supabase = require('@supabase/supabase-js')

const authenticateToken = async  (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                error: 'No token provided, please try again',
            })
        }

        const decodedToken = verifyToken(token);
        
        // DEBUG: Log what's actually in the token
        console.log('🔍 AUTH DEBUG - Decoded JWT Token:', JSON.stringify(decodedToken, null, 2));
        
        req.user = decodedToken;

        next();
    } catch (err) {
        return res.status(401).json({err: "Invalid or Expired Token"});
    }
};



const requireAdmin = (req, res, next) => {
        if(!req.user || req.user.role !== 'admin') {
            return res.status(401).json({error: "Admin access required, please try again"});
        }
        next();

    };

module.exports = {
    authenticateToken,
    requireAdmin,
}