import React, { useState, useEffect } from 'react';
import './App.css'
import IncidentList from './components/IncidentList'
import Login from './components/Login'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<string>('');

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const storedUser = localStorage.getItem('user') || '';
    if (loggedIn && storedUser) {
      setIsLoggedIn(true);
      setUser(storedUser);
    }
  }, []);

  const handleLogin = (username: string) => {
    setIsLoggedIn(true);
    setUser(username);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('user', username);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser('');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
  };

  return (
    <div className="App">
      <h1>Traffic Incident Management</h1>
      {isLoggedIn ? (
        <IncidentList onLogout={handleLogout} user={user} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  )
}

export default App
