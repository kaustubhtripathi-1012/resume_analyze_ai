import React, { useEffect, useState } from 'react';
import { Users, Search, Shield, ShieldAlert, Check, X } from 'lucide-react';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { adminApi } from '../api/admin';
import { User } from '../store/authStore';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  const fetchUsers = () => {
    setLoading(true);
    adminApi.getUsers({ q: search, limit: 50 })
      .then((data) => {
        setUsers(data.items || []);
        setTotal(data.total || 0);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUserStatus = async (user: User) => {
    const currentActive = (user as any).isActive ?? true;
    try {
      await adminApi.updateUser(user.id, { isActive: !currentActive });
      setUsers(users.map((u) => u.id === user.id ? { ...u, isActive: !currentActive } as any : u));
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to update user status.');
    }
  };

  const columns = [
    {
      header: 'Name & Email',
      render: (u: User) => (
        <div>
          <span className="font-semibold text-slate-900 block">{u.name}</span>
          <span className="text-xs text-muted">{u.email}</span>
        </div>
      )
    },
    {
      header: 'Role',
      render: (u: User) => (
        <span className={`text-xs uppercase font-bold px-2.5 py-0.5 rounded ${
          u.role === 'admin'
            ? 'bg-purple-100 text-purple-800'
            : u.role === 'recruiter'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-slate-100 text-slate-700'
        }`}>
          {u.role}
        </span>
      )
    },
    {
      header: 'Account Status',
      render: (u: any) => {
        const active = u.isActive ?? true;
        return (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
          }`}>
            {active ? 'Active' : 'Deactivated'}
          </span>
        );
      }
    },
    {
      header: 'Actions',
      render: (u: any) => {
        const active = u.isActive ?? true;
        return (
          <Button
            variant={active ? 'secondary' : 'primary'}
            className="h-8 px-3 text-xs"
            onClick={() => toggleUserStatus(u)}
          >
            {active ? 'Deactivate' : 'Activate'}
          </Button>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-sm text-muted mt-0.5">View and manage registered candidates, recruiters, and admins.</p>
        </div>
        <div className="text-sm text-muted">
          Total Users: <strong className="text-slate-900">{total}</strong>
        </div>
      </div>

      <div className="flex gap-2 max-w-sm">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="flex-1 h-9 px-3 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <Button onClick={fetchUsers} className="h-9 px-4">
          Search
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading users..." />
      ) : (
        <Card>
          <Table
            columns={columns}
            data={users}
            keyExtractor={(u) => u.id}
          />
        </Card>
      )}
    </div>
  );
};

