const API_BASE_URL = `${import.meta.env.VITE_BILLET_BACKEND_URL || 'http://localhost:8000'}/api`;

class EventService {
  static async getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  static async getAllEvents() {
    try {
      const headers = await this.getAuthHeaders();
      console.log('🔍 Fetching events from:', `${API_BASE_URL}/events`);
      console.log('🔍 Headers:', headers);
      
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'GET',
        headers
      });

      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔍 Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('🔍 Response data:', data);
      
      return {
        success: true,
        data: data.data || [],
        total: data.total || 0
      };
    } catch (error) {
      console.error('Get events error:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  static async createEvent(eventData) {
    try {
      const headers = await this.getAuthHeaders();
      
      // Format the data to match backend expectations exactly
      const formattedData = {
        name: eventData.eventName,
        description: eventData.description || '',
        event_date: `${eventData.eventDate}T${eventData.eventTime}:00.000Z`,
        location: eventData.location,
        max_capacity: parseInt(eventData.maxCapacity) || 100,
        ticket_price: parseFloat(eventData.ticketPrice) || 0
      };

      console.log('🎪 Creating event with data:', formattedData);
      console.log('🔗 API URL:', `${API_BASE_URL}/events`);

      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formattedData)
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`HTTP ${response.status}: Failed to create event`);
      }

      const data = await response.json();
      console.log('✅ Event created:', data);
      
      return {
        success: true,
        data: data.data,
        message: data.message || 'Event created successfully'
      };
    } catch (error) {
      console.error('💥 Create event error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async getSellerEvent() {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/seller/event`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Get seller event error:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }
}

export default EventService;