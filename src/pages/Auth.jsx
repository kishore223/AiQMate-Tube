import React from 'react';
import { auth, googleProvider } from '../firebase';
import { 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';

export default function Auth() {
  const [isLogin, setIsLogin] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  
  // Form State
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');

  async function handleGoogle() {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      // App.jsx will automatically detect the user and redirect
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
      setLoading(false);
    }
  }

  async function handleEmailAuth(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        // Add Display Name to profile
        await updateProfile(res.user, { displayName: name });
      }
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      {/* Background Decoration */}
      <div className="auth-bg-accent" />

      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-icon-lg">
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#d4a574"/>
              <path d="M12 10l10 6-10 6V10z" fill="#0a0b0e"/>
            </svg>
          </div>
          <h1 className="auth-title">AiQMateTube</h1>
          <p className="auth-subtitle">
            {isLogin ? 'Welcome back, creator.' : 'Join the new era of video.'}
          </p>
        </div>

        <button className="btn-google" onClick={handleGoogle} disabled={loading}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="divider">
          <span>or continue with email</span>
        </div>

        <form onSubmit={handleEmailAuth} className="auth-form">
          {!isLogin && (
            <div className="input-group">
              <label>Full Name</label>
              <input 
                type="text" 
                placeholder="Ex. John Doe"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          )}
          
          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? <div className="loading-sm" /> : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="auth-footer">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button className="link-btn" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>

      <style>{`
        .auth-container {
          height: 100vh;
          display: grid;
          place-items: center;
          background: #faf8f5;
          position: relative;
          overflow: hidden;
          color: #2a2825;
          font-family: 'DM Sans', sans-serif;
        }
        .auth-bg-accent {
          position: absolute;
          top: -20%;
          right: -20%;
          width: 80vh;
          height: 80vh;
          background: radial-gradient(circle, rgba(212, 165, 116, 0.15) 0%, transparent 70%);
          pointer-events: none;
        }
        .auth-card {
          width: 100%;
          max-width: 420px;
          padding: 48px;
          background: #fff;
          border: 1px solid rgba(42, 40, 37, 0.08);
          box-shadow: 0 12px 40px rgba(42, 40, 37, 0.06);
          border-radius: 2px;
          position: relative;
          z-index: 10;
        }
        .auth-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .brand-icon-lg {
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
        }
        .auth-title {
          font-family: 'Playfair Display', serif;
          font-size: 32px;
          font-weight: 800;
          color: #1a1816;
          margin-bottom: 8px;
          letter-spacing: -0.02em;
        }
        .auth-subtitle {
          color: #9b9790;
          font-size: 15px;
        }
        .btn-google {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 14px;
          background: #fff;
          border: 1px solid #e8e5df;
          border-radius: 2px;
          font-weight: 600;
          color: #2a2825;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-google:hover {
          background: #f5f3ef;
          border-color: #b8b5af;
        }
        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 24px 0;
          color: #b8b5af;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid #e8e5df;
        }
        .divider span {
          padding: 0 12px;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .input-group label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #615e5a;
        }
        .input-group input {
          padding: 14px;
          border: 1px solid #e8e5df;
          border-radius: 2px;
          font-size: 15px;
          transition: 0.2s;
          outline: none;
          background: #faf8f5;
        }
        .input-group input:focus {
          border-color: #d4a574;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1);
        }
        .btn-auth-submit {
          padding: 16px;
          background: #1a1816;
          color: #fff;
          border: none;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          cursor: pointer;
          margin-top: 8px;
          border-radius: 2px;
          transition: 0.2s;
        }
        .btn-auth-submit:hover {
          background: #d4a574;
          transform: translateY(-1px);
        }
        .auth-footer {
          margin-top: 24px;
          text-align: center;
          font-size: 14px;
          color: #615e5a;
        }
        .link-btn {
          background: none;
          border: none;
          color: #d4a574;
          font-weight: 700;
          cursor: pointer;
          text-decoration: underline;
          padding: 0;
          margin-left: 4px;
        }
        .auth-error {
          padding: 12px;
          background: #fff5f5;
          border: 1px solid #fed7d7;
          color: #c53030;
          font-size: 13px;
          border-radius: 2px;
          text-align: center;
        }
        .loading-sm {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
}