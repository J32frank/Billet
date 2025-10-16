import React, { createContext, useContext, useState, useEffect} from 'react';

const AuthContext = createContext();





export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr ] = useState(null);
    const [currentEvent, setCurrentEventState] = useState(null);


    useEffect(() => {
        checkExistingAuth();
    }, [])

    const checkExistingAuth = async() => {
        try{
            const token  = localStorage.getItem('token');
            const userData = localStorage.getItem('user');


            if(token && userData) {
                const isViled = await verifyToken(token);

                if(isViled) {
                    setUser(JSON.parse(userData));
                    // Load current event from localStorage
                    const eventData = localStorage.getItem('currentEvent');
                    if (eventData) {
                        setCurrentEventState(JSON.parse(eventData));
                    }
                } else{
                    clearAuthStorage();
                    setLoading(false);
                }
            } else{
                setLoading(false)
            }
        } catch (e) {
            console.log('Auth Check faild', e.message);
            clearAuthStorage()
        } finally{
            setLoading(false)
        }
    } 

    const clearAuthStorage = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('eventId');
        localStorage.removeItem('currentEvent');
        setUser(null);
        setCurrentEventState(null);
    }

   const verifyToken = async (token) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BILLET_BACKEND_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.ok;  // true if 200, false if 401/500
    } catch {
        return false;
    }
}

    // login

    const login = async(email, password) => {
        try{
            setErr(null);
            setLoading(true);

            console.log('🔄 Attempting login to:', `${import.meta.env.VITE_BILLET_BACKEND_URL}/api/auth/login`);
            console.log('📧 Email:', email);

            const response = await fetch(`${import.meta.env.VITE_BILLET_BACKEND_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({email, password})
            });
            
            console.log('📡 Response status:', response.status);
            
            const responseData = await response.json();
            console.log('📦 Response data:', responseData);
            
            if(!response.ok) {
                throw new Error(responseData.error || 'Login failed');
            }
            
            const { user: userData, token, eventId, currentEvent } = responseData;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            if (eventId) {
                localStorage.setItem('eventId', eventId);
            }
            if (currentEvent) {
                localStorage.setItem('currentEvent', JSON.stringify(currentEvent));
                setCurrentEventState(currentEvent);
            }
            setUser(userData);
            
            console.log('🎪 Current event set:', currentEvent);
            
            // If seller doesn't have currentEvent, try to fetch it
            if (userData.role === 'seller' && !currentEvent) {
                console.log('🔍 Seller missing event, fetching...');
                try {
                    const eventResponse = await fetch(`${import.meta.env.VITE_BILLET_BACKEND_URL}/api/seller/event`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    if (eventResponse.ok) {
                        const eventResult = await eventResponse.json();
                        if (eventResult.success && eventResult.data) {
                            localStorage.setItem('currentEvent', JSON.stringify(eventResult.data));
                            setCurrentEventState(eventResult.data);
                            console.log('✅ Seller event fetched:', eventResult.data.name);
                        }
                    }
                } catch (fetchError) {
                    console.log('❌ Failed to fetch seller event:', fetchError.message);
                }
            }

            console.log('✅ Login successful, user role:', userData.role);
            return { success: true}
        } catch(e) {
            console.log('❌ Login error:', e.message);
            setErr(e.message);
            return { success: false, error: e.message};
        } finally {
            setLoading(false)
        }
    }

    const logout = () => {
        clearAuthStorage();
        setUser(null);
    }


    const clearError = () =>  setErr(null);


    const setCurrentEvent = (eventData) => {
        try {
            localStorage.setItem('eventId', eventData.id);
            localStorage.setItem('currentEvent', JSON.stringify(eventData));
            setCurrentEventState(eventData);
        } catch (e) {
            console.error('Error storing currentEvent:', e);
        }
    };
    
    const refreshCurrentEvent = async () => {
        if (!user) return;
        
        try {
            const token = localStorage.getItem('token');
            if (user.role === 'seller') {
                const response = await fetch(`${import.meta.env.VITE_BILLET_BACKEND_URL}/api/seller/event`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.data) {
                        localStorage.setItem('currentEvent', JSON.stringify(result.data));
                        setCurrentEventState(result.data);
                        return result.data;
                    }
                }
            }
        } catch (error) {
            console.error('Failed to refresh current event:', error);
        }
        return null;
    };

    const value = {
        user,
        loading,
        err,
        eventId: localStorage.getItem('eventId'),
        currentEvent,

        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isSeller: user?.role === 'seller',

        login,
        logout,
        clearError,
        setCurrentEvent,
        refreshCurrentEvent
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )

}

export function useAuth() {
    const context = useContext(AuthContext);

    if(!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }

    return context
}


export default AuthContext;