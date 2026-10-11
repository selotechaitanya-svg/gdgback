import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Key, RotateCw, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const Login = () => {
  const [authMethod, setAuthMethod] = useState('otp'); // 'otp' or 'password'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { login, verifyOtp, sendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/events';

  // Send OTP to real email inbox
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const res = await sendOtp(email.trim(), 'login');
      if (res.success) {
        setOtpSent(true);
        if (res.devOtp) {
          setOtp(res.devOtp);
          toast.success(`Verification Code: ${res.devOtp}`, { duration: 8000 });
        } else {
          toast.success(`Verification code sent to ${email.trim()}! Check your inbox.`);
        }
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else if (res.notFound) {
        toast.error('No account found with this email. Opening Sign Up for you...');
        navigate('/register', { state: { email: email.trim() } });
      } else {
        toast.error(res.message || 'Failed to send OTP');
      }
    } catch (err) {
      if (err.response?.data?.notFound) {
        toast.error('No account found with this email. Opening Sign Up for you...');
        navigate('/register', { state: { email: email.trim() } });
      } else {
        toast.error(err.response?.data?.message || 'Error sending verification code');
      }
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP entered by user
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      toast.error('Please enter the 6-digit code from your email');
      return;
    }

    try {
      setLoading(true);
      const res = await verifyOtp(email.trim(), otp.trim());
      if (res.success) {
        toast.success(`Welcome back, ${res.user.name || res.user.email}!`);
        navigate(from, { replace: true });
      } else {
        toast.error(res.message || 'Invalid verification code');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired code. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // Password Login
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email.trim(), password);
      if (res.success) {
        toast.success(`Welcome back, ${res.user.name}!`);
        navigate(from, { replace: true });
      } else {
        toast.error(res.message || 'Login failed');
      }
    } catch (err) {
      if (err.response?.data?.notFound) {
        toast.error('No account found with this email. Opening Sign Up for you...');
        navigate('/register', { state: { email: email.trim() } });
      } else {
        toast.error(err.response?.data?.message || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1.5rem',
      }}
    >
      <div
        className="card-static-lg"
        style={{
          maxWidth: '480px',
          width: '100%',
          backgroundColor: '#FFFFFF',
          padding: '2.5rem',
          position: 'relative',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div className="badge-brutal badge-blue" style={{ marginBottom: '0.75rem' }}>
            AUTHENTICATION
          </div>
          <h1 className="font-pixel" style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>
            SIGN IN TO GDG
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#52525B' }}>
            Sign in with your email. We'll send a verification code to your inbox.
          </p>
        </div>

        {/* Method Toggle: OTP vs Password */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#F4F4F5',
            border: '2px solid #000000',
            borderRadius: '8px',
            padding: '3px',
            marginBottom: '1.5rem',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setAuthMethod('otp');
              setOtpSent(false);
              setOtp('');
            }}
            className="font-mono"
            style={{
              flex: 1,
              padding: '0.5rem',
              fontSize: '0.75rem',
              fontWeight: 800,
              border: authMethod === 'otp' ? '2px solid #000' : 'none',
              borderRadius: '6px',
              backgroundColor: authMethod === 'otp' ? 'var(--google-yellow)' : 'transparent',
              cursor: 'pointer',
            }}
          >
            EMAIL OTP
          </button>
          <button
            type="button"
            onClick={() => setAuthMethod('password')}
            className="font-mono"
            style={{
              flex: 1,
              padding: '0.5rem',
              fontSize: '0.75rem',
              fontWeight: 800,
              border: authMethod === 'password' ? '2px solid #000' : 'none',
              borderRadius: '6px',
              backgroundColor: authMethod === 'password' ? '#FFFFFF' : 'transparent',
              cursor: 'pointer',
            }}
          >
            PASSWORD
          </button>
        </div>

        {authMethod === 'otp' ? (
          <div>
            {!otpSent ? (
              /* Step 1: Enter Email */
              <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label className="label-brutal">YOUR EMAIL ADDRESS</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-brutal font-mono"
                      style={{ paddingLeft: '2.75rem' }}
                    />
                    <Mail
                      size={18}
                      style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#71717A',
                      }}
                    />
                  </div>
                  <p className="font-mono" style={{ fontSize: '0.72rem', color: '#52525B', marginTop: '6px' }}>
                    A 6-digit verification code will be sent to your email inbox.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-brutal btn-lg btn-yellow"
                  style={{ width: '100%' }}
                >
                  {loading ? 'Sending Code...' : 'Send Verification Code →'}
                </button>
              </form>
            ) : (
              /* Step 2: Enter OTP from email */
              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Email confirmation banner */}
                <div
                  className="card-static"
                  style={{
                    padding: '1rem',
                    backgroundColor: '#DCFCE7',
                    border: '2.5px solid #000',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '3px 3px 0px 0px #000',
                  }}
                >
                  <CheckCircle size={20} style={{ color: '#16A34A', flexShrink: 0 }} />
                  <div>
                    <div className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 800, color: '#166534' }}>
                      VERIFICATION CODE SENT
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#15803D' }}>
                      Check your inbox at <strong>{email}</strong>
                    </div>
                  </div>
                </div>

                <div
                  className="card-static"
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#F4F4F5',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#71717A' }}>VERIFYING</div>
                    <div className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 800 }}>
                      {email}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp('');
                    }}
                    className="btn-brutal btn-sm font-mono"
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                  >
                    Change
                  </button>
                </div>

                <div>
                  <label className="label-brutal">ENTER 6-DIGIT CODE FROM EMAIL</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    onPaste={(e) => {
                      const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                      if (text) {
                        e.preventDefault();
                        setOtp(text);
                      }
                    }}
                    className="input-brutal font-mono"
                    style={{
                      fontSize: 'clamp(1.2rem, 5vw, 1.75rem)',
                      letterSpacing: 'clamp(0.15em, 1.5vw, 0.3em)',
                      textAlign: 'center',
                      fontWeight: 900,
                      backgroundColor: '#FFFFFF',
                      padding: '0.65rem 0.5rem',
                    }}
                    autoFocus
                  />
                  <p className="font-mono" style={{ fontSize: '0.68rem', color: '#71717A', marginTop: '6px' }}>
                    Didn't receive the email? Check your spam folder or resend below.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="btn-brutal btn-lg btn-green"
                  style={{ width: '100%' }}
                >
                  {loading ? 'Verifying...' : 'Verify & Sign In'}
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={countdown > 0 || loading}
                    className="btn-brutal btn-sm font-mono"
                    style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <RotateCw size={12} />
                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp('');
                    }}
                    className="btn-brutal btn-sm font-mono btn-red"
                    style={{ fontSize: '0.75rem' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* Password Form */
          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="label-brutal">EMAIL ADDRESS</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-brutal font-mono"
                  style={{ paddingLeft: '2.75rem' }}
                />
                <Mail
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#71717A',
                  }}
                />
              </div>
            </div>

            <div>
              <label className="label-brutal">PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-brutal font-mono"
                  style={{ paddingLeft: '2.75rem' }}
                />
                <Key
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#71717A',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-brutal btn-lg btn-black"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {loading ? 'Signing in...' : 'Sign In with Password'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.85rem' }}>
          <span style={{ color: '#52525B' }}>Don't have an account yet? </span>
          <Link to="/register" style={{ fontWeight: 800, color: '#000000' }}>
            Create Account →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
