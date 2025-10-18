const DownloadTokenService = require('./downloadTokenService');

class TimerService {
    static async getTokenStatus(token) {
        const status = await DownloadTokenService.getTokenStatus(token);
        
        // DEBUG: Check what's actually returned
        console.log('🔍 TIMER DEBUG - Token status:', JSON.stringify(status, null, 2));
        
        return status;
    }
    
    static async getFormattedTimeRemaining(token) {
        const status = await this.getTokenStatus(token);
        
        if (!status.valid) {
            return {
                valid: false,
                message: status.isUsed ? 'Link used' : 'Link expired',
                totalSeconds: 0
            };
        }
        
        const minutes = Math.floor(status.timeRemaining / 60);
        const seconds = status.timeRemaining % 60;
        
        return {
            valid: true,
            totalSeconds: status.timeRemaining,
            minutes,
            seconds,
            formatted: `${minutes}:${seconds.toString().padStart(2, '0')}`,
            expiresAt: status.expiresAt,
            isExpiringSoon: status.timeRemaining < 300 // 5 minutes
        };
    }
    
    static async validateTokenForDownload(token) {
        try {
            const status = await this.getTokenStatus(token);
            
            if (!status.valid) {
                throw new Error(
                    status.isUsed ? 'Download link has already been used' :
                    status.isExpired ? 'Download link has expired' :
                    'Invalid download link'
                );
            }
            
            return status;
        } catch (error) {
            console.error('❌ Token validation failed:', error);
            throw error;
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
}

module.exports = TimerService;