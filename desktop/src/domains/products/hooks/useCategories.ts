import { useState, useEffect, useCallback } from 'preact/hooks';
import type { Category } from '../entities/Category';
import { categoryService } from '../services/CategoryService';

interface UseCategoriesOptions {
  activeOnly?: boolean;
  autoLoad?: boolean;
}

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  getCategoryById: (id: number) => Category | undefined;
}

export function useCategories(options: UseCategoriesOptions = {}): UseCategoriesReturn {
  const { activeOnly = true, autoLoad = true } = options;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.findAll(activeOnly);
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [activeOnly]);

  const getCategoryById = useCallback(
    (id: number): Category | undefined => {
      return categories.find((c) => c.id === id);
    },
    [categories]
  );

  useEffect(() => {
    if (autoLoad) {
      loadCategories();
    }
  }, [autoLoad, loadCategories]);

  return {
    categories,
    loading,
    error,
    reload: loadCategories,
    getCategoryById,
  };
}
