import { useState, useEffect, useCallback } from "preact/hooks";
import type { Customer } from "../entities/Customer";
import { customerService } from "../services/CustomerService";

interface UseCustomersOptions {
  activeOnly?: boolean;
  autoLoad?: boolean;
}

interface UseCustomersReturn {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  searchCustomers: (query: string) => Promise<Customer[]>;
  getCustomerById: (id: number) => Promise<Customer | null>;
}

export function useCustomers(
  options: UseCustomersOptions = {}
): UseCustomersReturn {
  const { activeOnly = true, autoLoad = true } = options;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await customerService.findAll(activeOnly);
      setCustomers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, [activeOnly]);

  const searchCustomers = useCallback(
    async (query: string): Promise<Customer[]> => {
      try {
        return await customerService.search(query);
      } catch (err) {
        console.error("Customer search failed:", err);
        return [];
      }
    },
    []
  );

  const getCustomerById = useCallback(
    async (id: number): Promise<Customer | null> => {
      try {
        return await customerService.findById(id);
      } catch (err) {
        console.error("Failed to fetch customer:", err);
        return null;
      }
    },
    []
  );

  useEffect(() => {
    if (autoLoad) {
      loadCustomers();
    }
  }, [autoLoad, loadCustomers]);

  return {
    customers,
    loading,
    error,
    reload: loadCustomers,
    searchCustomers,
    getCustomerById,
  };
}
