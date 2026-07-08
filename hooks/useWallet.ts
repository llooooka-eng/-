/**
 * useWallet — hook (مسار الخادم) يجمع رصيد المحفظة وحركاتها مع:
 * - تحديث لحظي للرصيد (Realtime)
 * - سحب للتحديث (pull-to-refresh)
 * - ترقيم لا نهائي (load more)
 *
 * ملاحظة: شاشة المحفظة في وضع العرض تستخدم المتجر المحلي (useAuth) لا هذا الـ hook.
 */
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import * as walletService from "@/services/walletService";
import type { WalletTransaction } from "@/types/database";

const PAGE_SIZE = 20;

export function useWallet() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadFirstPage = useCallback(async () => {
    const [wallet, tx] = await Promise.all([
      walletService.getWallet(),
      walletService.listTransactions({ limit: PAGE_SIZE }),
    ]);
    setBalance(wallet?.balance ?? 0);
    setTransactions(tx);
    setHasMore(tx.length === PAGE_SIZE);
  }, []);

  // التحميل الأولي + الاشتراك اللحظي
  useEffect(() => {
    let unsubscribe = () => {};
    (async () => {
      setLoading(true);
      try {
        await loadFirstPage();
      } finally {
        setLoading(false);
      }
    })();

    if (user) {
      unsubscribe = walletService.subscribeToWallet(user.id, (wallet) => {
        setBalance(wallet.balance);
        loadFirstPage(); // أعِد جلب الحركات لتظهر الحركة الجديدة
      });
    }
    return () => unsubscribe();
  }, [user, loadFirstPage]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadFirstPage();
    } finally {
      setRefreshing(false);
    }
  }, [loadFirstPage]);

  const loadMore = useCallback(async () => {
    if (!hasMore || transactions.length === 0) return;
    const last = transactions[transactions.length - 1];
    const more = await walletService.listTransactions({ limit: PAGE_SIZE, before: last.created_at });
    setTransactions((prev) => [...prev, ...more]);
    setHasMore(more.length === PAGE_SIZE);
  }, [hasMore, transactions]);

  return { balance, transactions, loading, refreshing, hasMore, refresh, loadMore };
}
