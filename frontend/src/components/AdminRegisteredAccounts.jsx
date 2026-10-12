import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import {
  Users,
  Shield,
  CheckCircle,
  Search,
  RefreshCw,
  Trash2,
  Eye,
  Key,
  AlertTriangle,
  Calendar,
  MapPin,
  X,
  Clock,
  Activity,
  Globe,
  UserCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminRegisteredAccounts = ({ currentAdminUser }) => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    verifiedUsers: 0,
    activeUsersNow: 0,
  });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 50 });

  // Modal State: View User's Registered Events
  const [selectedUserForEvents, setSelectedUserForEvents] = useState(null);
  const [userEventsModalLoading, setUserEventsModalLoading] = useState(false);
  const [userEventsList, setUserEventsList] = useState([]);

  // Modal State: Delete User Confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Modal State: Revoke Sessions Confirmation
  const [revokingUserTarget, setRevokingUserTarget] = useState(null);
  const [revokingLoading, setRevokingLoading] = useState(false);

  const fetchUsers = useCallback(
    async (targetPage = 1, searchQuery = search, role = roleFilter) => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.append('page', targetPage);
        params.append('limit', '50');
        if (searchQuery.trim()) params.append('search', searchQuery.trim());
        if (role && role !== 'all') params.append('role', role);

        const res = await api.get(`/api/admin/users?${params.toString()}`);
        if (res.data.success) {
          setUsers(res.data.users || []);
          setStats(
            res.data.stats || {
              totalUsers: 0,
              totalAdmins: 0,
              verifiedUsers: 0,
              activeUsersNow: 0,
            }
          );
          setPagination(res.data.pagination || { total: 0, pages: 1, limit: 50 });
          setPage(targetPage);
        }
      } catch (err) {
        console.error('Failed to fetch registered users:', err);
        toast.error('Failed to load registered accounts');
      } finally {
        setLoading(false);
      }
    },
    [search, roleFilter]
  );

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(1, search, roleFilter);
  };

  const handleRoleChange = (newRole) => {
    setRoleFilter(newRole);
    fetchUsers(1, search, newRole);
  };

  // Open modal and fetch events for target user
  const handleOpenUserEvents = async (targetUser) => {
    setSelectedUserForEvents(targetUser);
    setUserEventsModalLoading(true);
    try {
      const res = await api.get(`/api/admin/users/${targetUser.id}/registrations`);
      if (res.data.success) {
        setUserEventsList(res.data.registrations || []);
      }
    } catch (err) {
      console.error('Failed to load user registrations:', err);
      toast.error('Failed to load user registered events');
      setUserEventsList([]);
    } finally {
      setUserEventsModalLoading(false);
    }
  };

  // Revoke all active sessions for target user
  const handleRevokeUserSessions = async () => {
    if (!revokingUserTarget) return;
    try {
      setRevokingLoading(true);
      const res = await api.post(`/api/admin/users/${revokingUserTarget.id}/revoke-sessions`);
      if (res.data.success) {
        toast.success(res.data.message || `Revoked sessions for ${revokingUserTarget.email}`);
        setRevokingUserTarget(null);
        fetchUsers(page, search, roleFilter);
      }
    } catch (err) {
      console.error('Failed to revoke sessions:', err);
      toast.error(err.response?.data?.message || 'Failed to revoke user sessions');
    } finally {
      setRevokingLoading(false);
    }
  };

  // Delete user account
  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      const res = await api.delete(`/api/admin/users/${deleteTarget.id}`);
      if (res.data.success) {
        toast.success(res.data.message || 'User account permanently deleted.');
        setDeleteTarget(null);
        fetchUsers(page, search, roleFilter);
      }
    } catch (err) {
      console.error('Failed to delete user:', err);
      toast.error(err.response?.data?.message || 'Failed to delete user account');
    } finally {
      setDeleteLoading(false);
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
        {/* Card 1: Total Registered Accounts */}
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
              REGISTERED IN DATABASE
            </span>
            <Users size={18} style={{ color: '#1D4ED8' }} />
          </div>
          <div className="font-pixel" style={{ fontSize: '1.8rem', color: '#1E3A8A' }}>
            {stats.totalUsers}
          </div>
          <p className="font-mono" style={{ fontSize: '0.72rem', color: '#3B82F6', margin: '4px 0 0 0' }}>
            Total user records in MongoDB
          </p>
        </div>

        {/* Card 2: Users Currently Online / Active */}
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
              ONLINE NOW
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
              <Activity size={18} style={{ color: '#15803D' }} />
            </div>
          </div>
          <div className="font-pixel" style={{ fontSize: '1.8rem', color: '#14532D' }}>
            {stats.activeUsersNow}
          </div>
          <p className="font-mono" style={{ fontSize: '0.72rem', color: '#16A34A', margin: '4px 0 0 0' }}>
            Users with active login sessions
          </p>
        </div>

        {/* Card 3: Administrator Accounts */}
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
              ADMINISTRATORS
            </span>
            <Shield size={18} style={{ color: '#B91C1C' }} />
          </div>
          <div className="font-pixel" style={{ fontSize: '1.8rem', color: '#7F1D1D' }}>
            {stats.totalAdmins}
          </div>
          <p className="font-mono" style={{ fontSize: '0.72rem', color: '#DC2626', margin: '4px 0 0 0' }}>
            Privileged admin allowlist accounts
          </p>
        </div>

        {/* Card 4: Verified Email Accounts */}
        <div
          className="card-static"
          style={{
            backgroundColor: '#FEF08A',
            border: '3px solid #000000',
            boxShadow: '4px 4px 0px 0px #000000',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="font-mono" style={{ fontSize: '0.78rem', fontWeight: 800, color: '#713F12' }}>
              VERIFIED ACCOUNTS
            </span>
            <CheckCircle size={18} style={{ color: '#CA8A04' }} />
          </div>
          <div className="font-pixel" style={{ fontSize: '1.8rem', color: '#713F12' }}>
            {stats.verifiedUsers}
          </div>
          <p className="font-mono" style={{ fontSize: '0.72rem', color: '#A16207', margin: '4px 0 0 0' }}>
            Email verified through OTP check
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
              placeholder="Search by name or email address..."
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
              onClick={() => handleRoleChange('all')}
              className={`btn-brutal btn-sm font-mono ${roleFilter === 'all' ? 'btn-yellow' : ''}`}
              style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                border: roleFilter === 'all' ? '2px solid #000' : 'none',
                background: roleFilter === 'all' ? '#FEF08A' : 'transparent',
                boxShadow: 'none',
              }}
            >
              All Roles ({stats.totalUsers})
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`btn-brutal btn-sm font-mono ${roleFilter === 'admin' ? 'btn-red' : ''}`}
              style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                border: roleFilter === 'admin' ? '2px solid #000' : 'none',
                background: roleFilter === 'admin' ? '#FEE2E2' : 'transparent',
                boxShadow: 'none',
              }}
            >
              Admins Only ({stats.totalAdmins})
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('user')}
              className={`btn-brutal btn-sm font-mono ${roleFilter === 'user' ? 'btn-blue' : ''}`}
              style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                border: roleFilter === 'user' ? '2px solid #000' : 'none',
                background: roleFilter === 'user' ? '#DBEAFE' : 'transparent',
                boxShadow: 'none',
              }}
            >
              Users Only ({Math.max(0, stats.totalUsers - stats.totalAdmins)})
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              fetchUsers(page, search, roleFilter);
              toast.success('Accounts list updated');
            }}
            className="btn-brutal btn-sm font-mono"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            title="Refresh database accounts"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* SECTION 3: REGISTERED USERS DATA TABLE */}
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
              DATABASE_ACCOUNTS ({pagination.total})
            </h2>
            <p className="font-mono" style={{ fontSize: '0.78rem', color: '#71717A', margin: '4px 0 0 0' }}>
              All registered users in the database with role, verification status, login time & event registrations
            </p>
          </div>
          <span className="badge-brutal badge-sm font-mono" style={{ fontSize: '0.72rem' }}>
            Page {page} of {pagination.pages}
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '3.5rem', textAlign: 'center' }} className="font-mono">
            <RefreshCw size={24} className="spin" style={{ margin: '0 auto 1rem auto', display: 'block' }} />
            Loading registered accounts from database...
          </div>
        ) : users.length === 0 ? (
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
            <Users size={36} style={{ color: '#71717A', margin: '0 auto 0.75rem auto' }} />
            <div className="font-pixel" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
              No accounts match the criteria.
            </div>
            <p className="font-mono" style={{ fontSize: '0.8rem', color: '#71717A', margin: 0 }}>
              Try clearing your search query or role filter.
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
                    USER ACCOUNT
                  </th>
                  <th className="font-mono" style={{ padding: '0.75rem 0.85rem' }}>
                    ROLE
                  </th>
                  <th className="font-mono" style={{ padding: '0.75rem 0.85rem' }}>
                    STATUS
                  </th>
                  <th className="font-mono" style={{ padding: '0.75rem 0.85rem' }}>
                    ONLINE
                  </th>
                  <th className="font-mono" style={{ padding: '0.75rem 1rem' }}>
                    REGISTERED ON
                  </th>
                  <th className="font-mono" style={{ padding: '0.75rem 1rem' }}>
                    LAST LOGIN / ACTIVE
                  </th>
                  <th className="font-mono" style={{ padding: '0.75rem 0.85rem' }}>
                    EVENT REGISTRATIONS
                  </th>
                  <th className="font-mono" style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, index) => {
                  const isCurrentAdmin = currentAdminUser?.email?.toLowerCase() === u.email?.toLowerCase();
                  const initials = (u.name || u.email || 'U')
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom: '1px solid #E4E4E7',
                        backgroundColor: u.hasActiveSession ? '#F0FDF4' : index % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      {/* Row number */}
                      <td className="font-mono" style={{ padding: '0.75rem 0.85rem', fontWeight: 700, color: '#71717A' }}>
                        {(page - 1) * pagination.limit + index + 1}
                      </td>

                      {/* User Account */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '6px',
                              backgroundColor: u.isAdmin ? '#FEE2E2' : '#DBEAFE',
                              border: '2px solid #000000',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 900,
                              fontSize: '0.8rem',
                              color: u.isAdmin ? '#DC2626' : '#2563EB',
                              flexShrink: 0,
                            }}
                          >
                            {initials}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontWeight: 800, color: '#000000' }}>{u.name}</span>
                              {isCurrentAdmin && (
                                <span className="badge-brutal badge-sm font-mono" style={{ fontSize: '0.62rem', backgroundColor: '#FEF08A' }}>
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="font-mono" style={{ fontSize: '0.76rem', color: '#52525B' }}>
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td style={{ padding: '0.75rem 0.85rem' }}>
                        <span
                          className={`badge-brutal ${u.isAdmin ? 'badge-red' : 'badge-blue'}`}
                          style={{
                            fontSize: '0.65rem',
                            padding: '2px 6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          {u.isAdmin && <Shield size={10} />}
                          {u.isAdmin ? 'ADMIN' : 'USER'}
                        </span>
                      </td>

                      {/* Verification Status */}
                      <td style={{ padding: '0.75rem 0.85rem' }}>
                        <span
                          className={`badge-brutal ${u.emailVerified ? 'badge-green' : 'badge-yellow'}`}
                          style={{
                            fontSize: '0.65rem',
                            padding: '2px 6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          {u.emailVerified ? <CheckCircle size={10} /> : <AlertTriangle size={10} />}
                          {u.emailVerified ? 'VERIFIED' : 'UNVERIFIED'}
                        </span>
                      </td>

                      {/* Online status */}
                      <td style={{ padding: '0.75rem 0.85rem' }}>
                        {u.hasActiveSession ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <span
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: '#16A34A',
                                display: 'inline-block',
                                boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.4)',
                              }}
                            />
                            <span className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 800, color: '#15803D' }}>
                              ONLINE
                            </span>
                          </div>
                        ) : (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <span
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: '#A1A1AA',
                                display: 'inline-block',
                              }}
                            />
                            <span className="font-mono" style={{ fontSize: '0.72rem', color: '#71717A' }}>
                              OFFLINE
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Registered Date */}
                      <td className="font-mono" style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', color: '#52525B' }}>
                        {formatDateTime(u.createdAt)}
                      </td>

                      {/* Last Login */}
                      <td className="font-mono" style={{ padding: '0.75rem 1rem', fontSize: '0.78rem' }}>
                        {u.lastLoginAt ? (
                          <div>
                            <span style={{ fontWeight: 700, color: '#18181B' }}>{formatRelativeTime(u.lastLoginAt)}</span>
                            <div style={{ fontSize: '0.7rem', color: '#71717A' }}>{formatDateTime(u.lastLoginAt)}</div>
                          </div>
                        ) : (
                          <span style={{ color: '#A1A1AA' }}>Never logged in</span>
                        )}
                      </td>

                      {/* Registered Events Count */}
                      <td style={{ padding: '0.75rem 0.85rem' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenUserEvents(u)}
                          className="btn-brutal btn-sm font-mono"
                          title="Click to view events registered by this user"
                          style={{
                            fontSize: '0.72rem',
                            padding: '3px 8px',
                            backgroundColor: u.eventsCount > 0 ? '#FEF08A' : '#F4F4F5',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          🎟️ {u.eventsCount} Event{u.eventsCount === 1 ? '' : 's'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '5px', alignItems: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenUserEvents(u)}
                            className="btn-brutal btn-sm font-mono"
                            title="View registered events"
                            style={{ padding: '3px 7px', fontSize: '0.75rem' }}
                          >
                            <Eye size={12} />
                          </button>

                          {u.hasActiveSession && (
                            <button
                              type="button"
                              onClick={() => setRevokingUserTarget(u)}
                              className="btn-brutal btn-sm btn-yellow font-mono"
                              title="Revoke active login sessions"
                              style={{ padding: '3px 7px', fontSize: '0.75rem' }}
                            >
                              <Key size={12} />
                            </button>
                          )}

                          {!isCurrentAdmin && (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(u)}
                              className="btn-brutal btn-sm btn-red font-mono"
                              title="Delete user account"
                              style={{ padding: '3px 7px', fontSize: '0.75rem' }}
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
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
              Showing page {page} of {pagination.pages} ({pagination.total} registered accounts)
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                disabled={page <= 1}
                onClick={() => fetchUsers(page - 1, search, roleFilter)}
                className="btn-brutal btn-sm font-mono"
                style={{ fontSize: '0.75rem' }}
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.pages}
                onClick={() => fetchUsers(page + 1, search, roleFilter)}
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
      {/* MODAL 1: USER'S REGISTERED EVENTS MODAL */}
      {/* ------------------------------------------------------------------ */}
      {selectedUserForEvents && (
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
          onClick={() => setSelectedUserForEvents(null)}
        >
          <div
            className="card-static-lg"
            style={{
              backgroundColor: '#FFFFFF',
              maxWidth: '650px',
              width: '100%',
              padding: '2rem',
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span className="badge-brutal badge-yellow font-mono" style={{ fontSize: '0.7rem' }}>
                  USER REGISTRATIONS
                </span>
                <h3 className="font-pixel" style={{ fontSize: '1.15rem', margin: '0.5rem 0 0 0' }}>
                  {selectedUserForEvents.name}
                </h3>
                <p className="font-mono" style={{ fontSize: '0.78rem', color: '#52525B', margin: '4px 0 0 0' }}>
                  {selectedUserForEvents.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserForEvents(null)}
                className="btn-brutal btn-sm font-mono"
                style={{ padding: '4px 8px' }}
              >
                <X size={16} />
              </button>
            </div>

            {userEventsModalLoading ? (
              <div style={{ padding: '3rem', textAlign: 'center' }} className="font-mono">
                Loading event registrations...
              </div>
            ) : userEventsList.length === 0 ? (
              <div
                className="card-static"
                style={{
                  padding: '2.5rem',
                  textAlign: 'center',
                  backgroundColor: '#F4F4F5',
                  border: '2px dashed #71717A',
                }}
              >
                <Calendar size={32} style={{ color: '#71717A', margin: '0 auto 0.5rem auto' }} />
                <div className="font-mono" style={{ fontWeight: 800, fontSize: '0.9rem' }}>
                  No event registrations found.
                </div>
                <p className="font-mono" style={{ fontSize: '0.75rem', color: '#71717A', margin: '4px 0 0 0' }}>
                  This user has not registered for any events yet.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {userEventsList.map((reg) => (
                  <div
                    key={reg.id}
                    className="card-static"
                    style={{
                      padding: '1rem',
                      border: '2px solid #000000',
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className="badge-brutal badge-sm font-mono" style={{ fontSize: '0.65rem' }}>
                        {reg.event?.category || 'Event'}
                      </span>
                      <span className="badge-brutal badge-green" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                        {reg.status?.toUpperCase() || 'CONFIRMED'}
                      </span>
                    </div>

                    <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                      {reg.event?.title || 'Unknown Event'}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.75rem', color: '#52525B' }}>
                      {reg.event?.date && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} />
                          <span>{new Date(reg.event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      )}
                      {reg.event?.venue && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} />
                          <span>{reg.event.venue}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} />
                        <span>Registered on: {formatDateTime(reg.registeredAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setSelectedUserForEvents(null)}
                className="btn-brutal btn-sm font-mono"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL 2: REVOKE SESSIONS CONFIRMATION */}
      {/* ------------------------------------------------------------------ */}
      {revokingUserTarget && (
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
          onClick={() => setRevokingUserTarget(null)}
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
            <div className="badge-brutal badge-yellow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '1rem' }}>
              <Key size={14} />
              REVOKE SESSIONS
            </div>
            <h3 className="font-pixel" style={{ fontSize: '1.15rem', marginBottom: '0.75rem' }}>
              SIGN_OUT_USER?
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#18181B', lineHeight: '1.5', marginBottom: '1.25rem' }}>
              Force sign out for:
              <br />
              <strong>{revokingUserTarget.name}</strong> ({revokingUserTarget.email})?
              <br />
              All currently active login sessions for this account will be invalidated immediately.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                disabled={revokingLoading}
                onClick={() => setRevokingUserTarget(null)}
                className="btn-brutal font-mono"
                style={{ fontSize: '0.85rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={revokingLoading}
                onClick={handleRevokeUserSessions}
                className="btn-brutal btn-yellow font-mono"
                style={{ fontSize: '0.85rem', fontWeight: 800 }}
              >
                {revokingLoading ? 'Revoking...' : 'Revoke All Sessions'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL 3: DELETE USER ACCOUNT CONFIRMATION */}
      {/* ------------------------------------------------------------------ */}
      {deleteTarget && (
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
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="card-static-lg"
            style={{
              backgroundColor: '#FFFFFF',
              maxWidth: '480px',
              width: '100%',
              padding: '2rem',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="badge-brutal badge-red" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '1rem' }}>
              <AlertTriangle size={14} />
              PERMANENT DELETION
            </div>
            <h3 className="font-pixel" style={{ fontSize: '1.15rem', marginBottom: '0.75rem', color: '#DC2626' }}>
              DELETE_ACCOUNT?
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#18181B', lineHeight: '1.5', marginBottom: '1.25rem' }}>
              Are you sure you want to delete user account:
              <br />
              <strong>{deleteTarget.name}</strong> ({deleteTarget.email})?
            </p>
            <div
              className="card-static"
              style={{
                backgroundColor: '#FEF2F2',
                border: '2px solid #EF4444',
                padding: '0.85rem',
                textAlign: 'left',
                marginBottom: '1.5rem',
                fontSize: '0.78rem',
                color: '#991B1B',
              }}
            >
              <strong>⚠️ Warning:</strong> This will permanently erase this user from the database, along with all their event registrations and authentication sessions.
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setDeleteTarget(null)}
                className="btn-brutal font-mono"
                style={{ fontSize: '0.85rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDeleteUser}
                className="btn-brutal btn-red font-mono"
                style={{ fontSize: '0.85rem', fontWeight: 800 }}
              >
                {deleteLoading ? 'Deleting...' : '🗑️ Yes, Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRegisteredAccounts;
