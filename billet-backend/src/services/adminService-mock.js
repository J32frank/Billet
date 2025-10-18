// Mock admin service for when Supabase is down
class MockAdminService {
    static async getAdminDashboard(adminId) {
        try {
            console.log(`📊 Getting MOCK admin dashboard for: ${adminId}`);
            
            // Return mock data that matches the real structure
            return {
                success: true,
                data: {
                    overview: {
                        totalSellers: 0,
                        activeSellers: 0,
                        inactiveSellers: 0,
                        totalEvents: 1,
                        activeEvents: 1
                    },
                    tickets: {
                        total: 0,
                        valid: 0,
                        used: 0,
                        revoked: 0
                    },
                    revenue: {
                        total: 0,
                        average: 0
                    },
                    quota: {
                        total: 0,
                        used: 0,
                        remaining: 0,
                        percentage: 0
                    },
                    currentEvent: {
                        id: 1,
                        name: 'Summer Festival 2024',
                        event_date: '2024-07-15',
                        location: 'Central Park Amphitheater',
                        max_capacity: 500,
                        ticket_price: 5000,
                        is_active: true
                    },
                    recentActivity: [
                        {
                            ticket_number: 'TKT-001',
                            buyer_name: 'John Doe',
                            status: 'valid',
                            generated_at: new Date().toISOString(),
                            sellers: { name: 'Alice Seller' },
                            events: { name: 'Summer Festival' }
                        },
                        {
                            ticket_number: 'TKT-002',
                            buyer_name: 'Jane Smith',
                            status: 'used',
                            generated_at: new Date(Date.now() - 3600000).toISOString(),
                            sellers: { name: 'Bob Seller' },
                            events: { name: 'Summer Festival' }
                        }
                    ]
                }
            };
        } catch (error) {
            console.error('💥 Mock admin dashboard error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = MockAdminService;