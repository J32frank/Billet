const supabase = require('../config/database'); // ✅ Fixed path
const { comparePassword } = require('../utils/password');

const authenticateUser = async (email, password) => {
    try {
        const { data: adminAuth, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        // Check if user authenticated successfully with Supabase Auth
        if(adminAuth?.user && !authError){
            return{
                success: true,
                user: {
                    id: adminAuth.user.id,
                    email: adminAuth.user.email,
                    name: adminAuth.user.user_metadata?.name || adminAuth.user.email,
                    role: 'admin'
                },
                authSource: 'supabase'
            };
        }

    } catch (error) {
        console.log('Admin auth error:', error.message);
        // If Supabase auth fails, continue to seller auth
    }

    // Search if user is in the seller table
    try {
        const { data: seller, error: sellerError } = await supabase
            .from('sellers')
            .select('id, email, name, password_hash, is_active')
            .eq('email', email)
            .single();

        if (seller && !sellerError) {
            // ✅ Fixed: Check seller.is_active, not sellerError.is_active
            if (!seller.is_active) {
                return {
                    success: false,
                    error: 'Account deactivated. Please contact your admin',
                };
            }

            const validPassword = await comparePassword(password, seller.password_hash);
            console.log('Password comparison result:', validPassword);

            if (validPassword) {
                return {
                    success: true,
                    user: {
                        id: seller.id,
                        email: seller.email,
                        name: seller.name,
                        role: 'seller'
                    },
                    authSource: 'custom'
                };
            } else {
                console.log('Password comparison failed for seller:', email);
            }
        } else {
            console.log('Seller not found or query error:', sellerError);
        }

    } catch (error) {
        console.log('Seller auth error:', error.message); // ✅ Log errors
    }

    return {
        success: false,
        error: 'Invalid email or password',
    };
};

module.exports = {
    authenticateUser,
};