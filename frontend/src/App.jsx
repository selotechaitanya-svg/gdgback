import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Preloader from './components/Preloader';
import ProtectedRoute from './components/ProtectedRoute';
import PageTransition from './components/PageTransition';
import ScrollProgress from './components/ScrollProgress';
import ScrollToTop from './components/ScrollToTop';
import BackToTop from './components/BackToTop';
import { SmoothScrollProvider } from './lib/SmoothScrollContext';

// Pages
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import MyEvents from './pages/MyEvents';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SmoothScrollProvider>
          <Preloader />
          <ScrollProgress />

          <div className="site-shell">
            <a href="#main-content" className="skip-link">
              Skip to content
            </a>

            <Navbar />

            <main id="main-content" className="site-main" tabIndex={-1}>
              <ScrollToTop />
              <PageTransition>
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
              </PageTransition>
            </main>

            <Footer />
            <BackToTop />
          </div>

          <Toaster
            position="bottom-right"
            gutter={12}
            toastOptions={{
              duration: 4200,
              style: {
                background: '#FFFFFF',
                color: '#000000',
                border: '3px solid #000000',
                boxShadow: '5px 5px 0px 0px #000000',
                borderRadius: '10px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                fontSize: '0.9rem',
                padding: '0.75rem 1rem',
              },
              success: { iconTheme: { primary: '#34A853', secondary: '#FFFFFF' } },
              error: { iconTheme: { primary: '#EA4335', secondary: '#FFFFFF' } },
            }}
          />
        </SmoothScrollProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
