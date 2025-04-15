'use client';
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import CategoryTable from '@/components/modules/categories/CategoryTable';
import CategoryForm from '@/components/modules/categories/CategoryForm';
import { Category } from '@/types/category';
import { categoryService } from '@/services/categoryService';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    loadCategories();
  }, [debouncedSearch]);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories(debouncedSearch);
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryService.deleteCategory(id);
        await loadCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedCategory) {
        await categoryService.updateCategory(selectedCategory.id, data);
      } else {
        await categoryService.createCategory(data);
      }
      await loadCategories();
      setIsFormOpen(false);
      setSelectedCategory(undefined);
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
        <button
          onClick={() => {
            setSelectedCategory(undefined);
            setIsFormOpen(true);
          }}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Add New Category
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 text-black"
          />
        </div>
      </div>

      <div className="rounded-lg bg-white shadow">
        <CategoryTable
          categories={categories}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <CategoryForm
        category={selectedCategory}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedCategory(undefined);
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}