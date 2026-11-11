import { useState } from "react";
// Ensure you have this function created in your api file
import { saveExpense } from "../api/expenseApi";
import PreventRefresh from "./PreventRefresh";
import Popup from "./Popup";
import type { Receipt, ReceiptItem } from "../types/expenses";

interface ReviewReceiptProps {
    result: Receipt;
    index: number;
    total: number;
    onComplete: () => void;
}

export default function ReviewReceipt({
    result,
    index,
    total,
    onComplete,
}: ReviewReceiptProps) {
    const [saved, setSaved] = useState(false);
    const [discarded, setDiscarded] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDiscardPopup, setShowDiscardPopup] = useState(false);
    const [showSavePopup, setShowSavePopup] = useState(false);

    // Initialize draft state with the data extracted by Gemini
    const [draft, setDraft] = useState<Receipt>(() => ({
        merchant_name: result.merchant_name || "",
        date: result.date || "",
        currency: result.currency || "",
        subtotal: result.subtotal || 0,
        discount: result.discount || 0,
        tax: result.tax || 0,
        total_amount: result.total_amount || 0,
        amount_paid: result.amount_paid || 0,
        payment_method: result.payment_method || "",
        category: result.category,
        items: result.items?.length > 0 ? [...result.items] : [],
    }));

    const handleDiscard = () => {
        setDiscarded(true);
        onComplete();
    };

    const updateField = (
        field: keyof Receipt,
        value: string | number | undefined
    ) => {
        setDraft((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const updateItem = (
        itemIndex: number,
        field: keyof ReceiptItem,
        value: string | number
    ) => {
        setDraft((current) => {
            const items = [...current.items];
            items[itemIndex] = {
                ...items[itemIndex],
                [field]: value,
            };
            return { ...current, items };
        });
    };

    const addItem = () => {
        setDraft((current) => ({
            ...current,
            items: [
                ...current.items,
                { name: "", quantity: 1, price: 0 },
            ],
        }));
    };

    const removeItem = (itemIndexToRemove: number) => {
        setDraft((current) => ({
            ...current,
            items: current.items.filter((_, idx) => idx !== itemIndexToRemove),
        }));
    };

    const handleSave = () => {
        setShowSavePopup(true);
    };

    const confirmSave = async () => {
        setShowSavePopup(false);
        try {
            setSaving(true);
            setError(null);

            // Call your backend or local storage save logic here
            await saveExpense(draft);

            setSaved(true);
            onComplete();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save expense.");
        } finally {
            setSaving(false);
        }
    };

    // Render a minimal card if the user already saved or discarded this specific receipt
    if (saved || discarded) {
        return (
            <div className="w-full h-full">
                <div className="h-full min-h-[300px] bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col items-center justify-center py-16 px-6 text-center">
                    <span className={`px-5 py-2 rounded-full font-bold text-lg ${saved ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {saved ? "Saved" : "Discarded"}
                    </span>
                    <p className="text-sm text-slate-500 mt-4">
                        Receipt {index + 1} of {total}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            <PreventRefresh enabled />

            <Popup
                open={showDiscardPopup}
                type="cancel"
                title="Discard Receipt?"
                message={`Are you sure you want to discard Receipt ${index + 1}?`}
                onOk={() => {
                    setShowDiscardPopup(false);
                    handleDiscard();
                }}
                onCancel={() => setShowDiscardPopup(false)}
                okLabel="Discard"
            />

            <Popup
                open={showSavePopup}
                type="cancel"
                title="Save Expense?"
                message="Are you sure you want to save this expense?"
                onOk={confirmSave}
                onCancel={() => setShowSavePopup(false)}
                okLabel="Save"
            />

            <Popup
                open={Boolean(error)}
                type="error"
                title="Save Error"
                message={error ?? ""}
                onOk={() => setError(null)}
            />

            <div className="bg-white border border-slate-300 rounded-xl shadow-sm overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            Receipt {index + 1}
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Verify AI extracted details
                        </p>
                    </div>
                    <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                        {index + 1} / {total}
                    </span>
                </div>

                <div className="p-6 space-y-6 w">
                    {/* Expense Information */}
                    <section>
                        <h3 className="text-sm font-semibold text-slate-900 mb-4">
                            Basic Details
                        </h3>
                        {/* Responsive grid for inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Merchant</label>
                                <input
                                    type="text"
                                    value={draft.merchant_name ?? ""}
                                    onChange={(e) => updateField("merchant_name", e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
                                <input
                                    type="date"
                                    value={draft.date ?? ""}
                                    onChange={(e) => updateField("date", e.target.value || undefined)}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
                                <select
                                    value={draft.category ?? ""}
                                    onChange={(e) => updateField("category", e.target.value === "" ? undefined : e.target.value as any)}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="" disabled>Select a category...</option>
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
                                />
                            </div>
                        </div>
                    </section>

                    {/* Amounts */}
                    <section>
                        <h3 className="text-sm font-semibold text-slate-900 mb-4">
                            Financials
                        </h3>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Currency</label>
                                <input
                                    type="text"
                                    value={draft.currency ?? ""}
                                    onChange={(e) => updateField("currency", e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Tax</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={draft.tax ?? ""}
                                    onChange={(e) => updateField("tax", e.target.value === "" ? undefined : Number(e.target.value))}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Discount</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={draft.discount || ""}
                                    onChange={(e) => updateField("discount", e.target.value === "" ? 0 : Number(e.target.value))}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-700 mb-1">Total Amount</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={draft.total_amount ?? ""}
                                    onChange={(e) => updateField("total_amount", e.target.value === "" ? 0 : Number(e.target.value))}
                                    className="w-full border border-blue-400 bg-blue-50 rounded-lg px-3 py-2 text-sm font-bold text-slate-700"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Items */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-slate-900">Line Items</h3>
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
                                No items found.
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
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={() => setShowDiscardPopup(true)}
                            disabled={saving}
                            className="px-5 py-2.5 border border-slate-300 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium text-sm"
                        >
                            Discard
                        </button>

                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="px-7 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                        >
                            {saving ? "Saving..." : "Save"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
