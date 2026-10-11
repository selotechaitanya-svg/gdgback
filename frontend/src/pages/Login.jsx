import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Key, RotateCw, CheckCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export const Login = () => {
  // Flow steps: 'email' → 'choose-method' → 'otp-sent'
  const [step, setStep] = useState('email');
  const [authMethod, setAuthMethod] = useState('otp'); // 'otp' or 'password'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { user, login, verifyOtp, sendOtp, checkEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/events';

  // If already logged in, redirect away from login page
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  // If redirected from register page with a pre-filled email
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  // ─── Step 1: Check if email exists in database ──────────────────────
  const handleCheckEmail = async (e) => {
    if (e) e.preventDefault();
    const trimmed = email.trim();

    if (!trimmed || !trimmed.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const res = await checkEmail(trimmed);

      if (res.success && res.exists) {
        // User found → show sign-in methods
        setStep('choose-method');
      } else {
        // User NOT found → redirect to sign up with email pre-filled
        toast('No account found — let\'s create one!', { icon: '👋' });
        navigate('/register', { state: { email: trimmed } });
      }
    } catch (err) {
      // Fallback: if the check-email endpoint fails, still try the OTP flow
      // which will return notFound and redirect from there
      toast.error(err.response?.data?.message || 'Error checking email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Send OTP to real email inbox ────────────────────────────────────
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
        setStep('otp-sent');
        if (res.devOtp) {
          setOtp(res.devOtp);
          toast.success(`Verification Code: ${res.devOtp}`, { duration: 8000 });
        } else {
          toast.success(`Verification code sent to ${email.trim()}! Check your inbox.`);
        }
        startCountdown();
      } else if (res.notFound) {
        toast('No account found — let\'s create one!', { icon: '👋' });
        navigate('/register', { state: { email: email.trim() } });
      } else {
        toast.error(res.message || 'Failed to send OTP');
      }
    } catch (err) {
      if (err.response?.data?.notFound) {
        toast('No account found — let\'s create one!', { icon: '👋' });
        navigate('/register', { state: { email: email.trim() } });
      } else {
        toast.error(err.response?.data?.message || 'Error sending verification code');
      }
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = () => {
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
  };

  // ─── Verify OTP entered by user ──────────────────────────────────────
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

  // ─── Password Login ──────────────────────────────────────────────────
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
        toast('No account found — let\'s create one!', { icon: '👋' });
        navigate('/register', { state: { email: email.trim() } });
      } else {
        toast.error(err.response?.data?.message || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── Go back to email step ──────────────────────────────────────────
  const resetToEmailStep = () => {
    setStep('email');
    setOtp('');
    setPassword('');
    setCountdown(0);
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
            {step === 'email'
              ? 'WELCOME TO GDG'
              : step === 'otp-sent'
              ? 'VERIFY YOUR EMAIL'
              : 'SIGN IN TO GDG'}
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#52525B' }}>
            {step === 'email'
              ? 'Enter your email to continue. We\'ll check if you have an account.'
              : step === 'otp-sent'
              ? 'Enter the 6-digit code sent to your email.'
              : 'Choose how you\'d like to sign in.'}
          </p>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* STEP 1: Email-first check                                      */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {step === 'email' && (
          <form onSubmit={handleCheckEmail} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
                  autoFocus
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
                If you don't have an account, we'll redirect you to sign up.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-brutal btn-lg btn-yellow"
              style={{ width: '100%' }}
            >
              {loading ? 'Checking...' : 'Continue →'}
            </button>
          </form>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* STEP 2: Choose sign-in method (OTP or Password)                */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {step === 'choose-method' && (
          <div>
            {/* Back button & email display */}
            <div
              className="card-static"
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#F4F4F5',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <div style={{ fontSize: '0.7rem', color: '#71717A' }}>SIGNING IN AS</div>
                <div className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 800 }}>
                  {email}
                </div>
              </div>
              <button
                type="button"
                onClick={resetToEmailStep}
                className="btn-brutal btn-sm font-mono"
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <ArrowLeft size={12} />
                Change
              </button>
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
                onClick={() => setAuthMethod('otp')}
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
              /* OTP: Send code */
              <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <p className="font-mono" style={{ fontSize: '0.8rem', color: '#52525B' }}>
                  We'll send a 6-digit verification code to <strong>{email}</strong>.
                </p>
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
              /* Password Form */
              <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
                      autoFocus
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
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* STEP 3: OTP verification (after code was sent)                 */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {step === 'otp-sent' && (
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
                onClick={resetToEmailStep}
                className="btn-brutal btn-sm font-mono"
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <ArrowLeft size={12} />
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
                onClick={resetToEmailStep}
                className="btn-brutal btn-sm font-mono btn-red"
                style={{ fontSize: '0.75rem' }}
              >
                Cancel
              </button>
            </div>
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
