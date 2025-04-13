'use client';
import { useForm } from 'react-hook-form';
import { Movie } from '@/types/movie';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface MovieFormProps {
  movie?: Movie;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export default function MovieForm({ movie, isOpen, onClose, onSubmit }: MovieFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: movie || {
      title: '',
      releaseYear: new Date().getFullYear(),
      duration: 0,
      status: 'draft',
      genres: [],
      rating: 0
    }
  });

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg text-black font-medium">
                {movie ? 'Edit Movie' : 'Add New Movie'}
              </Dialog.Title>
              <button onClick={onClose}>
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  {...register('title', { required: 'Title is required' })}
                  className="mt-1 block w-full rounded-md text-black border border-gray-300 px-3 py-2"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Release Year</label>
                  <input
                    type="number"
                    {...register('releaseYear', { required: true })}
                    className="mt-1 block w-full rounded-md text-black border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration (min)</label>
                  <input
                    type="number"
                    {...register('duration', { required: true })}
                    className="mt-1 block w-full rounded-md text-black border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  {...register('status')}
                  className="mt-1 block w-full rounded-md text-black border border-gray-300 px-3 py-2"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
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
                  {movie ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
}