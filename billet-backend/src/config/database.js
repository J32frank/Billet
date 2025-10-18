const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Debug environment variables
console.log('🔍 DATABASE DEBUG - SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('🔍 DATABASE DEBUG - SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

const supabase = createClient(
    process.env.SUPABASE_URL,           // ✅ FIXED
    process.env.SUPABASE_SERVICE_ROLE_KEY  // ✅ FIXED
);

module.exports = supabase;