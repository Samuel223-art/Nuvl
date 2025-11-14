import React, { useState } from 'react';
import { firebaseConfig } from '../firebaseConfig';

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
  onNavigateToRegister: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onNavigateToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`, {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        let message = 'Failed to log in.';
        if (data?.error?.message) {
            switch(data.error.message) {
                case 'INVALID_LOGIN_CREDENTIALS':
                  message = 'Invalid email or password. Please try again.';
                  break;
                case 'USER_DISABLED':
                  message = 'This user account has been disabled.';
                  break;
                default:
                  // Display the raw Firebase error for easier debugging
                  message = `Login failed: ${data.error.message.replace(/_/g, ' ').toLowerCase()}`;
            }
        }
        throw new Error(message);
      }
      
      onLoginSuccess(data);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-10">
      <a href="#" className="font-['Righteous'] text-5xl font-bold text-primary mb-8" aria-label="eTale Home">
        eTale
      </a>
      <div className="w-full max-w-md space-y-6 px-4">
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <div className="p-3 bg-red-500/20 text-red-400 rounded-lg text-center text-sm">{error}</div>}
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="block w-full bg-neutral-800 border border-transparent rounded-lg py-3 px-4 text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="block w-full bg-neutral-800 border border-transparent rounded-lg py-3 px-4 text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="flex items-center justify-end">
             <div className="text-sm">
                <a href="#" className="font-medium text-primary hover:text-green-400">
                    Forgot your password?
                </a>
             </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-black bg-primary hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-primary transition-colors disabled:bg-primary/50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging In...' : 'Log In'}
            </button>
          </div>
        </form>
        <div className="text-center text-sm text-neutral-400">
          Don't have an account?{' '}
          <button onClick={onNavigateToRegister} className="font-medium text-primary hover:text-green-400">
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
