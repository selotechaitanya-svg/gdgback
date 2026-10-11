import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Preloader from './components/Preloader';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import MyEvents from './pages/MyEvents';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';

function NotFound() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <div className="card-static-lg" style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px' }}>
        <div className="badge-brutal badge-red" style={{ marginBottom: '1rem' }}>
          ERROR 404
        </div>
        <h1 className="font-pixel" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
          PAGE_NOT_FOUND
        </h1>
        <p style={{ color: '#52525B', marginBottom: '2rem' }}>
          The page or route you were looking for doesn't exist or has moved.
        </p>
        <Link to="/" className="btn-brutal btn-yellow">
          Return Home
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Preloader />
          <Navbar />

          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route
                path="/my-events"
                element={
                  <ProtectedRoute>
                    <MyEvents />
                  </ProtectedRoute>
                }
              />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          <Footer />

          {/* Toast Notification Container with Neo-Brutalist Styling */}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#FFFFFF',
                color: '#000000',
                border: '3px solid #000000',
                boxShadow: '4px 4px 0px 0px #000000',
                borderRadius: '8px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                fontSize: '0.9rem',
              },
            }}
          />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
