const supabase = require('../config/database');
const crypto = require('crypto');

class DownloadTokenService {
    static async generateDownloadToken(ticketId) {
        try {
            console.log(`🔑 Generating download token for ticket: ${ticketId}`);
            
            // Generate unique token
            const token = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
            
            // Clean up any existing active tokens for this ticket first
            await DownloadTokenService.expireOldTokens(ticketId); // ← FIX: Use class name instead of 'this'
            
            // Insert into database
            const { data: tokenData, error } = await supabase
                .from('download_tokens')
                .insert([
                    {
                        ticket_id: ticketId,
                        token: token,
                        expires_at: expiresAt.toISOString(),
                        is_used: false,
                        created_at: new Date().toISOString()
                    }
                ])
                .select()
                .single();
            
            if (error) {
                console.error('❌ Token insertion error:', error);
                // If insert fails, try with a new token (in case of unique constraint violation)
                return await DownloadTokenService.generateDownloadToken(ticketId); // ← FIX: Use class name here too
            }
            
            console.log('✅ Download token generated:', token);
            return token;
            
        } catch (error) {
            console.error('💥 Token generation error:', error);
            throw new Error('Failed to generate download token');
        }
    }
    
    static async expireOldTokens(ticketId) {
        try {
            // Mark all active tokens for this ticket as expired
            const { error } = await supabase
                .from('download_tokens')
                .update({ 
                    is_used: true,
                    expired_manually: true 
                })
                .eq('ticket_id', ticketId)
                .eq('is_used', false)
                .gt('expires_at', new Date().toISOString());
            
            if (error) {
                console.error('❌ Error expiring old tokens:', error);
                return; // Don't throw, just return
            }
            
            console.log(`✅ Expired old tokens for ticket: ${ticketId}`);
            
        } catch (error) {
            console.error('❌ Failed to expire old tokens:', error);
            // Don't throw - we can continue with new token generation
        }
    }

    // ... keep all your other methods exactly as they are
    static async validateToken(token, ticketId = null) {
        try {
            console.log(`🔍 Validating token: ${token}`);
            
            let query = supabase
                .from('download_tokens')
                .select('*')
                .eq('token', token)
                .eq('is_used', false)
                .gt('expires_at', new Date().toISOString());
            
            // If ticketId provided, validate it matches
            if (ticketId) {
                query = query.eq('ticket_id', ticketId);
            }
            
            const { data: tokenData, error } = await query.single();
            
            if (error || !tokenData) {
                console.log('❌ Token validation failed');
                return {
                    valid: false,
                    error: 'Invalid, expired, or already used token'
                };
            }
            
            console.log('✅ Token validated successfully');
            return {
                valid: true,
                tokenData: tokenData
            };
            
        } catch (error) {
            console.error('💥 Token validation error:', error);
            return {
                valid: false,
                error: error.message
            };
        }
    }
    
    static async markTokenAsUsed(tokenId) {
        try {
            const { error } = await supabase
                .from('download_tokens')
                .update({ 
                    is_used: true,
                    used_at: new Date().toISOString()
                })
                .eq('id', tokenId);
            
            if (error) throw error;
            
            console.log('✅ Token marked as used:', tokenId);
            
        } catch (error) {
            console.error('❌ Failed to mark token as used:', error);
            throw error;
        }
    }
    
    static async getActiveTokens(ticketId) {
        try {
            const { data: tokens, error } = await supabase
                .from('download_tokens')
                .select('*')
                .eq('ticket_id', ticketId)
                .eq('is_used', false)
                .gt('expires_at', new Date().toISOString());
            
            if (error) throw error;
            return tokens || [];
            
        } catch (error) {
            console.error('❌ Failed to fetch active tokens:', error);
            return [];
        }
    }
    
    static async getTokenByValue(token) {
        try {
            const { data: tokenData, error } = await supabase
                .from('download_tokens')
                .select('*')
                .eq('token', token)
                .single();
            
            if (error) throw error;
            return tokenData;
            
        } catch (error) {
            console.error('❌ Failed to get token by value:', error);
            return null;
        }
    }
    
