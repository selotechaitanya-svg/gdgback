import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Key, RotateCw, CheckCircle, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { user, sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already logged in, redirect away from register page
  useEffect(() => {
    if (user) {
      navigate('/events', { replace: true });
    }
  }, [user, navigate]);

  // If redirected from login page with an unregistered email, pre-fill it!
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  // Step 1: Send OTP to user's real email
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!password || password.length < 6) {
      toast.error('Please create a password of at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const res = await sendOtp(email.trim(), 'register');
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
      } else {
        toast.error(res.message || 'Failed to send verification code');
      }
    } catch (err) {
      if (err.response?.data?.alreadyExists) {
        toast('You already have an account — redirecting to sign in!', { icon: '✅' });
        navigate('/login', { state: { email: email.trim() } });
      } else {
        toast.error(err.response?.data?.message || 'Error sending verification code');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Create Account with Password
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();

    if (!otp.trim() || otp.trim().length !== 6) {
      toast.error('Please enter the 6-digit code from your email');
      return;
    }

    try {
      setLoading(true);
      const res = await verifyOtp(email.trim(), otp.trim(), name.trim(), password.trim());
      if (res.success) {
        toast.success(`Account created with password! Welcome, ${res.user.name}!`);
        navigate('/events');
      } else {
        toast.error(res.message || 'Verification failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired code. Try again.');
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
          maxWidth: '520px',
          width: '100%',
          backgroundColor: '#FFFFFF',
          padding: '2.5rem',
          position: 'relative',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div className="badge-brutal badge-green" style={{ marginBottom: '0.75rem' }}>
            NEW DEVELOPER
          </div>
          <h1 className="font-pixel" style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>
            JOIN GDG RBU
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#52525B' }}>
            Create your account and password with email verification.
          </p>
        </div>

        {!otpSent ? (
          /* Step 1: Name, Email, Password, Confirm Password */
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="label-brutal">FULL NAME</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  placeholder="Your Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-brutal"
                  style={{ paddingLeft: '2.75rem' }}
                />
                <User
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
            </div>

            <div>
              <label className="label-brutal">CREATE PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
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
              <p className="font-mono" style={{ fontSize: '0.72rem', color: '#52525B', marginTop: '4px' }}>
                Create a password so you can log in with password or OTP anytime.
              </p>
            </div>

            <div>
              <label className="label-brutal">CONFIRM PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Re-type your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-brutal font-mono"
                  style={{ paddingLeft: '2.75rem' }}
                />
                <Lock
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
              className="btn-brutal btn-lg btn-green"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {loading ? 'Sending Code...' : 'Send Verification Code →'}
            </button>
          </form>
        ) : (
          /* Step 2: Enter OTP from email */
          <form onSubmit={handleVerifyAndRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Email sent confirmation */}
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
                <div style={{ fontSize: '0.7rem', color: '#71717A' }}>REGISTERING</div>
                <div className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 800 }}>
                  {name} · {email}
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
              {loading ? 'Creating Account...' : 'Verify & Create Account'}
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

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.85rem' }}>
          <span style={{ color: '#52525B' }}>Already have an account? </span>
          <Link to="/login" style={{ fontWeight: 800, color: '#000000' }}>
            Sign In Here →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
