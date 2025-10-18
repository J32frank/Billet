const bcrypt = require('bcryptjs');

// Mock users for testing when Supabase is down
const mockUsers = [
    {
        id: 'admin-1',
        email: 'admin@test.com',
        name: 'Test Admin',
        role: 'admin',
        password: 'admin123' // Will be hashed
    },
    {
        id: 'seller-1', 
        email: 'seller@test.com',
        name: 'Test Seller',
        role: 'seller',
        password: 'seller123', // Will be hashed
        is_active: true
    }
];

const authenticateUserMock = async (email, password) => {
    try {
        console.log('🔐 MOCK Authentication for:', email);
        
        // Find user in mock data
        const user = mockUsers.find(u => u.email === email);
        
        if (!user) {
            return {
                success: false,
                error: 'Invalid email or password'
            };
        }
        
        // For mock, just check plain text password
        if (user.password !== password) {
            return {
                success: false,
                error: 'Invalid email or password'
            };
        }
        
        // Check if seller is active
        if (user.role === 'seller' && !user.is_active) {
            return {
                success: false,
                error: 'Account deactivated. Please contact your admin'
            };
        }
        
        return {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            authSource: 'mock'
        };
        
    } catch (error) {
        console.log('Mock auth error:', error.message);
        return {
            success: false,
            error: 'Authentication failed'
        };
    }
};

module.exports = {
    authenticateUserMock
};