
import React, { useState } from 'react';
import { firebaseConfig } from '../firebaseConfig';

interface RegisterPageProps {
  onRegisterSuccess: (user: any) => void;
  onNavigateToLogin: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegisterSuccess, onNavigateToLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // 1. Create user in Firebase Auth
      const authResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`, {
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

      const authData = await authResponse.json();

      if (!authResponse.ok) {
        let message = 'Failed to register.';
        if (authData?.error?.message) {
            switch(authData.error.message) {
                case 'EMAIL_EXISTS':
                  message = 'An account with this email already exists.';
                  break;
                case 'OPERATION_NOT_ALLOWED':
                  message = 'Password sign-in is disabled for this project.';
                  break;
                case 'WEAK_PASSWORD : Password should be at least 6 characters':
                  message = 'Password is too weak. It should be at least 6 characters long.';
                  break;
                default:
                  // Display the raw Firebase error for easier debugging
                  message = `Registration failed: ${authData.error.message.replace(/_/g, ' ').toLowerCase()}`;
            }
        }
        throw new Error(message);
      }

      // 2. Save user details to Cloud Firestore
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/users/${authData.localId}?key=${firebaseConfig.apiKey}`;
      
      const dbResponse = await fetch(firestoreUrl, {
          method: 'PATCH', // Use PATCH to create or overwrite the document
          body: JSON.stringify({
              fields: {
                  username: { stringValue: username },
                  email: { stringValue: authData.email },
                  coins: { integerValue: '1' },
                  createdAt: { stringValue: new Date().toISOString() },
                  library: { arrayValue: { values: [] } },
                  likedNovels: { arrayValue: { values: [] } },
              }
          }),
          headers: {
              'Content-Type': 'application/json',
          },
      });


      if (!dbResponse.ok) {
        const dbErrorData = await dbResponse.json();
        // This will give a specific error like "Permission denied" if rules are restrictive
        const dbErrorMessage = dbErrorData?.error?.message || 'Failed to save user details to the database.';
        throw new Error(dbErrorMessage);
      }

      onRegisterSuccess(authData);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-10">
      <a href="#" className="font-['Righteous'] text-5xl font-bold text-primary mb-8" aria-label="eTale Home">
        eTale
      </a>
      <div className="w-full max-w-md space-y-6 px-4">
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <div className="p-3 bg-red-500/20 text-red-400 rounded-lg text-center text-sm">{error}</div>}
          <div>
            <label htmlFor="username" className="sr-only">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="block w-full bg-neutral-800 border border-transparent rounded-lg py-3 px-4 text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
          </div>
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
          <div>
            <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              required
              className="block w-full bg-neutral-800 border border-transparent rounded-lg py-3 px-4 text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-black bg-primary hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-primary transition-colors disabled:bg-primary/50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
        <div className="text-center text-sm text-neutral-400">
          Already have an account?{' '}
          <button onClick={onNavigateToLogin} className="font-medium text-primary hover:text-green-400">
            Log In
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
