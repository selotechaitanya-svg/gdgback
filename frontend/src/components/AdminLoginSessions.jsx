import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import {
  Shield,
  Activity,
  CheckCircle,
  Search,
  RefreshCw,
  Clock,
  Laptop,
  Globe,
  Ban,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminLoginSessions = ({ currentAdminUser }) => {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeSessions: 0,
    revokedSessions: 0,
    expiredSessions: 0,
  });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 50 });

  // Modal State: Revoke Session
  const [targetSessionForRevoke, setTargetSessionForRevoke] = useState(null);
  const [revokingLoading, setRevokingLoading] = useState(false);

  const fetchSessions = useCallback(
    async (targetPage = 1, searchQuery = search, status = statusFilter) => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.append('page', targetPage);
        params.append('limit', '50');
        if (searchQuery.trim()) params.append('search', searchQuery.trim());
        if (status && status !== 'all') params.append('status', status);

        const res = await api.get(`/api/admin/sessions?${params.toString()}`);
        if (res.data.success) {
          setSessions(res.data.sessions || []);
          setStats(
            res.data.stats || {
              totalSessions: 0,
              activeSessions: 0,
              revokedSessions: 0,
              expiredSessions: 0,
            }
          );
          setPagination(res.data.pagination || { total: 0, pages: 1, limit: 50 });
          setPage(targetPage);
        }
      } catch (err) {
        console.error('Failed to fetch login sessions:', err);
        toast.error('Failed to load login sessions');
      } finally {
        setLoading(false);
      }
    },
    [search, statusFilter]
  );

  useEffect(() => {
    fetchSessions(1);
  }, [fetchSessions]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSessions(1, search, statusFilter);
  };

  const handleStatusChange = (newStatus) => {
    setStatusFilter(newStatus);
    fetchSessions(1, search, newStatus);
  };

  const handleRevokeSession = async () => {
    if (!targetSessionForRevoke) return;
    try {
      setRevokingLoading(true);
      const res = await api.post(`/api/admin/sessions/${targetSessionForRevoke.id}/revoke`);
      if (res.data.success) {
        toast.success('Login session revoked successfully. User must sign in again.');
        setTargetSessionForRevoke(null);
        fetchSessions(page, search, statusFilter);
      }
    } catch (err) {
      console.error('Failed to revoke session:', err);
      toast.error(err.response?.data?.message || 'Failed to revoke session');
    } finally {
      setRevokingLoading(false);
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return 'Never';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Never';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelativeTime = (isoString) => {
    if (!isoString) return 'Never';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Never';
    const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* ------------------------------------------------------------------ */}
      {/* SECTION 1: KPI STATS CARDS */}
      {/* ------------------------------------------------------------------ */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Card 1: Total Recorded Logins */}
        <div
          className="card-static"
          style={{
            backgroundColor: '#DBEAFE',
            border: '3px solid #000000',
            boxShadow: '4px 4px 0px 0px #000000',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="font-mono" style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1E3A8A' }}>
              ALL LOGIN SESSIONS
            </span>
            <Activity size={18} style={{ color: '#1D4ED8' }} />
          </div>
          <div className="font-pixel" style={{ fontSize: '1.8rem', color: '#1E3A8A' }}>
            {stats.totalSessions}
          </div>
          <p className="font-mono" style={{ fontSize: '0.72rem', color: '#3B82F6', margin: '4px 0 0 0' }}>
            Total user logins registered in system
          </p>
        </div>

        {/* Card 2: Currently Active Sessions */}
        <div
          className="card-static"
          style={{
            backgroundColor: '#DCFCE7',
            border: '3px solid #000000',
            boxShadow: '4px 4px 0px 0px #000000',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="font-mono" style={{ fontSize: '0.78rem', fontWeight: 800, color: '#14532D' }}>
              ACTIVE SESSIONS
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: '#16A34A',
                  display: 'inline-block',
                  boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.4)',
                }}
              />
              <UserCheck size={18} style={{ color: '#15803D' }} />
            </div>
          </div>
          <div className="font-pixel" style={{ fontSize: '1.8rem', color: '#14532D' }}>
            {stats.activeSessions}
          </div>
          <p className="font-mono" style={{ fontSize: '0.72rem', color: '#16A34A', margin: '4px 0 0 0' }}>
            Currently authenticated and valid
          </p>
        </div>

        {/* Card 3: Revoked Sessions */}
        <div
          className="card-static"
          style={{
            backgroundColor: '#FEE2E2',
            border: '3px solid #000000',
            boxShadow: '4px 4px 0px 0px #000000',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="font-mono" style={{ fontSize: '0.78rem', fontWeight: 800, color: '#7F1D1D' }}>
              REVOKED SESSIONS
            </span>
            <Ban size={18} style={{ color: '#B91C1C' }} />
          </div>
          <div className="font-pixel" style={{ fontSize: '1.8rem', color: '#7F1D1D' }}>
            {stats.revokedSessions}
          </div>
          <p className="font-mono" style={{ fontSize: '0.72rem', color: '#DC2626', margin: '4px 0 0 0' }}>
            Manually revoked or logged out
          </p>
        </div>

        {/* Card 4: Expired Sessions */}
        <div
          className="card-static"
          style={{
            backgroundColor: '#F4F4F5',
            border: '3px solid #000000',
            boxShadow: '4px 4px 0px 0px #000000',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="font-mono" style={{ fontSize: '0.78rem', fontWeight: 800, color: '#3F3F46' }}>
              EXPIRED SESSIONS
            </span>
            <Clock size={18} style={{ color: '#71717A' }} />
          </div>
          <div className="font-pixel" style={{ fontSize: '1.8rem', color: '#3F3F46' }}>
            {stats.expiredSessions}
          </div>
          <p className="font-mono" style={{ fontSize: '0.72rem', color: '#71717A', margin: '4px 0 0 0' }}>
            Past 7-day expiration threshold
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* SECTION 2: SEARCH & FILTER CONTROLS */}
      {/* ------------------------------------------------------------------ */}
      <div
        className="card-static-lg"
        style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: '1 1 320px', maxWidth: '500px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder="Search by user, email, IP, or device..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-brutal font-mono"
              style={{
                width: '100%',
                paddingLeft: '2.5rem',
                fontSize: '0.85rem',
                paddingTop: '0.5rem',
                paddingBottom: '0.5rem',
              }}
            />
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#71717A',
              }}
            />
          </div>
          <button type="submit" className="btn-brutal btn-sm btn-yellow font-mono" style={{ fontSize: '0.8rem' }}>
            Filter
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '4px', backgroundColor: '#F4F4F5', padding: '3px', border: '2px solid #000' }}>
            <button
              type="button"
              onClick={() => handleStatusChange('all')}
              className={`btn-brutal btn-sm font-mono ${statusFilter === 'all' ? 'btn-yellow' : ''}`}
              style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                border: statusFilter === 'all' ? '2px solid #000' : 'none',
                background: statusFilter === 'all' ? '#FEF08A' : 'transparent',
                boxShadow: 'none',
              }}
            >
              All ({stats.totalSessions})
            </button>
            <button
              type="button"
              onClick={() => handleStatusChange('active')}
              className={`btn-brutal btn-sm font-mono ${statusFilter === 'active' ? 'btn-green' : ''}`}
              style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                border: statusFilter === 'active' ? '2px solid #000' : 'none',
                background: statusFilter === 'active' ? '#DCFCE7' : 'transparent',
                boxShadow: 'none',
              }}
            >
              Active ({stats.activeSessions})
            </button>
            <button
              type="button"
              onClick={() => handleStatusChange('revoked')}
              className={`btn-brutal btn-sm font-mono ${statusFilter === 'revoked' ? 'btn-red' : ''}`}
              style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                border: statusFilter === 'revoked' ? '2px solid #000' : 'none',
                background: statusFilter === 'revoked' ? '#FEE2E2' : 'transparent',
                boxShadow: 'none',
              }}
            >
              Revoked ({stats.revokedSessions})
            </button>
            <button
              type="button"
              onClick={() => handleStatusChange('expired')}
              className={`btn-brutal btn-sm font-mono ${statusFilter === 'expired' ? 'btn-blue' : ''}`}
              style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                border: statusFilter === 'expired' ? '2px solid #000' : 'none',
                background: statusFilter === 'expired' ? '#E4E4E7' : 'transparent',
                boxShadow: 'none',
              }}
            >
              Expired ({stats.expiredSessions})
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              fetchSessions(page, search, statusFilter);
              toast.success('Login sessions refreshed');
            }}
            className="btn-brutal btn-sm font-mono"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            title="Refresh login sessions"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* SECTION 3: SESSIONS DATA TABLE */}
      {/* ------------------------------------------------------------------ */}
      <div
        className="card-static-lg"
        style={{
          padding: '1.5rem',
          backgroundColor: '#FFFFFF',
          overflowX: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 className="font-pixel" style={{ fontSize: '1.05rem', margin: 0 }}>
              LOGIN_SESSIONS_LOG ({pagination.total})
            </h2>
            <p className="font-mono" style={{ fontSize: '0.78rem', color: '#71717A', margin: '4px 0 0 0' }}>
              Real-time audit log of who logged in, authentication timestamps, client devices, and IP addresses
            </p>
          </div>
          <span className="badge-brutal badge-sm font-mono" style={{ fontSize: '0.72rem' }}>
            Page {page} of {pagination.pages}
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '3.5rem', textAlign: 'center' }} className="font-mono">
            <RefreshCw size={24} className="spin" style={{ margin: '0 auto 1rem auto', display: 'block' }} />
            Loading authentication sessions log...
          </div>
        ) : sessions.length === 0 ? (
          <div
            className="card-static"
            style={{
              padding: '3.5rem 2rem',
              textAlign: 'center',
              backgroundColor: '#F4F4F5',
              border: '2px dashed #71717A',
              borderRadius: '8px',
            }}
          >
            <Activity size={36} style={{ color: '#71717A', margin: '0 auto 0.75rem auto' }} />
            <div className="font-pixel" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
              No login sessions found.
            </div>
            <p className="font-mono" style={{ fontSize: '0.8rem', color: '#71717A', margin: 0 }}>
              Try clearing your search query or status filter.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.85rem',
                minWidth: '950px',
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: '#000000',
                    color: '#FFFFFF',
                    textAlign: 'left',
                  }}
                >
                  <th className="font-mono" style={{ padding: '0.75rem 0.85rem', width: '40px' }}>
                    #
                  </th>
                  <th className="font-mono" style={{ padding: '0.75rem 1rem' }}>
                    LOGGED-IN USER
                  </th>
                  <th className="font-mono" style={{ padding: '0.75rem 0.85rem' }}>
                    SESSION STATUS
                  </th>
                  <th className="font-mono" style={{ padding: '0.75rem 1rem' }}>
                    INITIAL LOGIN
                  </th>
                  <th className="font-mono" style={{ padding: '0.75rem 1rem' }}>
                    LAST ACTIVE
                  </th>
                  <th className="font-mono" style={{ padding: '0.75rem 1rem' }}>
                    CLIENT DEVICE & OS
                  </th>
                  <th className="font-mono" style={{ padding: '0.75rem 0.85rem' }}>
                    IP ADDRESS
                  </th>
                  <th className="font-mono" style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s, index) => {
                  const isCurrentAdmin =
                    currentAdminUser?.email?.toLowerCase() === s.user?.email?.toLowerCase();
                  const initials = (s.user?.name || s.user?.email || 'U')
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <tr
                      key={s.id}
                      style={{
                        borderBottom: '1px solid #E4E4E7',
                        backgroundColor: s.status === 'active' ? '#F0FDF4' : index % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      {/* Row number */}
                      <td className="font-mono" style={{ padding: '0.75rem 0.85rem', fontWeight: 700, color: '#71717A' }}>
                        {(page - 1) * pagination.limit + index + 1}
                      </td>

                      {/* Logged in User */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '6px',
                              backgroundColor: s.user?.role === 'admin' ? '#FEE2E2' : '#DBEAFE',
                              border: '2px solid #000000',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 900,
                              fontSize: '0.8rem',
                              color: s.user?.role === 'admin' ? '#DC2626' : '#2563EB',
                              flexShrink: 0,
                            }}
                          >
                            {initials}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontWeight: 800, color: '#000000' }}>
                                {s.user?.name || 'Unknown User'}
                              </span>
                              {s.user?.role === 'admin' && (
                                <span className="badge-brutal badge-red" style={{ fontSize: '0.6rem', padding: '1px 5px' }}>
                                  ADMIN
                                </span>
                              )}
                              {isCurrentAdmin && (
                                <span className="badge-brutal badge-sm font-mono" style={{ fontSize: '0.6rem', backgroundColor: '#FEF08A' }}>
                                  CURRENT SESSION
                                </span>
                              )}
                            </div>
                            <div className="font-mono" style={{ fontSize: '0.76rem', color: '#52525B' }}>
                              {s.user?.email || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Session Status */}
                      <td style={{ padding: '0.75rem 0.85rem' }}>
                        {s.status === 'active' ? (
                          <span
                            className="badge-brutal badge-green"
                            style={{
                              fontSize: '0.65rem',
                              padding: '3px 8px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}
                          >
                            <span
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: '#15803D',
                                display: 'inline-block',
                              }}
                            />
                            ACTIVE
                          </span>
                        ) : s.status === 'revoked' ? (
                          <span
                            className="badge-brutal badge-red"
                            style={{
                              fontSize: '0.65rem',
                              padding: '3px 8px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Ban size={10} />
                            REVOKED
                          </span>
                        ) : (
                          <span
                            className="badge-brutal"
                            style={{
                              fontSize: '0.65rem',
                              padding: '3px 8px',
                              backgroundColor: '#E4E4E7',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Clock size={10} />
                            EXPIRED
                          </span>
                        )}
                      </td>

                      {/* Initial Login Date */}
                      <td className="font-mono" style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', color: '#52525B' }}>
                        <div>{formatDateTime(s.loginAt)}</div>
                        <div style={{ fontSize: '0.7rem', color: '#71717A' }}>{formatRelativeTime(s.loginAt)}</div>
                      </td>

                      {/* Last Active */}
                      <td className="font-mono" style={{ padding: '0.75rem 1rem', fontSize: '0.78rem' }}>
                        <div style={{ fontWeight: 700, color: s.status === 'active' ? '#15803D' : '#18181B' }}>
                          {formatRelativeTime(s.lastUsedAt)}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#71717A' }}>{formatDateTime(s.lastUsedAt)}</div>
                      </td>

                      {/* Client Device & OS */}
                      <td className="font-mono" style={{ padding: '0.75rem 1rem', fontSize: '0.78rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Laptop size={14} style={{ color: '#2563EB', flexShrink: 0 }} />
                          <span style={{ fontWeight: 700, color: '#18181B' }}>{s.device}</span>
                        </div>
                        {s.userAgent && (
                          <div
                            style={{
                              fontSize: '0.68rem',
                              color: '#71717A',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: '240px',
                            }}
                            title={s.userAgent}
                          >
                            {s.userAgent}
                          </div>
                        )}
                      </td>

                      {/* IP Address */}
                      <td className="font-mono" style={{ padding: '0.75rem 0.85rem', fontSize: '0.78rem' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <Globe size={12} style={{ color: '#71717A' }} />
                          <span>{s.ipAddress}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        {s.status === 'active' ? (
                          <button
                            type="button"
                            onClick={() => setTargetSessionForRevoke(s)}
                            className="btn-brutal btn-sm btn-red font-mono"
                            title="Force revoke session and log user out"
                            style={{
                              fontSize: '0.72rem',
                              padding: '3px 8px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Ban size={11} />
                            Revoke
                          </button>
                        ) : (
                          <span className="font-mono" style={{ fontSize: '0.72rem', color: '#A1A1AA' }}>
                            Inactive
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem' }}>
            <span className="font-mono" style={{ fontSize: '0.75rem', color: '#71717A' }}>
              Showing page {page} of {pagination.pages} ({pagination.total} total sessions)
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                disabled={page <= 1}
                onClick={() => fetchSessions(page - 1, search, statusFilter)}
                className="btn-brutal btn-sm font-mono"
                style={{ fontSize: '0.75rem' }}
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.pages}
                onClick={() => fetchSessions(page + 1, search, statusFilter)}
                className="btn-brutal btn-sm font-mono"
                style={{ fontSize: '0.75rem' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: REVOKE SESSION CONFIRMATION */}
      {/* ------------------------------------------------------------------ */}
      {targetSessionForRevoke && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.5rem',
          }}
          onClick={() => setTargetSessionForRevoke(null)}
        >
          <div
            className="card-static-lg"
            style={{
              backgroundColor: '#FFFFFF',
              maxWidth: '460px',
              width: '100%',
              padding: '2rem',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="badge-brutal badge-red" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '1rem' }}>
              <Ban size={14} />
              REVOKE LOGIN SESSION
            </div>
            <h3 className="font-pixel" style={{ fontSize: '1.15rem', marginBottom: '0.75rem', color: '#DC2626' }}>
              REVOKE_SESSION?
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#18181B', lineHeight: '1.5', marginBottom: '1.25rem' }}>
              Are you sure you want to revoke this session for:
              <br />
              <strong>{targetSessionForRevoke.user?.name || 'User'}</strong> ({targetSessionForRevoke.user?.email})?
              <br />
              Device: <strong>{targetSessionForRevoke.device}</strong>
              <br />
              This user will be logged out immediately.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                disabled={revokingLoading}
                onClick={() => setTargetSessionForRevoke(null)}
                className="btn-brutal font-mono"
                style={{ fontSize: '0.85rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={revokingLoading}
                onClick={handleRevokeSession}
                className="btn-brutal btn-red font-mono"
                style={{ fontSize: '0.85rem', fontWeight: 800 }}
              >
                {revokingLoading ? 'Revoking...' : 'Yes, Revoke Session'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLoginSessions;
