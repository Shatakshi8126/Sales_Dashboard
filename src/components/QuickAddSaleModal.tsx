import React, { useState } from 'react';
import { X, Plus, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { createOrder } from '../services/salesService';
import { User, Product } from '../types/sales';
import { formatINR } from '../utils/currencyUtils';

interface QuickAddSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableProducts: Product[];
  availableSalespeople: User[];
  availableCustomers: User[];
}

export const QuickAddSaleModal: React.FC<QuickAddSaleModalProps> = ({
  isOpen,
  onClose,
  availableProducts,
  availableSalespeople,
  availableCustomers,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<number>(
    availableProducts[0]?.prod_id || 1001
  );
  const [selectedCustomer, setSelectedCustomer] = useState<number>(
    availableCustomers[0]?.user_id || 1011
  );
  const [selectedSalesperson, setSelectedSalesperson] = useState<number>(
    availableSalespeople[0]?.user_id || 1002
  );
  const [amount, setAmount] = useState<string>(
    availableProducts[0]?.amount?.toString() || '750.00'
  );
  const [discount, setDiscount] = useState<string>('0');
  const [orderDate, setOrderDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleProductChange = (prodId: number) => {
    setSelectedProduct(prodId);
    const prod = availableProducts.find((p) => p.prod_id === prodId);
    if (prod && prod.amount) {
      setAmount(prod.amount.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const newOrder = await createOrder({
        order_date_time: orderDate,
        user_id: selectedCustomer,
        product_id: selectedProduct,
        amount: parseFloat(amount) || 0,
        discount_amount: parseFloat(discount) || 0,
        created_by: selectedSalesperson,
      });

      setStatusMessage({
        type: 'success',
        text: `Order #${newOrder.order_no} created! Live Supabase Realtime broadcast sent.`,
      });

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Failed to create order:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to insert sale into Supabase.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-dropdown max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              Create Live Sale
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Insert real sale into Supabase & test Realtime sync</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 text-xs">
          {statusMessage && (
            <div
              className={`p-3 rounded-lg flex items-center gap-2 text-xs ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Product Select */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Product / Plan</label>
            <select
              value={selectedProduct}
              onChange={(e) => handleProductChange(Number(e.target.value))}
              className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-hidden"
              required
            >
              {availableProducts.slice(0, 50).map((p) => (
                <option key={p.prod_id} value={p.prod_id}>
                  {p.productName} ({p.simMode === 2 ? 'eSIM' : 'Plastic SIM'}) - {formatINR(p.amount)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Customer Select */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Customer</label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(Number(e.target.value))}
                className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-hidden"
                required
              >
                {availableCustomers.slice(0, 30).map((c) => (
                  <option key={c.user_id} value={c.user_id}>
                    {c.name} ({c.mobile || `#${c.user_id}`})
                  </option>
                ))}
              </select>
            </div>

            {/* Sales Rep Select */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Sales Representative</label>
              <select
                value={selectedSalesperson}
                onChange={(e) => setSelectedSalesperson(Number(e.target.value))}
                className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-hidden"
                required
              >
                {availableSalespeople.map((s) => (
                  <option key={s.user_id} value={s.user_id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Amount */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-hidden font-mono"
                required
              />
            </div>

            {/* Discount */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Discount (₹)</label>
              <input
                type="number"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-hidden font-mono"
              />
            </div>

            {/* Date */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Date</label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-hidden"
                required
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white bg-sky-600 hover:bg-sky-700 font-semibold shadow-sm transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Insert Sale</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
