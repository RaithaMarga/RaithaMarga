import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  getAdminOverview,
  getAdminUsers,
  getAdminVerifications,
  updateAdminUserStatus,
  updateAdminVerification,
} from '../lib/adminApi';

const AdminDataContext = createContext(null);
const VERIFICATION_STATUSES = ['PENDING', 'VERIFIED', 'REJECTED'];

export const AdminDataProvider = ({ children }) => {
  const [overview, setOverview] = useState(null);
  const [verificationQueue, setVerificationQueue] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usersError, setUsersError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextOverview, verificationGroups] = await Promise.all([
        getAdminOverview(),
        Promise.all(VERIFICATION_STATUSES.map((status) => getAdminVerifications({ status }))),
      ]);
      setOverview(nextOverview);
      setVerificationQueue(verificationGroups.flat());
      return nextOverview;
    } catch (requestError) {
      setError(requestError);
      throw requestError;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => refresh()).catch(() => {});
  }, [refresh]);

  const updateVerification = useCallback(async (record, status, note) => {
    const previousQueue = verificationQueue;
    const previousOverview = overview;
    const oldStatus = record.verificationStatus;
    const optimisticRecord = {
      ...record,
      verificationStatus: status,
      verificationNote: note || undefined,
      verifiedAt: status === 'VERIFIED' ? new Date().toISOString() : undefined,
    };
    setVerificationQueue((current) => current.map((item) =>
      item.uid === record.uid && item.role === record.role ? optimisticRecord : item));
    setOverview((current) => {
      if (!current) return current;
      const next = { ...current };
      const pendingKey = record.role === 'FARMER' ? 'pendingFarmers' : 'pendingBuyers';
      if (oldStatus === 'PENDING' && status !== 'PENDING') next[pendingKey] = Math.max(0, next[pendingKey] - 1);
      if (oldStatus !== 'PENDING' && status === 'PENDING') next[pendingKey] += 1;
      if (record.role === 'BUYER') {
        if (oldStatus === 'VERIFIED' && status !== 'VERIFIED') next.verifiedBuyers = Math.max(0, next.verifiedBuyers - 1);
        if (oldStatus !== 'VERIFIED' && status === 'VERIFIED') next.verifiedBuyers += 1;
      }
      return next;
    });
    setError(null);
    try {
      const saved = await updateAdminVerification(record.role, record.uid, status, note);
      setVerificationQueue((current) => current.map((item) =>
        item.uid === record.uid && item.role === record.role ? saved : item));
      return saved;
    } catch (requestError) {
      setVerificationQueue(previousQueue);
      setOverview(previousOverview);
      setError(requestError);
      throw requestError;
    }
  }, [overview, verificationQueue]);

  const approve = useCallback((record, note = '') =>
    updateVerification(record, 'VERIFIED', note), [updateVerification]);
  const reject = useCallback((record, note) =>
    updateVerification(record, 'REJECTED', note), [updateVerification]);
  const setVerificationStatus = useCallback((record, status, note = '') =>
    updateVerification(record, status, note), [updateVerification]);

  const loadUsers = useCallback(async (filters = {}) => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const result = await getAdminUsers(filters);
      setUsers(result);
      return result;
    } catch (requestError) {
      setUsersError(requestError);
      throw requestError;
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const setUserStatus = useCallback(async (uid, status) => {
    const previousUsers = users;
    setUsers((current) => current.map((user) => user.uid === uid ? { ...user, status } : user));
    setUsersError(null);
    try {
      const saved = await updateAdminUserStatus(uid, status);
      setUsers((current) => current.map((user) => user.uid === uid ? saved : user));
      return saved;
    } catch (requestError) {
      setUsers(previousUsers);
      setUsersError(requestError);
      throw requestError;
    }
  }, [users]);

  const value = useMemo(() => ({
    overview,
    verificationQueue,
    users,
    loading,
    usersLoading,
    error,
    usersError,
    refresh,
    approve,
    reject,
    setVerificationStatus,
    loadUsers,
    setUserStatus,
  }), [
    overview, verificationQueue, users, loading, usersLoading, error, usersError,
    refresh, approve, reject, setVerificationStatus, loadUsers, setUserStatus,
  ]);

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (!context) throw new Error('useAdminData must be used within an AdminDataProvider');
  return context;
};
