import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('pp_token'));
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    async function verify() {
      if (!token) { setLoading(false); return; }
      try {
        const me = await authApi.me();
        setUser(me);
      } catch {
       
        localStorage.removeItem('pp_token');
        setToken(null);
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, []);  

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    localStorage.setItem('pp_token', data.access_token);
    setToken(data.access_token);
    const me = await authApi.me();
    setUser(me);
    return me;
  };

  const register = async (username, email, password) => {
    await authApi.register(username, email, password);

    return login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('pp_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}


// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}