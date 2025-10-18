const supabase = require('../config/database');
const bcrypt = require('bcryptjs');

class AdminService {
    static async createSeller(adminId, sellerData) {
        try {
            console.log(`👑 Admin ${adminId} creating seller: ${sellerData.email}`);
            
            // Test database connection first
            const { data: testConnection } = await supabase
                .from('sellers')
                .select('id')
                .limit(1);
            
            console.log('🔌 Database connection test passed');

            const { name, email, password, quota = 100, eventId } = sellerData;

            // Validate required fields
            if (!name || !email || !password) {
                throw new Error('Name, email, and password are required');
            }

            // Check if seller already exists
            const { data: existingSeller } = await supabase
                .from('sellers')
                .select('id, email')
                .eq('email', email)
                .single();

            if (existingSeller) {
                throw new Error('Seller with this email already exists');
            }

            // Generate username from email
            const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

            // Hash password
            const passwordHash = await bcrypt.hash(password, 10);

            // Create seller data object
            const newSellerData = {
                name: name,
                email: email,
                username: username,
                password_hash: passwordHash,
                quota: quota,
                tickets_sold: 0,
                is_active: true,
                created_by: adminId,
                created_at: new Date().toISOString()
            };
            
            // Only add event_id if it exists
            if (eventId) {
                newSellerData.event_id = eventId;
            }
            
            const { data: seller, error } = await supabase
                .from('sellers')
                .insert([newSellerData])
                .select(`
                    id,
                    name,
                    email,
                    quota,
                    tickets_sold,
                    is_active,
                    event_id,
                    created_at
                `)
                .single();

            if (error) throw error;

            console.log(`✅ Seller created successfully: ${seller.id}`);
            return {
                success: true,
                data: seller,
                message: 'Seller account created successfully'
            };

        } catch (error) {
            console.error('💥 Create seller error:', error);
            
            // Handle different types of errors
            let errorMessage = 'Failed to create seller';
            if (error.message) {
                errorMessage = error.message;
            } else if (error.code) {
                errorMessage = `Database error: ${error.code}`;
            }
            
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    static async getAllSellers(filters = {}) {
        try {
            console.log('📋 Getting all sellers for admin');

            let query = supabase
                .from('sellers')
                .select(`
                    id,
                    name,
                    email,
                    quota,
                    tickets_sold,
                    is_active,
                    created_at,
                    updated_at,
                    events (
                        id,
                        name,
                        event_date
                    )
                `)
                .order('created_at', { ascending: false });

            if (filters.isActive !== undefined) {
                query = query.eq('is_active', filters.isActive);
            }

            if (filters.eventId) {
                query = query.eq('event_id', filters.eventId);
            }

            const { data: sellers, error } = await query;

            if (error) throw error;

            // Get real-time ticket counts and revenue for each seller
            const sellersWithStats = await Promise.all(sellers.map(async (seller) => {
                const { data: tickets } = await supabase
                    .from('tickets')
                    .select('ticket_price, status')
                    .eq('seller_id', seller.id);

                const actualTicketsSold = tickets?.length || 0;
                const totalRevenue = tickets?.reduce((sum, ticket) => sum + (parseFloat(ticket.ticket_price) || 0), 0) || 0;
                const quota = seller.quota || 0;
                const quotaRemaining = Math.max(0, quota - actualTicketsSold);
                const quotaPercentage = quota > 0 ? (actualTicketsSold / quota) * 100 : 0;
                
                // Get admin creator info (required for accountability)
                let createdByAdmin = null;
                try {
                    console.log(`🔍 Looking up creator for seller ${seller.name}, created_by: ${seller.created_by}`);
                    
                    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
                    
                    if (authError) {
                        console.error('⚠️ Auth admin error:', authError);
                        throw authError;
                    }
                    
                    const authUsers = authData?.users || [];
                    console.log(`📋 Found ${authUsers.length} auth users`);
                    
                    const creatorAdmin = authUsers.find(user => user.id === seller.created_by);
                    
                    if (creatorAdmin) {
                        createdByAdmin = {
                            id: creatorAdmin.id,
                            email: creatorAdmin.email,
                            name: creatorAdmin.user_metadata?.name || creatorAdmin.user_metadata?.full_name || creatorAdmin.email
                        };
                        console.log(`✅ Found creator admin:`, createdByAdmin);
                    } else {
                        console.log(`⚠️ No admin found with ID: ${seller.created_by}`);
                        console.log('Available admin IDs:', authUsers.map(u => u.id));
                    }
                } catch (error) {
                    console.error('🚨 CRITICAL: Could not fetch admin creator info:', error);
                    // This is critical for accountability, so we should know about failures
                    createdByAdmin = {
                        id: seller.created_by,
                        email: 'Error loading admin',
                        name: `Admin ID: ${seller.created_by}`
                    };
                }
                
                return {
                    ...seller,
                    tickets_sold: actualTicketsSold, // Use real count
                    quotaUsed: actualTicketsSold,
                    quotaRemaining,
                    quotaPercentage: Math.round(quotaPercentage * 100) / 100,
                    totalRevenue,
                    createdByAdmin
                };
            }));

            return {
                success: true,
                data: sellersWithStats,
                total: sellersWithStats.length
            };

        } catch (error) {
            console.error('💥 Get all sellers error:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    static async revokeSeller(adminId, sellerId) {
        try {
            console.log(`⚠️ Admin ${adminId} revoking seller: ${sellerId}`);

            // Update seller status
            const { data: seller, error } = await supabase
                .from('sellers')
                .update({
                    is_active: false
                })
                .eq('id', sellerId)
                .select(`
                    id,
                    name,
                    email,
                    is_active,
                    quota
                `)
                .single();

            if (error) throw error;

            // Update all valid tickets to revoked status
            const { error: ticketError } = await supabase
                .from('tickets')
                .update({ status: 'revoked' })
                .eq('seller_id', sellerId)
                .eq('status', 'valid');

            if (ticketError) {
                console.error('Failed to revoke tickets:', ticketError);
            }

            // Get updated stats
            const { data: tickets } = await supabase
                .from('tickets')
                .select('ticket_price')
                .eq('seller_id', sellerId);

            const actualTicketsSold = tickets?.length || 0;
            const totalRevenue = tickets?.reduce((sum, ticket) => sum + (parseFloat(ticket.ticket_price) || 0), 0) || 0;

            return {
                success: true,
                data: {
                    ...seller,
                    tickets_sold: actualTicketsSold,
                    quotaRemaining: Math.max(0, seller.quota - actualTicketsSold),
                    quotaPercentage: seller.quota > 0 ? (actualTicketsSold / seller.quota) * 100 : 0,
                    totalRevenue
                },
                message: 'Seller revoked - all tickets suspended'
            };

        } catch (error) {
            console.error('💥 Revoke seller error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    static async restoreSeller(adminId, sellerId) {
        try {
            console.log(`✅ Admin ${adminId} restoring seller: ${sellerId}`);

            // Update seller status
            const { data: seller, error } = await supabase
                .from('sellers')
                .update({
                    is_active: true
                })
                .eq('id', sellerId)
                .select(`
                    id,
                    name,
                    email,
                    is_active,
                    quota
                `)
                .single();

            if (error) throw error;

            // Restore revoked tickets back to valid (payment received)
            const { error: ticketError } = await supabase
                .from('tickets')
                .update({ status: 'valid' })
                .eq('seller_id', sellerId)
                .eq('status', 'revoked');

            if (ticketError) {
                console.error('Failed to restore tickets:', ticketError);
            }

            // Get updated stats
            const { data: tickets } = await supabase
                .from('tickets')
                .select('ticket_price')
                .eq('seller_id', sellerId);

            const actualTicketsSold = tickets?.length || 0;
            const totalRevenue = tickets?.reduce((sum, ticket) => sum + (parseFloat(ticket.ticket_price) || 0), 0) || 0;

            return {
                success: true,
                data: {
                    ...seller,
                    tickets_sold: actualTicketsSold,
                    quotaRemaining: Math.max(0, seller.quota - actualTicketsSold),
                    quotaPercentage: seller.quota > 0 ? (actualTicketsSold / seller.quota) * 100 : 0,
                    totalRevenue
                },
                message: 'Seller restored - all tickets reactivated'
            };

        } catch (error) {
            console.error('💥 Restore seller error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    static async updateSellerQuota(adminId, sellerId, newQuota) {
        try {
            console.log(`📊 Admin ${adminId} updating quota for seller ${sellerId}: ${newQuota}`);

            const { data: seller, error } = await supabase
                .from('sellers')
                .update({
                    quota: newQuota,
                    updated_at: new Date().toISOString()
                })
                .eq('id', sellerId)
                .select(`
                    id,
                    name,
                    email,
                    quota,
                    tickets_sold
                `)
                .single();

            if (error) throw error;

            return {
                success: true,
                data: {
                    ...seller,
                    quotaRemaining: Math.max(0, newQuota - (seller.tickets_sold || 0))
                },
                message: `Quota updated to ${newQuota}`
            };

        } catch (error) {
            console.error('💥 Update quota error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    static async getAdminDashboard(adminId) {
        try {
            console.log(`📊 Getting admin dashboard for: ${adminId}`);

            // Get admin-specific stats with current event info
            // Get events admin created
            const { data: createdEvents } = await supabase
                .from('events')
                .select('id, name, is_active, event_date, location, max_capacity, ticket_price, created_by')
                .eq('created_by', adminId);

            // Get events admin is co-admin of
            const { data: coAdminEvents } = await supabase
                .from('event_admins')
                .select(`
                    events (
                        id, name, is_active, event_date, location, max_capacity, ticket_price, created_by
                    )
                `)
                .eq('admin_id', adminId);

            // Combine all events admin has access to
            const adminEvents = [...(createdEvents || [])];
            if (coAdminEvents) {
                coAdminEvents.forEach(ea => {
                    if (ea.events && !adminEvents.find(e => e.id === ea.events.id)) {
                        adminEvents.push(ea.events);
                    }
                });
            }

            const eventIds = adminEvents.map(e => e.id);

            const [sellersResult, ticketsResult] = await Promise.all([
                eventIds.length > 0 
                    ? supabase.from('sellers').select('id, is_active, tickets_sold, quota').in('event_id', eventIds)
                    : { data: [] },
                eventIds.length > 0
                    ? supabase.from('tickets').select('id, status, ticket_price, generated_at, event_id').in('event_id', eventIds)
                    : { data: [] }
            ]);

            const sellers = sellersResult.data || [];
            const tickets = ticketsResult.data || [];
            const events = adminEvents || [];
            const currentEvent = null; // No auto-selected event
            console.log('🎪 Backend Admin Events:', events.length);

            // Calculate stats
            const totalSellers = sellers.length;
            const activeSellers = sellers.filter(s => s.is_active).length;
            const totalTickets = tickets.length;
            const validTickets = tickets.filter(t => t.status === 'valid').length;
            const usedTickets = tickets.filter(t => t.status === 'used').length;
            const revokedTickets = tickets.filter(t => t.status === 'revoked').length;

            // Calculate revenue from actual ticket prices
            const totalRevenue = tickets.reduce((sum, ticket) => {
                return sum + (parseFloat(ticket.ticket_price) || 0);
            }, 0);

            const totalQuota = sellers.reduce((sum, seller) => sum + (parseInt(seller.quota) || 0), 0);
            const quotaUsed = sellers.reduce((sum, seller) => sum + (parseInt(seller.tickets_sold) || 0), 0);

            // Recent activity (last 10 tickets)
            const { data: recentTickets } = await supabase
                .from('tickets')
                .select(`
                    ticket_number,
                    buyer_name,
                    status,
                    generated_at,
                    sellers (name),
                    events (name)
                `)
                .order('generated_at', { ascending: false })
                .limit(10);

            return {
                success: true,
                data: {
                    overview: {
                        totalSellers,
                        activeSellers,
                        inactiveSellers: totalSellers - activeSellers,
                        totalEvents: events.length,
                        activeEvents: events.filter(e => e.is_active).length
                    },
                    tickets: {
                        total: totalTickets,
                        valid: validTickets,
                        used: usedTickets,
                        revoked: revokedTickets
                    },
                    revenue: {
                        total: totalRevenue,
                        average: totalTickets > 0 ? totalRevenue / totalTickets : 0
                    },
                    quota: {
                        total: totalQuota,
                        used: quotaUsed,
                        remaining: totalQuota - quotaUsed,
                        percentage: totalQuota > 0 ? (quotaUsed / totalQuota) * 100 : 0
                    },
                    currentEvent: null,
                    adminEvents: events,
                    recentActivity: recentTickets || []
                }
            };

        } catch (error) {
            console.error('💥 Admin dashboard error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    static async getAllTickets(filters = {}) {
        try {
            console.log('🎫 Getting all tickets for admin');

            let query = supabase
                .from('tickets')
                .select(`
                    id,
                    ticket_number,
                    buyer_name,
                    buyer_phone,
                    ticket_price,
                    status,
                    generated_at,
                    used_at,
                    events (
                        name,
                        event_date,
                        location
                    ),
                    sellers (
                        name,
                        email,
                        is_active
                    )
                `)
                .order('generated_at', { ascending: false });

            if (filters.status) {
                query = query.eq('status', filters.status);
            }

            if (filters.sellerId) {
                query = query.eq('seller_id', filters.sellerId);
            }

            if (filters.eventId) {
                query = query.eq('event_id', filters.eventId);
            }

            if (filters.limit) {
                query = query.limit(filters.limit);
            }

            const { data: tickets, error } = await query;

            if (error) throw error;

            return {
                success: true,
                data: tickets || [],
                total: tickets?.length || 0
            };

        } catch (error) {
            console.error('💥 Get all tickets error:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    static async updateSeller(adminId, sellerId, updateData) {
        try {
            console.log(`📝 Admin ${adminId} updating seller: ${sellerId}`);

            const allowedFields = ['name', 'email', 'quota'];
            const updates = {};

            for (const field of allowedFields) {
                if (updateData[field] !== undefined) {
                    updates[field] = updateData[field];
                }
            }

            if (Object.keys(updates).length === 0) {
                throw new Error('No valid fields to update');
            }

            updates.updated_at = new Date().toISOString();

            const { data: seller, error } = await supabase
                .from('sellers')
                .update(updates)
                .eq('id', sellerId)
                .select(`
                    id,
                    name,
                    email,
                    quota,
                    tickets_sold,
                    is_active
                `)
                .single();

            if (error) throw error;

            // Get real-time ticket count and revenue
            const { data: tickets } = await supabase
                .from('tickets')
                .select('ticket_price')
                .eq('seller_id', sellerId);

            const actualTicketsSold = tickets?.length || 0;
            const totalRevenue = tickets?.reduce((sum, ticket) => sum + (parseFloat(ticket.ticket_price) || 0), 0) || 0;

            return {
                success: true,
                data: {
                    ...seller,
                    tickets_sold: actualTicketsSold,
                    quotaRemaining: Math.max(0, seller.quota - actualTicketsSold),
                    quotaPercentage: seller.quota > 0 ? (actualTicketsSold / seller.quota) * 100 : 0,
                    totalRevenue
                },
                message: 'Seller updated successfully'
            };

        } catch (error) {
            console.error('💥 Update seller error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    static async deleteSeller(adminId, sellerId) {
        try {
            console.log(`🗑️ Admin ${adminId} deleting seller: ${sellerId}`);

            // Check if seller has tickets
            const { data: tickets } = await supabase
                .from('tickets')
                .select('id')
                .eq('seller_id', sellerId)
                .limit(1);

            if (tickets && tickets.length > 0) {
                throw new Error('Cannot delete seller with existing tickets. Deactivate instead.');
            }

            const { error } = await supabase
                .from('sellers')
                .delete()
                .eq('id', sellerId);

            if (error) throw error;

            return {
                success: true,
                message: 'Seller deleted successfully'
            };

        } catch (error) {
            console.error('💥 Delete seller error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    static async getSellerTickets(sellerId) {
        try {
            console.log(`🎫 Getting tickets for seller: ${sellerId}`);

            const { data: tickets, error } = await supabase
                .from('tickets')
                .select(`
                    id,
                    ticket_number,
                    buyer_name,
                    buyer_phone,
                    ticket_price,
                    status,
                    generated_at,
                    used_at
                `)
                .eq('seller_id', sellerId)
                .order('generated_at', { ascending: false });

            if (error) throw error;

            // Calculate statistics
            const totalTickets = tickets?.length || 0;
            const validTickets = tickets?.filter(t => t.status === 'valid').length || 0;
            const usedTickets = tickets?.filter(t => t.status === 'used').length || 0;
            const revokedTickets = tickets?.filter(t => t.status === 'revoked').length || 0;
            const totalRevenue = tickets?.reduce((sum, ticket) => sum + (parseFloat(ticket.ticket_price) || 0), 0) || 0;

            return {
                success: true,
                data: tickets || [],
                total: totalTickets,
                stats: {
                    totalTickets,
                    validTickets,
                    usedTickets,
                    revokedTickets,
                    totalRevenue,
                    averagePrice: totalTickets > 0 ? totalRevenue / totalTickets : 0
                }
            };

        } catch (error) {
            console.error('💥 Get seller tickets error:', error);
            return {
                success: false,
                error: error.message,
                data: [],
                stats: {
                    totalTickets: 0,
                    validTickets: 0,
                    usedTickets: 0,
                    revokedTickets: 0,
                    totalRevenue: 0,
                    averagePrice: 0
                }
            };
        }
    }

    static async revokeTicket(adminId, ticketId) {
        try {
            console.log(`⚠️ Admin ${adminId} revoking ticket: ${ticketId}`);

            const { data: ticket, error } = await supabase
                .from('tickets')
                .update({ status: 'revoked' })
                .eq('id', ticketId)
                .select('id, ticket_number, status')
                .single();

            if (error) throw error;

            return {
                success: true,
                data: ticket,
                message: 'Ticket revoked successfully'
            };

        } catch (error) {
            console.error('💥 Revoke ticket error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    static async restoreTicket(adminId, ticketId) {
        try {
            console.log(`✅ Admin ${adminId} restoring ticket: ${ticketId}`);

            const { data: ticket, error } = await supabase
                .from('tickets')
                .update({ status: 'valid' })
                .eq('id', ticketId)
                .select('id, ticket_number, status')
                .single();

            if (error) throw error;

            return {
                success: true,
                data: ticket,
                message: 'Ticket restored successfully'
            };

        } catch (error) {
            console.error('💥 Restore ticket error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = AdminService;