import React, { useState } from 'react';

interface LoginProps {
  onLogin: (username: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState<string>('admin');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      onLogin('admin');
    } else if (username === 'user' && password === 'user123') {
      onLogin('user');
    } else {
      setError('Invalid username or password. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="login-field">
          <label htmlFor="username">Username:</label>
          <select
            id="username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (error) setError('');
            }}
            required
          >
            <option value="admin">admin</option>
            <option value="user">user</option>
          </select>
        </div>
        <div className="login-field">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError('');
            }}
            required
          />
        </div>
        {error && (
          <p className="error-text" role="alert" aria-live="polite">
            {error}
          </p>
        )}
        <button type="submit" disabled={!username || !password}>
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;