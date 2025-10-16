// Quick test to verify backend connection
fetch('http://localhost:8000/health')
  .then(res => res.json())
  .then(data => console.log('✅ Backend connected:', data))
  .catch(err => console.log('❌ Backend connection failed:', err.message));

// Test login endpoint
fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@test.com', password: 'wrongpass' })
})
.then(res => res.json())
.then(data => console.log('✅ Login endpoint responds:', data))
.catch(err => console.log('❌ Login endpoint failed:', err.message));