const supabase = require('../config/database');

class EventsService {
    static async createEvent(adminId, eventData) {
        try {
            console.log(`🎪 Admin ${adminId} creating event: ${eventData.name}`);

            const { name, description, event_date, location, max_capacity, ticket_price } = eventData;

            // Validate required fields
            if (!name || !event_date || !location || !max_capacity || !ticket_price) {
                throw new Error('Name, event date, location, max capacity, and ticket price are required');
            }

            // Create event
            const { data: event, error } = await supabase
                .from('events')
                .insert([
                    {
                        name,
                        description,
                        event_date,
                        location,
                        max_capacity: parseInt(max_capacity),
                        ticket_price: parseFloat(ticket_price),
                        tickets_sold: 0,
                        is_active: true,
                        created_by: adminId,
                        created_at: new Date().toISOString()
                    }
                ])
                .select(`
                    id,
                    name,
                    description,
                    event_date,
                    location,
                    max_capacity,
                    ticket_price,
                    tickets_sold,
                    is_active,
                    created_at
                `)
                .single();

            if (error) throw error;

            console.log(`✅ Event created successfully: ${event.id}`);
            return {
                success: true,
                data: event,
                message: 'Event created successfully'
            };

        } catch (error) {
            console.error('💥 Create event error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    static async getAllEvents(filters = {}) {
        try {
            console.log('📋 Getting all events');

            let query = supabase
                .from('events')
                .select(`
                    id,
                    name,
                    description,
                    event_date,
                    location,
                    max_capacity,
                    ticket_price,
                    tickets_sold,
                    is_active,
                    created_at
                `)
                .order('event_date', { ascending: true });

            if (filters.isActive !== undefined) {
                query = query.eq('is_active', filters.isActive);
            }

            if (filters.upcoming) {
                query = query.gte('event_date', new Date().toISOString());
            }

            const { data: events, error } = await query;

            if (error) throw error;

            // Add calculated fields
            const eventsWithStats = events.map(event => ({
                ...event,
                capacity_remaining: Math.max(0, event.max_capacity - (event.tickets_sold || 0)),
                capacity_percentage: event.max_capacity > 0 ? ((event.tickets_sold || 0) / event.max_capacity) * 100 : 0,
                is_sold_out: (event.tickets_sold || 0) >= event.max_capacity,
                days_until_event: Math.ceil((new Date(event.event_date) - new Date()) / (1000 * 60 * 60 * 24))
            }));

            return {
                success: true,
                data: eventsWithStats,
                total: eventsWithStats.length
            };

        } catch (error) {
            console.error('💥 Get all events error:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    static async getEventById(eventId) {
        try {
            console.log(`🎪 Getting event: ${eventId}`);

            const { data: event, error } = await supabase
                .from('events')
                .select(`
                    id,
                    name,
                    description,
                    event_date,
                    location,
                    max_capacity,
                    ticket_price,
                    tickets_sold,
                    is_active,
                    created_at
                `)
                .eq('id', eventId)
                .single();

            if (error || !event) {
                throw new Error('Event not found');
            }

            // Get assigned sellers count
            const { data: sellers } = await supabase
                .from('sellers')
                .select('id, name, is_active')
                .eq('event_id', eventId);

            const eventWithStats = {
                ...event,
                capacity_remaining: Math.max(0, event.max_capacity - (event.tickets_sold || 0)),
                capacity_percentage: event.max_capacity > 0 ? ((event.tickets_sold || 0) / event.max_capacity) * 100 : 0,
                is_sold_out: (event.tickets_sold || 0) >= event.max_capacity,
                days_until_event: Math.ceil((new Date(event.event_date) - new Date()) / (1000 * 60 * 60 * 24)),
                assigned_sellers: sellers || [],
                active_sellers: (sellers || []).filter(s => s.is_active).length
            };

            return {
                success: true,
                data: eventWithStats
            };

        } catch (error) {
            console.error('💥 Get event error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    static async updateEvent(eventId, updateData) {
        try {
            console.log(`📝 Updating event: ${eventId}`);

            // Validate allowed fields
            const allowedFields = ['name', 'description', 'event_date', 'location', 'max_capacity', 'ticket_price', 'is_active'];
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

            const { data: event, error } = await supabase
                .from('events')
                .update(updates)
                .eq('id', eventId)
                .select(`
                    id,
                    name,
                    description,
                    event_date,
                    location,
                    max_capacity,
                    ticket_price,
                    tickets_sold,
                    is_active,
                    updated_at
                `)
                .single();

            if (error) throw error;

            return {
                success: true,
                data: event,
                message: 'Event updated successfully'
            };

        } catch (error) {
            console.error('💥 Update event error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    static async deleteEvent(eventId) {
        try {
            console.log(`🗑️ Deleting event: ${eventId}`);

            // Check if event has tickets
            const { data: tickets } = await supabase
                .from('tickets')
                .select('id')
                .eq('event_id', eventId)
                .limit(1);

            if (tickets && tickets.length > 0) {
                throw new Error('Cannot delete event with existing tickets. Deactivate instead.');
            }

            // Check if event has assigned sellers
            const { data: sellers } = await supabase
                .from('sellers')
                .select('id')
                .eq('event_id', eventId)
                .limit(1);

            if (sellers && sellers.length > 0) {
                throw new Error('Cannot delete event with assigned sellers. Remove sellers first.');
            }

            const { error } = await supabase
                .from('events')
                .delete()
                .eq('id', eventId);

            if (error) throw error;

            return {
                success: true,
                message: 'Event deleted successfully'
            };

        } catch (error) {
            console.error('💥 Delete event error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    static async assignSellerToEvent(eventId, sellerId) {
        try {
            console.log(`🔗 Assigning seller ${sellerId} to event ${eventId}`);

            // Verify event exists
            const eventResult = await this.getEventById(eventId);
            if (!eventResult.success) {
                throw new Error('Event not found');
            }

            // Update seller's event assignment
            const { data: seller, error } = await supabase
                .from('sellers')
                .update({ event_id: eventId })
                .eq('id', sellerId)
                .select('id, name, email, event_id')
                .single();

            if (error) throw error;

            return {
                success: true,
                data: seller,
                message: 'Seller assigned to event successfully'
            };

        } catch (error) {
            console.error('💥 Assign seller error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    static async getEventStats(eventId) {
        try {
            console.log(`📊 Getting stats for event: ${eventId}`);

            // Get event details
            const eventResult = await this.getEventById(eventId);
            if (!eventResult.success) {
                throw new Error('Event not found');
            }

            // Get ticket stats
            const { data: tickets } = await supabase
                .from('tickets')
                .select('status, ticket_price, generated_at, sellers(name)')
                .eq('event_id', eventId);

            const totalTickets = tickets?.length || 0;
            const validTickets = tickets?.filter(t => t.status === 'valid').length || 0;
            const usedTickets = tickets?.filter(t => t.status === 'used').length || 0;
            const revokedTickets = tickets?.filter(t => t.status === 'revoked').length || 0;

            const totalRevenue = tickets?.reduce((sum, ticket) => {
                return sum + (parseFloat(ticket.ticket_price) || 0);
            }, 0) || 0;

            return {
                success: true,
                data: {
                    event: eventResult.data,
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
                    capacity: {
                        max: eventResult.data.max_capacity,
                        sold: eventResult.data.tickets_sold,
                        remaining: eventResult.data.capacity_remaining,
                        percentage: eventResult.data.capacity_percentage
                    }
                }
            };

        } catch (error) {
            console.error('💥 Event stats error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = EventsService;