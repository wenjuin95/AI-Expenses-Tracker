import React, { useState } from "react";
import { saveExpense } from "../api/expenseApi";
import type { Receipt, ReceiptItem } from "../types/expenses";

export default function ManualEntry() {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Start with a blank default state
    const [draft, setDraft] = useState<Receipt>({
        merchant_name: "",
        date: new Date().toISOString().split('T')[0], // Defaults to today
        currency: "MYR",
        subtotal: 0,
        discount: 0,
        tax: 0,
        total_amount: 0,
        amount_paid: 0,
        payment_method: "",
        category: "Food", // Default category
        items: [],
    });

    const updateField = (field: keyof Receipt, value: string | number | undefined) => {
        setDraft((current) => ({ ...current, [field]: value }));
    };

    const updateItem = (itemIndex: number, field: keyof ReceiptItem, value: string | number) => {
        setDraft((current) => {
            const items = [...current.items];
            items[itemIndex] = { ...items[itemIndex], [field]: value };
            return { ...current, items };
        });
    };

    const addItem = () => {
        setDraft((current) => ({
            ...current,
            items: [...current.items, { name: "", quantity: 1, price: 0 }],
        }));
    };

    const removeItem = (itemIndexToRemove: number) => {
        setDraft((current) => ({
            ...current,
            items: current.items.filter((_, idx) => idx !== itemIndexToRemove),
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevent standard form submission

        if (!draft.merchant_name || draft.total_amount <= 0) {
            setError("Merchant name and a Total Amount greater than 0 are required.");
            return;
        }

        try {
            setSaving(true);
            setError(null);

            await saveExpense(draft);

            // Reload the page to reset the form and refresh the overview list below
            window.location.reload();

        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save expense.");
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                <h2 className="text-lg font-bold text-slate-900">Manual Entry</h2>
                <p className="text-xs text-slate-500 mt-1">Add a new expense manually</p>
            </div>

            {error && (
                <div className="mx-6 mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                    {error}
                </div>
            )}

            <div className="p-6 space-y-6">
                {/* Basic Details */}
                <section>
                    <h3 className="text-sm font-semibold text-slate-900 mb-4">Basic Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Merchant *</label>
                            <input
                                type="text"
                                required
                                value={draft.merchant_name ?? ""}
                                onChange={(e) => updateField("merchant_name", e.target.value)}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. Starbucks"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
                            <input
                                type="date"
                                required
                                value={draft.date ?? ""}
                                onChange={(e) => updateField("date", e.target.value)}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
                            <select
                                value={draft.category ?? ""}
                                onChange={(e) => updateField("category", e.target.value as any)}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="Food">Food</option>
                                <option value="Transport">Transport</option>
                                <option value="Utilities">Utilities</option>
                                <option value="Shopping">Shopping</option>
                                <option value="Entertainment">Entertainment</option>
                                <option value="Health">Health</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Payment Method</label>
                            <input
                                type="text"
                                value={draft.payment_method ?? ""}
                                onChange={(e) => updateField("payment_method", e.target.value)}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. Credit Card, Cash"
                            />
                        </div>
                    </div>
                </section>

                {/* Financials */}
                <section>
                    <h3 className="text-sm font-semibold text-slate-900 mb-4">Financials</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Currency</label>
                            <input
                                type="text"
                                value={draft.currency ?? ""}
                                onChange={(e) => updateField("currency", e.target.value)}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm uppercase"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Tax</label>
                            <input
                                type="number"
                                step="0.01"
                                value={draft.tax || ""}
                                onChange={(e) => updateField("tax", e.target.value === "" ? 0 : Number(e.target.value))}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-slate-700 mb-1">Total Amount *</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={draft.total_amount || ""}
                                onChange={(e) => updateField("total_amount", e.target.value === "" ? 0 : Number(e.target.value))}
                                className="w-full border border-blue-400 bg-blue-50 rounded-lg px-3 py-2 text-sm font-bold text-blue-900"
                            />
                        </div>
                    </div>
                </section>

                {/* Line Items */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-900">Line Items (Optional)</h3>
                        <button
                            type="button"
                            onClick={addItem}
                            className="text-sm text-blue-600 font-medium hover:text-blue-700"
                        >
                            + Add Item
                        </button>
                    </div>

                    {draft.items.length === 0 ? (
                        <div className="border border-dashed border-slate-300 rounded-lg p-6 text-center text-sm text-slate-400">
                            No line items added.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {draft.items.map((item, idx) => (
                                <div key={idx} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                        <div className="md:col-span-6">
                                            <label className="block text-xs font-medium text-slate-500 mb-1">Item Name</label>
                                            <input
                                                type="text"
                                                value={item.name ?? ""}
                                                onChange={(e) => updateItem(idx, "name", e.target.value)}
                                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                            />
                                        </div>
                                        <div className="md:col-span-3 col-span-1/2">
                                            <label className="block text-xs font-medium text-slate-500 mb-1">Qty</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={item.quantity ?? ""}
                                                onChange={(e) => updateItem(idx, "quantity", e.target.value === "" ? 0 : Number(e.target.value))}
                                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                            />
                                        </div>
                                        <div className="md:col-span-3 col-span-1/2">
                                            <label className="block text-xs font-medium text-slate-500 mb-1">Price</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={item.price ?? ""}
                                                onChange={(e) => updateItem(idx, "price", e.target.value === "" ? 0 : Number(e.target.value))}
                                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                            />
                                        </div>
                                        <div className="md:col-span-12">
                                            <button
                                                type="button"
                                                onClick={() => removeItem(idx)}
                                                className="w-full py-1.5 text-xs text-red-600 border border-red-200 bg-white rounded-lg hover:bg-red-50 transition-colors"
                                            >
                                                Remove Line Item
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Actions */}
                <div className="flex justify-end pt-4 border-t border-slate-200">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                        {saving ? "Saving..." : "Save Manual Expense"}
                    </button>
                </div>
            </div>
        </form>
    );
}
