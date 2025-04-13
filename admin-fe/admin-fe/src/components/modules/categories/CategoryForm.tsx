'use client';
import { useForm } from 'react-hook-form';
import { Category } from '@/types/category';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface CategoryFormProps {
  category?: Category;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export default function CategoryForm({ category, isOpen, onClose, onSubmit }: CategoryFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: category || {
      name: '',
      slug: '',
      description: '',
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
                {category ? 'Edit Category' : 'Add New Category'}
              </Dialog.Title>
              <button onClick={onClose}>
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
              {category && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category ID</label>
                  <input
                    type="text"
                    value={category.id}
                    disabled
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-black"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Slug</label>
                <input
                  type="text"
                  {...register('slug', { required: 'Slug is required' })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black"
                />
                {errors.slug && (
                  <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  {...register('description')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black"
                  rows={3}
                />
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
                  {category ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
}