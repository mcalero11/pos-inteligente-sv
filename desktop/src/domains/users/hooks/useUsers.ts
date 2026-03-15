import { useState, useEffect, useCallback } from "preact/hooks";
import type { User } from "../entities/User";
import { userService } from "../services/UserService";

interface UseUsersOptions {
  activeOnly?: boolean;
  autoLoad?: boolean;
  cashiersOnly?: boolean;
}

interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  getUserById: (id: number) => Promise<User | null>;
}

export function useUsers(options: UseUsersOptions = {}): UseUsersReturn {
  const { activeOnly = true, autoLoad = true, cashiersOnly = false } = options;

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = cashiersOnly
        ? await userService.getCashiers()
        : await userService.findAll(activeOnly);

      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [activeOnly, cashiersOnly]);

  const getUserById = useCallback(async (id: number): Promise<User | null> => {
    try {
      return await userService.findById(id);
    } catch (err) {
      console.error("Failed to fetch user:", err);
      return null;
    }
  }, []);

  useEffect(() => {
    if (autoLoad) {
      loadUsers();
    }
  }, [autoLoad, loadUsers]);

  return {
    users,
    loading,
    error,
    reload: loadUsers,
    getUserById,
  };
}
