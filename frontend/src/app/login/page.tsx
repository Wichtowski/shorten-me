'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/components/context/UserContext';

const LoginPage = () => {
  const { setUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/v1/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
      } else {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', String(data.user.token));
          setUser({
            id: data.user.id,
            email: data.user.email,
            username: data.user.username,
          });

          // MIGRATE ANONYMOUS SHORTENS
          const recentShortens = JSON.parse(localStorage.getItem('recent_shortens') || '[]');
          if (recentShortens.length > 0) {
            await fetch('/api/v1/shorten/migrate', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${data.user.token}`,
              },
              body: JSON.stringify({ shortens: recentShortens }),
            });
            localStorage.removeItem('recent_shortens');
          }
        }
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <div className="bg-primary-dark/50 backdrop-blur-sm rounded-xl p-8 shadow-2xl border border-primary-light/20">
          <h2 className="text-3xl font-bold text-primary-lightest mb-6 text-center">Login</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-primary-lightest mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-primary-darkest/50 border border-primary-light/30 text-white focus:outline-none focus:border-primary-lightest focus:ring-2 focus:ring-primary-lightest/20"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-primary-lightest mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-primary-darkest/50 border border-primary-light/30 text-white focus:outline-none focus:border-primary-lightest focus:ring-2 focus:ring-primary-lightest/20"
                required
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-light hover:bg-primary-lightest text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p className="mt-6 text-center text-primary-light">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-primary-lightest hover:text-white">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
