const supabase = require('../config/database');
const { hashPassword } = require('../utils/password');

class SellerService {
    // === SELLER MANAGEMENT METHODS (Your Existing Code) ===
    
    static async createSeller(sellerData, adminId) {
        try {
            console.log('🔧 [createSeller] Starting seller creation');
            console.log('🔧 [createSeller] sellerData:', sellerData);
            console.log('🔧 [createSeller] adminId:', adminId);

            const { name, email, password, quota, eventId, is_active = true } = sellerData;

            // Check if email already exists
            const { data: existingSeller } = await supabase
                .from('sellers')
                .select('id')
                .eq('email', email)
                .single();

            if (existingSeller) {
                return { success: false, error: 'Email already registered' };
            }

            // Hash password
            const passwordHash = await hashPassword(password);
            
            // Prepare insert data with ALL fields including event_id
            const insertData = {
                name,
                email,
                username: name.slice(0, 3) + email.slice(0, 3),
                password_hash: passwordHash,
                quota,
                event_id: eventId,
                is_active,
                created_by: adminId
            };

            console.log('🔧 [createSeller] Insert data:', insertData);

            const { data: seller, error } = await supabase
                .from('sellers')
                .insert([insertData])
                .select(`
                    id,
                    name,
                    email,
                    quota,
                    event_id,
                    is_active,
                    created_by,
                    events (name)
                `)
                .single();

            console.log('🔧 [createSeller] Insert result - error:', error);
            console.log('🔧 [createSeller] Insert result - data:', seller);

            if (error) throw error;

            return {
                success: true,
                data: seller
            };

        } catch (error) {
            console.log('💥 [createSeller] Error:', error.message);
            return { success: false, error: error.message };
        }
    }

