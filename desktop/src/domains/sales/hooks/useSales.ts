import { useState, useCallback } from "preact/hooks";
import type { Sale, CreateSaleInput } from "../entities/Sale";
import type { PaymentMethod } from "../entities/PaymentMethod";
import type { Cart } from "../entities/Cart";
import { calculateCartTotals } from "../entities/Cart";
import { salesService } from "../services/SalesService";
import { useWindowManager } from "@/presentation/providers";

interface UseSalesReturn {
  loading: boolean;
  error: string | null;
  createSale: (
    cart: Cart,
    userId: number,
    paymentMethod: PaymentMethod
  ) => Promise<Sale | null>;
  voidSale: (
    saleId: number,
    userId: number,
    reason?: string
  ) => Promise<Sale | null>;
  getSaleById: (id: number) => Promise<Sale | null>;
  getTodaySummary: (userId?: number) => Promise<{
    salesCount: number;
    totalAmount: number;
    averageTicket: number;
  }>;
  createAnotherSale: () => Promise<void>;
}

export function useSales(): UseSalesReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const windowManager = useWindowManager();

  const createSale = useCallback(
    async (
      cart: Cart,
      userId: number,
      paymentMethod: PaymentMethod
    ): Promise<Sale | null> => {
      console.log("starting payment");
      console.log(cart);
      console.log(userId);
      console.log(paymentMethod);
      if (cart.items.length === 0) {
        setError("Cart is empty");
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        const { total } = calculateCartTotals(cart);

        const input: CreateSaleInput = {
          customerId: cart.customerId,
          userId,
          payments: [
            {
              paymentMethod,
              amount: total,
            },
          ],
          notes: cart.notes,
          items: cart.items.map((item) => ({
            productId: item.product.id,
            productName: item.product.name,
            quantity: item.quantity,
            unitPrice: item.product.price,
            discountAmount: item.discountAmount,
          })),
        };

        const sale = await salesService.create(input);
        return sale;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create sale";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const voidSale = useCallback(
    async (
      saleId: number,
      userId: number,
      reason?: string
    ): Promise<Sale | null> => {
      try {
        setLoading(true);
        setError(null);
        const sale = await salesService.voidSale(saleId, userId, reason);
        return sale;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to void sale";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getSaleById = useCallback(async (id: number): Promise<Sale | null> => {
    try {
      return await salesService.findById(id);
    } catch (err) {
      console.error("Failed to fetch sale:", err);
      return null;
    }
  }, []);

  const getTodaySummary = useCallback(
    async (
      userId?: number
    ): Promise<{
      salesCount: number;
      totalAmount: number;
      averageTicket: number;
    }> => {
      try {
        return await salesService.getTodaySummary(userId);
      } catch (err) {
        console.error("Failed to fetch summary:", err);
        return { salesCount: 0, totalAmount: 0, averageTicket: 0 };
      }
    },
    []
  );

  const createAnotherSale = useCallback(async () => {
    await windowManager.createSaleWindow();
  }, [windowManager]);

  return {
    loading,
    error,
    createSale,
    voidSale,
    getSaleById,
    getTodaySummary,
    createAnotherSale,
  };
}
