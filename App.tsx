import React, { useState, useEffect } from 'react';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { getSessionUser } from './services/storage';
import { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const sessionUser = getSessionUser();
    if (sessionUser) {
      setUser(sessionUser);
    }
    setLoading(false);
  }, []);

  const handleLogin = () => {
    const sessionUser = getSessionUser();
    setUser(sessionUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-coffee-50 text-coffee-800">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 bg-coffee-300 rounded-full mb-2"></div>
          <div className="text-sm">Carregando Barista...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {!user ? (
        <Auth onLogin={handleLogin} />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </>
  );
}

export default App;
