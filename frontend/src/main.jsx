import React, { StrictMode, Component } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('GDG EventHub Uncaught Exception:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FCFDF8',
          padding: '2rem',
          fontFamily: 'Inter, sans-serif'
        }}>
          <div style={{
            maxWidth: '560px',
            backgroundColor: '#FFFFFF',
            border: '3px solid #000000',
            boxShadow: '8px 8px 0px 0px #000000',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'inline-block',
              backgroundColor: '#EA4335',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.8rem',
              padding: '0.35rem 0.85rem',
              border: '2px solid #000000',
              borderRadius: '6px',
              marginBottom: '1rem',
              fontFamily: "'JetBrains Mono', monospace"
            }}>
              APPLICATION_ERROR
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '0.75rem' }}>
              Oops! Something went wrong loading EventHub
            </h2>
            <p style={{ color: '#52525B', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              {this.state.error?.message || 'An unexpected runtime issue occurred.'}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#FBBC04',
                  color: '#000000',
                  fontWeight: 800,
                  border: '3px solid #000000',
                  boxShadow: '4px 4px 0px 0px #000000',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Reload Page
              </button>
              <button
                onClick={() => { localStorage.clear(); window.location.href = '/'; }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#FFFFFF',
                  color: '#000000',
                  fontWeight: 800,
                  border: '3px solid #000000',
                  boxShadow: '4px 4px 0px 0px #000000',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Clear Cache & Home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <GlobalErrorBoundary>
        <App />
      </GlobalErrorBoundary>
    </StrictMode>
  );
}