    static async getSellerList(adminId) {
        try {
            console.log('🔧 [TEST] Bypassing admin check for testing');

            const { data: sellers, error } = await supabase
                .from('sellers')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return {
                success: true,
                data: sellers,
                message: 'TEST MODE: Admin check bypassed'
            };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    static async getSellerById(sellerId) {
        try{
            console.log("[getSellerId] Fetching seller:" , sellerId);
            const { data: seller, error } = await supabase
                .from('sellers')
                .select(`
                    id, 
                    name,
                    username,
                    email,
                    quota,
                    tickets_sold,
                    is_active,
                    is_revoked,
                    created_by,
                    admins(name)
               `)
                .eq('id', sellerId)
                .single();
            if (error) {
                console.log(" [getSellerById] Database error:", error.message);
                throw new Error("Seller not found: " + error.message);
            }
            if (!seller){
                console.log('No seller with ID:' , sellerId);
            }
            console.log('Seller found:', seller.email);
            return{
                success: true,
                data: seller
            };
        } catch (error) {
            console.log('Error:', error.message);
            return {
                success: false,
                error: error.message
            }
        }
    }

    static async updateSeller(sellerId, updateData) {
        try {
            console.log(' Updating seller:', sellerId);
            console.log(' Update Data:', updateData);

            const allowedFields = [ 'name', 'username', 'quota'];
            const validUpdateData = {};

            Object.keys(updateData).forEach(key => {
                if (allowedFields.includes(key )){
                    validUpdateData[key] = updateData[key];
                }
            });
            if (Object.keys(validUpdateData).length === 0) {
                throw new Error('No valid field to update');
            }

            const { data: seller, error } = await supabase
                .from('sellers')
                .update(validUpdateData)
                .eq('id', sellerId)
                .select(`
                  id,
                  name,
                  username,
                  email,
                  quota,
                  tickets_sold,
                  is_active,
                  is_revoked,
                  updated_at
                `)
                .single();
            if (error) throw new Error(`Update failed: ${error.message}`);
            if (!seller) throw new Error(" Seller not found");
            console.log('Seller updated successfully');
            return {
                success: true,
                data: seller,
                message: 'Seller updated successfully'
            }
        } catch (error) {
            console.log('Error:', error.message);
            return {
                success: false,
                error: error.message
            }
        }
    }

    static async checkQuota(sellerId) {
        try {
            console.log('🔧 [checkQuota] Checking quota for seller:', sellerId);

            const { data: seller, error } = await supabase
                .from('sellers')
                .select('quota, tickets_sold, is_active')
                .eq('id', sellerId)
                .single();

            if (error || !seller) {
                throw new Error('Seller not found');
            }

            const remaining = Math.max(0, seller.quota - seller.tickets_sold);
            const quotaInfo = {
                quota: seller.quota,
                ticketsSold: seller.tickets_sold,
                remaining: remaining,
                isActive: seller.is_active,
                canSell: seller.is_active && remaining > 0
            };

            console.log('✅ [checkQuota] Quota check result:', quotaInfo);
            return {
                success: true,
                data: quotaInfo
            };

        } catch (error) {
            console.log('💥 [checkQuota] Error:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    static async setSellerQuota(sellerId, newQuota) {
        try {
            console.log('🔧 [setSellerQuota] Setting quota for seller:', sellerId);
            console.log('🔧 [setSellerQuota] New quota:', newQuota);

            if (!newQuota || newQuota < 0) {
                throw new Error('Quota must be a positive number');
            }

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
                    tickets_sold,
                    updated_at
                `)
                .single();

            if (error) throw new Error(`Failed to set quota: ${error.message}`);
            if (!seller) throw new Error('Seller not found');

            console.log('✅ [setSellerQuota] Quota set successfully');
            return {
                success: true,
                data: {
                    seller: seller,
                    oldQuota: seller.quota,
                    newQuota: newQuota,
                    remaining: Math.max(0, newQuota - seller.tickets_sold)
                },
                message: `Quota set to ${newQuota} tickets`
            };

        } catch (error) {
            console.log('💥 [setSellerQuota] Error:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    static async addSellerQuota(sellerId, additionalTickets) {
        try {
            console.log('🔧 [addSellerQuota] Adding quota for seller:', sellerId);
            console.log('🔧 [addSellerQuota] Additional tickets:', additionalTickets);

            if (!additionalTickets || additionalTickets <= 0) {
                throw new Error('Additional tickets must be a positive number');
            }

            const { data: currentSeller, error: fetchError } = await supabase
                .from('sellers')
                .select('quota, tickets_sold, name')
                .eq('id', sellerId)
                .single();

            if (fetchError || !currentSeller) {
                throw new Error('Seller not found');
            }

            const newQuota = currentSeller.quota + additionalTickets;

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
                    tickets_sold,
                    updated_at
                `)
                .single();

            if (error) throw new Error(`Failed to add quota: ${error.message}`);

            console.log('✅ [addSellerQuota] Quota added successfully');
            return {
                success: true,
                data: {
                    seller: seller,
                    oldQuota: currentSeller.quota,
                    newQuota: newQuota,
                    ticketsAdded: additionalTickets,
                    remaining: Math.max(0, newQuota - seller.tickets_sold)
                },
                message: `Added ${additionalTickets} tickets to quota (new total: ${newQuota})`
            };

        } catch (error) {
            console.log('💥 [addSellerQuota] Error:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    static async canSellTickets(sellerId) {
        try {
            const result = await this.checkQuota(sellerId);

            if (!result.success) {
                return result;
            }

            const { quota, ticketsSold, remaining, isActive, canSell } = result.data;

            if (!isActive) {
                return {
                    success: false,
                    error: 'Account deactivated. Cannot generate tickets.'
                };
            }

            if (!canSell || remaining <= 0) {
                return {
                    success: false,
                    error: `You have used all ${quota} of your allocated tickets. Please contact your administrator to request more tickets.`
                };
            }

            return {
                success: true,
                data: result.data
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    static async deleteSeller(sellerId) {
        try {
            console.log('🔧 [deleteSeller] Soft deleting seller:', sellerId);

            const { data: seller, error: fetchError } = await supabase
                .from('sellers')
                .select(`
                    id,
                    name,
                    email,
                    tickets_sold,
                    tickets (id)
                `)
                .eq('id', sellerId)
                .single();

            if (fetchError || !seller) {
                throw new Error('Seller not found');
            }

            if (seller.tickets_sold > 0 || seller.tickets.length > 0) {
                throw new Error('Cannot delete seller with existing tickets. Deactivate instead.');
            }

            const { data: deletedSeller, error } = await supabase
                .from('sellers')
                .update({
                    is_active: false,
                    is_approved: false,
                    deleted_at: new Date().toISOString()
                })
                .eq('id', sellerId)
                .select(`
                    id,
                    name,
                    email,
                    is_active,
                    deleted_at
                `)
                .single();

            if (error) throw new Error(`Deletion failed: ${error.message}`);

            console.log('✅ [deleteSeller] Seller soft deleted successfully');
            return {
                success: true,
                data: deletedSeller,
                message: 'Seller account deactivated and marked for deletion'
            };

        } catch (error) {
            console.log('💥 [deleteSeller] Error:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // === SELLER DASHBOARD METHODS (New Additions) ===

    static async getSellerTickets(sellerId, filters = {}) {
        try {
            console.log(`📋 Getting tickets for seller: ${sellerId}`);
            
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
                    events (
                        name,
                        event_date,
                        location
                    )
                `)
                .eq('seller_id', sellerId)
                .order('generated_at', { ascending: false });

            if (filters.status) {
                query = query.eq('status', filters.status);
            }

            if (filters.eventId) {
                query = query.eq('event_id', filters.eventId);
            }

            if (filters.search) {
                query = query.or(`buyer_name.ilike.%${filters.search}%,ticket_number.ilike.%${filters.search}%`);
            }

            const { data: tickets, error } = await query;

            if (error) throw error;

            console.log(`✅ Found ${tickets?.length || 0} tickets for seller`);
            
            return {
                success: true,
                data: tickets || [],
                total: tickets?.length || 0
            };

        } catch (error) {
            console.error('❌ Failed to get seller tickets:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    static async getSellerStats(sellerId) {
        try {
            console.log(`📊 Getting stats for seller: ${sellerId}`);
            
            const { data: tickets, error: ticketsError } = await supabase
                .from('tickets')
                .select('status, ticket_price')
                .eq('seller_id', sellerId);

            if (ticketsError) throw ticketsError;

            const totalTickets = tickets.length;
            const validTickets = tickets.filter(t => t.status === 'valid').length;
            const usedTickets = tickets.filter(t => t.status === 'used').length;
            const revokedTickets = tickets.filter(t => t.status === 'revoked').length;
            
            const totalRevenue = tickets.reduce((sum, ticket) => {
                return sum + (parseFloat(ticket.ticket_price) || 0);
            }, 0);

            const { data: seller, error: sellerError } = await supabase
                .from('sellers')
                .select('quota, tickets_sold')
                .eq('id', sellerId)
                .single();

            if (sellerError) throw sellerError;

            const quotaRemaining = Math.max(0, seller.quota - (seller.tickets_sold || 0));

            const { data: recentTickets, error: recentError } = await supabase
                .from('tickets')
                .select(`
                    ticket_number,
                    buyer_name,
                    generated_at,
                    status,
                    events (name)
                `)
                .eq('seller_id', sellerId)
                .order('generated_at', { ascending: false })
                .limit(5);

            if (recentError) throw recentError;

            return {
                success: true,
                data: {
                    totals: {
                        all: totalTickets,
                        valid: validTickets,
                        used: usedTickets,
                        revoked: revokedTickets
                    },
                    revenue: {
                        total: totalRevenue,
                        average: totalTickets > 0 ? totalRevenue / totalTickets : 0
                    },
                    quota: {
                        total: seller.quota,
                        used: seller.tickets_sold || 0,
                        remaining: quotaRemaining,
                        percentageUsed: seller.quota > 0 ? ((seller.tickets_sold || 0) / seller.quota) * 100 : 0
                    },
                    recentActivity: recentTickets || []
                }
            };

        } catch (error) {
            console.error('❌ Failed to get seller stats:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    static async getSellerProfile(sellerId) {
        try {
            console.log(`👤 Getting profile for seller: ${sellerId}`);
            
            const { data: seller, error } = await supabase
                .from('sellers')
                .select(`
                    id,
                    name,
                    email,
                    username,
                    quota,
                    tickets_sold,
                    is_active,
                    created_at,
                    created_by,
                    updated_at,
                    events (name)
                `)
                .eq('id', sellerId)
                .single();

            if (error) throw error;

            return {
                success: true,
                data: seller
            };

        } catch (error) {
            console.error('❌ Failed to get seller profile:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    static async updateSellerProfile(sellerId, updateData) {
        try {
            console.log(`✏️ Updating profile for seller: ${sellerId}`, updateData);
            
            const allowedFields = ['name', 'email', 'username'];
            const filteredUpdate = {};
            
            allowedFields.forEach(field => {
                if (updateData[field] !== undefined) {
                    filteredUpdate[field] = updateData[field];
                }
            });

            filteredUpdate.updated_at = new Date().toISOString();

            const { data: seller, error } = await supabase
                .from('sellers')
                .update(filteredUpdate)
                .eq('id', sellerId)
                .select()
                .single();

            if (error) throw error;

            return {
                success: true,
                data: seller,
                message: 'Profile updated successfully'
            };

        } catch (error) {
            console.error('❌ Failed to update seller profile:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = SellerService;