    static async getTokenStatus(token) {
        try {
            const tokenData = await this.getTokenByValue(token);
            
            if (!tokenData) {
                return {
                    valid: false,
                    isExpired: true,
                    isUsed: true,
                    error: 'Token not found'
                };
            }
            
            const now = new Date();
            const expiresAt = new Date(tokenData.expires_at);
            const timeRemaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
            const isExpired = timeRemaining === 0;
            const isUsed = tokenData.is_used;
            
            return {
                valid: !isExpired && !isUsed,
                timeRemaining,
                expiresAt: tokenData.expires_at,
                isExpired,
                isUsed,
                tokenId: tokenData.id,
                ticketId: tokenData.ticket_id
            };
            
        } catch (error) {
            console.error('💥 Token status check error:', error);
            return {
                valid: false,
                isExpired: true,
                isUsed: true,
                error: error.message
            };
        }
    }
    
    // New methods for public access
    static async verifyDownloadToken(ticketId, token) {
        try {
            const { data: tokenData, error } = await supabase
                .from('download_tokens')
                .select('*')
                .eq('token', token)
                .eq('ticket_id', ticketId)
                .single();
            
            if (error || !tokenData) {
                return {
                    success: false,
                    error: 'Invalid token',
                    expired: false
                };
            }
            
            const now = new Date();
            const expiresAt = new Date(tokenData.expires_at);
            const isExpired = now > expiresAt || tokenData.is_used;
            
            if (isExpired) {
                return {
                    success: false,
                    error: 'Token has expired',
                    expired: true
                };
            }
            
            return {
                success: true,
                data: {
                    tokenId: tokenData.id,
                    expiresAt: tokenData.expires_at,
                    ticketId: tokenData.ticket_id
                }
            };
            
        } catch (error) {
            console.error('Token verification error:', error);
            return {
                success: false,
                error: 'Verification failed'
            };
        }
    }
    
    static async markTokenAsUsed(token) {
        try {
            const { error } = await supabase
                .from('download_tokens')
                .update({ 
                    is_used: true,
                    used_at: new Date().toISOString()
                })
                .eq('token', token);
            
            if (error) throw error;
            
            console.log('✅ Token marked as used:', token);
            return { success: true };
            
        } catch (error) {
            console.error('❌ Failed to mark token as used:', error);
            return { success: false, error: error.message };
        }
    }
    
    static async cleanupExpiredTokens() {
        try {
            const now = new Date().toISOString();
            
            // Mark expired tokens as used
            const { error: updateError } = await supabase
                .from('download_tokens')
                .update({ is_used: true })
                .lt('expires_at', now)
                .eq('is_used', false);
            
            if (updateError) throw updateError;
            
            console.log('🧹 Cleaned up expired tokens');
            
        } catch (error) {
            console.error('❌ Token cleanup error:', error);
        }
    }
    
    static async setupCleanupJob() {
        // Run cleanup every hour
        setInterval(() => {
            this.cleanupExpiredTokens();
        }, 60 * 60 * 1000); // 1 hour
        
        // Also run on startup
        this.cleanupExpiredTokens();
        
        console.log('✅ Download token cleanup job started');
    }
    
    static async testTokenGeneration() {
        try {
            console.log('🧪 Testing token generation...');
            
            // You'll need a real ticket ID from your database for this test
            const testTicketId = 'your-test-ticket-id-here';
            
            const token = await this.generateDownloadToken(testTicketId);
            console.log('✅ Token generated:', token);
            
            const validation = await this.validateToken(token, testTicketId);
            console.log('✅ Token validation:', validation.valid);
            
            const status = await this.getTokenStatus(token);
            console.log('✅ Token status:', status);
            
            return { success: true, token, validation, status };
            
        } catch (error) {
            console.error('❌ Token test failed:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = DownloadTokenService;