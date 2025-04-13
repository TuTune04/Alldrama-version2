'use client';
import { useForm } from 'react-hook-form';
import { User } from '@/types/user';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface UserFormProps {
  user?: User;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export default function UserForm({ user, isOpen, onClose, onSubmit }: UserFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: user || {
      username: '',
      email: '',
      fullName: '',
      role: 'user',
      status: 'active'
    }
  });

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-medium text-black">
                {user ? 'Edit User' : 'Add New User'}
              </Dialog.Title>
              <button onClick={onClose}>
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
              {user && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">User ID</label>
                  <input
                    type="text"
                    value={user.id}
                    disabled
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-black"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  {...register('username', { required: 'Username is required' })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  {...register('fullName', { required: 'Full name is required' })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    {...register('role')}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    {...register('status')}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
                >
                  {user ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
}