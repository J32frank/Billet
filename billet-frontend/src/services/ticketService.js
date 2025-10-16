const API_BASE_URL = `${import.meta.env.VITE_BILLET_BACKEND_URL || 'http://localhost:8000'}/api`;

class TicketService {
  static async getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  static async generateTicket(ticketData) {
    try {
      const headers = await this.getAuthHeaders();
      
      // Format the data to match backend expectations
      const formattedData = {
        buyerName: ticketData.buyerName,
        buyerPhone: ticketData.phone,
        buyerEmail: ticketData.email
      };

      console.log('🎫 Generating ticket with data:', formattedData);
      console.log('🔗 API URL:', `${API_BASE_URL}/tickets/generate`);

      const response = await fetch(`${API_BASE_URL}/tickets/generate`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formattedData)
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`HTTP ${response.status}: Failed to generate ticket`);
      }

      const data = await response.json();
      console.log('✅ Ticket generated:', data);
      
      return {
        success: true,
        data: data.data,
        message: data.message || 'Ticket generated successfully'
      };
    } catch (error) {
      console.error('💥 Generate ticket error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async getSellerTickets() {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/tickets/seller`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: Failed to fetch tickets`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data.data || []
      };
    } catch (error) {
      console.error('Get tickets error:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }
}

export default TicketService;