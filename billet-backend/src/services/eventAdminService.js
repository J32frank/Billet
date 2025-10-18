const supabase = require('../config/database');

class EventAdminService {
    static async addAdminToEvent(eventId, adminEmail, addedByAdminId) {
        try {
            console.log(`👑 Adding admin ${adminEmail} to event ${eventId}`);

            // Check if event exists
            const { data: event, error: eventError } = await supabase
                .from('events')
                .select('id, created_by')
                .eq('id', eventId)
                .single();

            console.log('🎪 Event lookup:', { event, eventError, eventId });

            if (eventError || !event) {
                throw new Error(`Event not found: ${eventId}`);
            }

            // Find admin by email in auth.users
            const { data: admin, error: adminError } = await supabase.auth.admin.listUsers();
            
            const foundAdmin = admin?.users?.find(user => user.email === adminEmail);
            
            console.log('🔍 Admin lookup result:', { foundAdmin, adminError, email: adminEmail });

            if (!foundAdmin) {
                throw new Error(`Admin not found with email: ${adminEmail}`);
            }

            // Check current admin count
            const { data: currentAdmins } = await supabase
                .from('event_admins')
                .select('id')
                .eq('event_id', eventId);

            if (currentAdmins && currentAdmins.length >= 3) {
                throw new Error('Maximum 3 admins allowed per event');
            }

            // Check if admin already added
            const { data: existing } = await supabase
                .from('event_admins')
                .select('id')
                .eq('event_id', eventId)
                .eq('admin_id', admin.id)
                .single();

            if (existing) {
                throw new Error('Admin already has access to this event');
            }

            // Add admin to event
            const { data: eventAdmin, error } = await supabase
                .from('event_admins')
                .insert([{
                    event_id: eventId,
                    admin_id: foundAdmin.id,
                    role: 'co-admin',
                    added_by: addedByAdminId,
                    added_at: new Date().toISOString()
                }])
                .select('id, role, added_at, admin_id')
                .single();

            console.log('📝 Insert result:', { eventAdmin, error });
            if (error) throw error;

            return {
                success: true,
                data: {
                    ...eventAdmin,
                    users: {
                        id: foundAdmin.id,
                        email: foundAdmin.email,
                        name: foundAdmin.user_metadata?.name || foundAdmin.email
                    }
                },
                message: `Admin ${adminEmail} added to event`
            };

        } catch (error) {
            console.error('💥 Add admin to event error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    static async removeAdminFromEvent(eventId, adminId, removedByAdminId) {
        try {
            console.log(`🗑️ Removing admin ${adminId} from event ${eventId}`);

            // Cannot remove event creator
            const { data: event } = await supabase
                .from('events')
                .select('created_by')
                .eq('id', eventId)
                .single();

            if (event && event.created_by === adminId) {
                throw new Error('Cannot remove event creator');
            }

            const { error } = await supabase
                .from('event_admins')
                .delete()
                .eq('event_id', eventId)
                .eq('admin_id', adminId);

            if (error) throw error;

            return {
                success: true,
                message: 'Admin removed from event'
            };

        } catch (error) {
            console.error('💥 Remove admin from event error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    static async getEventAdmins(eventId) {
        try {
            console.log(`📋 Getting admins for event ${eventId}`);

            // Get event details
            const { data: event } = await supabase
                .from('events')
                .select('id, name, created_by')
                .eq('id', eventId)
                .single();

            // Get all auth users
            const { data: authData } = await supabase.auth.admin.listUsers();
            const authUsers = authData?.users || [];

            // Get additional admins from event_admins table
            const { data: eventAdmins } = await supabase
                .from('event_admins')
                .select('id, role, added_at, admin_id')
                .eq('event_id', eventId);

            const admins = [];

            // Add creator as owner
            if (event?.created_by) {
                const creator = authUsers.find(user => user.id === event.created_by);
                if (creator) {
                    admins.push({
                        id: creator.id,
                        email: creator.email,
                        name: creator.user_metadata?.name || creator.email,
                        role: 'owner',
                        added_at: null,
                        is_creator: true
                    });
                }
            }

            // Add co-admins
            if (eventAdmins) {
                for (const ea of eventAdmins) {
                    const adminUser = authUsers.find(user => user.id === ea.admin_id);
                    if (adminUser) {
                        admins.push({
                            id: adminUser.id,
                            email: adminUser.email,
                            name: adminUser.user_metadata?.name || adminUser.email,
                            role: ea.role,
                            added_at: ea.added_at,
                            is_creator: false
                        });
                    }
                }
            }

            console.log('📋 Found admins:', admins);

            return {
                success: true,
                data: admins,
                total: admins.length
            };

        } catch (error) {
            console.error('💥 Get event admins error:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    static async checkAdminEventAccess(adminId, eventId) {
        try {
            // Check if admin is creator
            const { data: event } = await supabase
                .from('events')
                .select('created_by')
                .eq('id', eventId)
                .eq('created_by', adminId)
                .single();

            if (event) {
                return { hasAccess: true, role: 'owner' };
            }

            // Check if admin is co-admin
            const { data: eventAdmin } = await supabase
                .from('event_admins')
                .select('role')
                .eq('event_id', eventId)
                .eq('admin_id', adminId)
                .single();

            if (eventAdmin) {
                return { hasAccess: true, role: eventAdmin.role };
            }

            return { hasAccess: false, role: null };

        } catch (error) {
            console.error('💥 Check admin access error:', error);
            return { hasAccess: false, role: null };
        }
    }
}

module.exports = EventAdminService;