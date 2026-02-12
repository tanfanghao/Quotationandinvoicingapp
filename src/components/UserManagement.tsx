import { useState } from 'react';
import { UserPlus, Trash2, Edit2, Save, X, Eye, EyeOff, Shield, User as UserIcon } from 'lucide-react';
import * as api from '../utils/api';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
}

interface UserManagementProps {
  users: AppUser[];
  onUsersChange: (users: AppUser[]) => void;
  currentUserId: string;
}

export function UserManagement({ users, onUsersChange, currentUserId }: UserManagementProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'user' as 'admin' | 'user',
  });

  const handleAdd = () => {
    setIsAdding(true);
    setFormData({
      email: '',
      password: '',
      name: '',
      role: 'user',
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setShowPassword(false);
    setFormData({
      email: '',
      password: '',
      name: '',
      role: 'user',
    });
  };

  const handleSave = async () => {
    if (!formData.email || !formData.name) {
      alert('Please fill in all required fields');
      return;
    }

    if (isAdding && !formData.password) {
      alert('Password is required for new users');
      return;
    }

    if (isAdding) {
      // Create new user
      const success = await api.createUser(formData.email, formData.password, formData.name, formData.role);
      if (success) {
        alert('User created successfully!');
        // Refresh users list
        const updatedUsers = await api.fetchUsers();
        onUsersChange(updatedUsers);
        handleCancel();
      } else {
        alert('Failed to create user. Please try again.');
      }
    } else if (editingId) {
      // Update existing user
      const updatedUser: AppUser = {
        id: editingId,
        email: formData.email,
        name: formData.name,
        role: formData.role,
        createdAt: users.find(u => u.id === editingId)?.createdAt || new Date().toISOString(),
      };
      
      const success = await api.updateUser(updatedUser);
      if (success) {
        const updated = users.map(u => u.id === editingId ? updatedUser : u);
        onUsersChange(updated);
        handleCancel();
      } else {
        alert('Failed to update user. Please try again.');
      }
    }
  };

  const handleEdit = (user: AppUser) => {
    setEditingId(user.id);
    setFormData({
      email: user.email,
      password: '',
      name: user.name,
      role: user.role,
    });
  };

  const handleDelete = async (id: string) => {
    if (id === currentUserId) {
      alert('You cannot delete your own account');
      return;
    }

    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    const success = await api.deleteUser(id);
    if (success) {
      onUsersChange(users.filter(u => u.id !== id));
    } else {
      alert('Failed to delete user. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-500 mt-1">Manage user accounts and permissions</p>
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow"
          >
            <UserPlus className="w-4 h-4" />
            Add User
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {isAdding ? 'Add New User' : 'Edit User'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Full Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="email@example.com"
                disabled={!isAdding}
              />
            </div>

            {isAdding && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No users found. Add your first user to get started.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        user.role === 'admin' ? 'bg-purple-100' : 'bg-blue-100'
                      }`}>
                        {user.role === 'admin' ? (
                          <Shield className={`w-5 h-5 text-purple-600`} />
                        ) : (
                          <UserIcon className={`w-5 h-5 text-blue-600`} />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        {user.id === currentUserId && (
                          <span className="text-xs text-blue-600">(You)</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {user.id !== currentUserId && (
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
