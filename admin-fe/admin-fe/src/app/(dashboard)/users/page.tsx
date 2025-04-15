'use client';
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import UserTable from '@/components/modules/users/UserTable';
import UserForm from '@/components/modules/users/UserForm';
import { User } from '@/types/user';
import { userService } from '@/services/userService';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>();
  
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    loadUsers();
  }, [debouncedSearch]);

  const loadUsers = async () => {
    try {
      const data = await userService.getUsers(debouncedSearch);
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(id);
        await loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedUser) {
        await userService.updateUser(selectedUser.id, data);
      } else {
        await userService.createUser(data);
      }
      await loadUsers();
      setIsFormOpen(false);
      setSelectedUser(undefined);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
        <button
          onClick={() => {
            setSelectedUser(undefined);
            setIsFormOpen(true);
          }}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Add New User
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 text-black"
          />
        </div>
      </div>

      <div className="rounded-lg bg-white shadow">
        <UserTable
          users={users}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <UserForm
        user={selectedUser}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedUser(undefined);
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}