import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { X, Lock, Mail, AlertCircle, UserX } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGuestLogin: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onGuestLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form state when the modal is closed so it's fresh next time
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setPassword('');
      setError(null);
      setIsSignUp(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert("Account created! Please check your email for confirmation if required.");
        onClose();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            // CRITICAL FIX: Forces Google to show the account chooser.
            // This prevents the "403: You do not have access" error caused by 
            // the browser defaulting to a different logged-in Google account.
            prompt: 'select_account',
            access_type: 'offline'
          }
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Google Login Error:", err);
      let msg = err.message || "Google login failed";
      
      if (
        msg.includes("provider is not enabled") || 
        msg.includes("Unsupported provider") ||
        (err?.code === 400 && err?.msg?.includes("provider is not enabled"))
      ) {
         msg = "Configuration Error: Google Login is not enabled in Supabase. Please enable it in Authentication > Providers.";
      }
      
      setError(msg);
      setLoading(false);
    }
  };

  const toggleMode = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSignUp(!isSignUp);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl p-8 relative overflow-hidden">
        {/* Decorative elements - Mono Blue */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-3xl font-bold mb-2 text-white tracking-tight">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="text-slate-500 mb-8">
          {isSignUp ? 'Sign up to sync your preferences' : 'Sign in to access your library'}
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-900/20 border border-red-900/50 rounded flex items-start gap-3 text-red-200 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Google Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-100 text-zinc-900 font-medium px-6 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-white mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-zinc-800"></div>
            <span className="flex-shrink-0 mx-4 text-zinc-500 text-xs uppercase tracking-wider">Or with email</span>
            <div className="flex-grow border-t border-zinc-800"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-zinc-700 rounded-md py-3 pl-10 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-zinc-700 rounded-md py-3 pl-10 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? (isSignUp ? 'Creating Account...' : 'Signing In...') : (isSignUp ? 'Sign Up' : 'Sign In')}
          </Button>
        </form>

        {/* Guest Mode Option */}
        <div className="mt-6 pt-4 border-t border-zinc-800 text-center">
            <button 
              onClick={onGuestLogin}
              className="flex items-center justify-center gap-2 mx-auto text-zinc-500 hover:text-zinc-300 transition-colors text-sm group"
            >
              <UserX className="w-4 h-4" />
              <span className="group-hover:underline">Continue as Guest (Offline Mode)</span>
            </button>
        </div>

        <div className="mt-4 text-center text-sm text-slate-600">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
            <button onClick={toggleMode} className="text-sky-500 hover:text-sky-400 font-medium hover:underline">
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
        </div>
      </div>
    </div>
  );
};