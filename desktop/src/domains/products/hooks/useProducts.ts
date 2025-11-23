import { useState, useEffect, useCallback } from 'preact/hooks';
import type { Product } from '../entities/Product';
import { productService } from '../services/ProductService';

interface UseProductsOptions {
  categoryId?: number;
  activeOnly?: boolean;
  autoLoad?: boolean;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  searchProducts: (query: string) => Promise<Product[]>;
  getProductByBarcode: (barcode: string) => Promise<Product | null>;
}

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const { categoryId, activeOnly = true, autoLoad = true } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.findAll({ categoryId, activeOnly });
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [categoryId, activeOnly]);

  const searchProducts = useCallback(async (query: string): Promise<Product[]> => {
    try {
      return await productService.search(query);
    } catch (err) {
      console.error('Search failed:', err);
      return [];
    }
  }, []);

  const getProductByBarcode = useCallback(async (barcode: string): Promise<Product | null> => {
    try {
      return await productService.findByBarcode(barcode);
    } catch (err) {
      console.error('Barcode lookup failed:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    if (autoLoad) {
      loadProducts();
    }
  }, [autoLoad, loadProducts]);

  return {
    products,
    loading,
    error,
    reload: loadProducts,
    searchProducts,
    getProductByBarcode,
  };
}
