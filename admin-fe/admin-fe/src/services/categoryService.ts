import { Category } from '@/types/category';
import { mockCategories } from '@/data/mockCategories';

export const categoryService = {
  getCategories: async (search?: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!search) return mockCategories;
    
    return mockCategories.filter(category => 
      category.name.toLowerCase().includes(search.toLowerCase()) ||
      category.description?.toLowerCase().includes(search.toLowerCase())
    );
  },

  createCategory: async (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newCategory = {
      ...category,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockCategories.push(newCategory);
    return newCategory;
  },

  updateCategory: async (id: string, categoryData: Partial<Category>) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockCategories.findIndex(category => category.id === id);
    if (index !== -1) {
      mockCategories[index] = {
        ...mockCategories[index],
        ...categoryData,
        updatedAt: new Date().toISOString()
      };
      return mockCategories[index];
    }
    throw new Error('Category not found');
  },

  deleteCategory: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockCategories.findIndex(category => category.id === id);
    if (index !== -1) {
      mockCategories.splice(index, 1);
    }
  }
};