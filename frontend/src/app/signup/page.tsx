'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import bcrypt from 'bcryptjs';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!username) {
      setError('Username is required');
      return;
    }

    try {
      const response = await fetch('/api/v1/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          username,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        setError(result.error || 'Signup failed');
        return;
      }

      router.push('/');
    } catch (err) {
      console.error(err);
      setError('Signup failed. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <div className="bg-primary-dark/50 backdrop-blur-sm rounded-xl p-8 shadow-2xl border border-primary-light/20">
          <h2 className="text-3xl font-bold text-primary-lightest mb-6 text-center">Sign Up</h2>
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
              <label htmlFor="username" className="block text-primary-lightest mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
            <div>
              <label htmlFor="confirm_password" className="block text-primary-lightest mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-primary-darkest/50 border border-primary-light/30 text-white focus:outline-none focus:border-primary-lightest focus:ring-2 focus:ring-primary-lightest/20"
                required
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-primary-light hover:bg-primary-lightest text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign Up
            </button>
          </form>
          <p className="mt-6 text-center text-primary-light">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-lightest hover:text-white">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
