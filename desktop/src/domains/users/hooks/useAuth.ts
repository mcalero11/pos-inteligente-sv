import { useState, useCallback } from 'preact/hooks';
import type { User } from '../entities/User';
import { userService } from '../services/UserService';
import { auditService } from '../../audit/services/AuditService';

interface UseAuthReturn {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  login: (userId: number, pin: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

export function useAuth(): UseAuthReturn {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (userId: number, pin: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const isValid = await userService.authenticateByPin(userId, pin);

      if (isValid) {
        const user = await userService.findById(userId);
        if (user) {
          setCurrentUser(user);
          await auditService.logLogin(userId);
          return true;
        }
      }

      setError('PIN incorrecto');
      return false;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error de autenticación';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    if (currentUser) {
      auditService.logLogout(currentUser.id);
    }
    setCurrentUser(null);
    setError(null);
  }, [currentUser]);

  return {
    currentUser,
    loading,
    error,
    login,
    logout,
    isAuthenticated: currentUser !== null,
  };
}
