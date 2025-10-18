#!/usr/bin/env node

/**
 * Admin API Test Script
 * Tests all admin endpoints used by the AdminStatsPage
 */

require('dotenv').config();
const axios = require('axios');

const BASE_URL = process.env.BACKEND_URL || 'http://localhost:8000';

// Test admin credentials (you'll need to replace with actual admin token)
const ADMIN_TOKEN = 'your-admin-jwt-token-here';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
    }
});

async function testEndpoint(name, method, url, data = null) {
    try {
        console.log(`\n🧪 Testing ${name}...`);
        
        let response;
        if (method === 'GET') {
            response = await api.get(url);
        } else if (method === 'POST') {
            response = await api.post(url, data);
        } else if (method === 'PUT') {
            response = await api.put(url, data);
        }
        
        console.log(`✅ ${name} - Status: ${response.status}`);
        console.log(`📊 Response:`, JSON.stringify(response.data, null, 2));
        
        return response.data;
    } catch (error) {
        console.log(`❌ ${name} - Error: ${error.response?.status || 'Network Error'}`);
        console.log(`💥 Error details:`, error.response?.data || error.message);
        return null;
    }
}

async function runTests() {
    console.log('🚀 Starting Admin API Tests...');
    console.log(`🔗 Base URL: ${BASE_URL}`);
    
    // Test 1: Admin Dashboard
    await testEndpoint('Admin Dashboard', 'GET', '/api/admin/dashboard');
    
    // Test 2: Get All Sellers
    await testEndpoint('Get All Sellers', 'GET', '/api/admin/sellers');
    
    // Test 3: Get All Tickets
    await testEndpoint('Get All Tickets', 'GET', '/api/admin/all-tickets?limit=10');
    
    // Test 4: Get Admin Events
    await testEndpoint('Get Admin Events', 'GET', '/api/admin/events');
    
    // Test 5: Health Check
    await testEndpoint('Health Check', 'GET', '/health');
    
    console.log('\n🏁 Admin API Tests Complete!');
    console.log('\n📝 Instructions:');
    console.log('1. Replace ADMIN_TOKEN with a valid admin JWT token');
    console.log('2. Ensure the backend server is running on port 8000');
    console.log('3. Check that all endpoints return success responses');
}

// Run the tests
runTests().catch(console.error);