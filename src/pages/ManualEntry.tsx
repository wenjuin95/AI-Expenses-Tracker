import React, { useEffect, useState } from "react";
import { saveExpense } from "../api/expenseApi";
import type { Receipt, ReceiptItem } from "../types/expenses";
import Popup from "../components/Popup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

export default function ManualEntry() {
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showSavePopup, setShowSavePopup] = useState(false);
	const [saveSuccess, setSaveSuccess] = useState(false);

	// Start with a blank default state
	const [draft, setDraft] = useState<Receipt>({
		merchant_name: "",
		date: new Date().toISOString().split('T')[0], // Defaults to today
		currency: "",
		subtotal: 0,
		discount: 0,
		tax: 0,
		total_amount: 0,
		amount_paid: 0,
		payment_method: "",
		category: undefined,
		items: [{ name: "", quantity: 0, price: 0 }],
	});

	const calculatedSubtotal = draft.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
	const calculatedTotal = calculatedSubtotal + (draft.tax || 0) - (draft.discount || 0);

	useEffect(() => {
		console.log("Manual entry items:", draft.items);
		console.log("Manual entry calculated total:", calculatedTotal);
	}, [draft.items, calculatedTotal]);

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
			items: [...current.items, { name: "", quantity: 0, price: 0 }],
		}));
	};

	const removeItem = (itemIndexToRemove: number) => {
		setDraft((current) => ({
			...current,
			items: current.items.filter((_, idx) => idx !== itemIndexToRemove),
		}));
	};

	const handleSave = (e: React.FormEvent) => {
		e.preventDefault(); // Prevent standard form submission

		if (calculatedTotal <= 0) {
			setError("Total Amount greater than 0 are required.");
			return;
		}

		if (!draft.currency || !draft.payment_method || !draft.category) {
			setError("Currency, payment method, and category are required.");
			return;
		}

		if (draft.items.length > 0) {
			if (draft.items.some(item => !item.name)) {
				setError("Items must have a name. Please fill in all item names or remove empty items.");
				return;
			} else if (draft.items.some(item => item.quantity <= 0)) {
				setError("Item quantities can't be zero or negative. Please correct the quantities.");
				return;
			} else if (draft.items.some(item => item.price <= 0)) {
				setError("Item prices can't be zero or negative. Please correct the prices.");
				return;
			}
		}

		setShowSavePopup(true);
	};

	const confirmSave = async () => {
		setShowSavePopup(false);
		const expenseToSave = {
			...draft,
			subtotal: calculatedSubtotal,
			total_amount: calculatedTotal,
			merchant_name: draft.merchant_name.trim() || "Merchant",
		};

		try {
			setSaving(true);
			setError(null);

			if (navigator.onLine === false) {
				throw new Error("You are currently offline. Please check your internet connection and try again.");
			}

			await saveExpense(expenseToSave);

			setSaving(false);
			setSaveSuccess(true);

		} catch (err) {
			throw new Error(err instanceof Error ? err.message : "Failed to save expense.");
			setSaving(false);
		}
	};

	return (
		<>
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
				open={saveSuccess}
				type="success"
				title="Saved Successfully"
				message="Your expense has been saved successfully."
				onOk={() => window.location.reload()}
				showOkButton={false}
			/>

			<Popup
				open={Boolean(error)}
				type="error"
				title="Error"
				message={error ?? ""}
				onOk={() => setError(null)}
			/>

			<form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
				<div className="px-6 py-4 border-b border-slate-200 bg-blue-500">
					<h2 className="text-lg font-bold text-white">Manual Entry</h2>
					<p className="text-xs text-slate-50 mt-1">Add a new expense manually</p>
				</div>

				<div className="p-6 space-y-6">
					{/* Basic Details */}
					<section>
						<h3 className="text-sm font-semibold text-slate-900 mb-4">Basic Details</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

							{/* Merchant Name */}
							<div>
								<label className="block text-xs font-medium text-slate-500 mb-1">Merchant</label>
								<input
									type="text"
									value={draft.merchant_name ?? ""}
									onChange={(e) => updateField("merchant_name", e.target.value)}
									className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="e.g. Starbucks"
								/>
								<p className="text-xs text-slate-300">Default name will be used if left blank</p>
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
								<label className="block text-xs font-medium text-slate-500 mb-1">Category *</label>
								<div className="relative">
									<select
										required
										value={draft.category ?? ""}
										onChange={(e) => updateField("category", e.target.value as any)}
										className="w-full appearance-none border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-700 bg-white hover:border-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 cursor-pointer"
									>
										<option value="" disabled>Select a category</option>
										<option value="Food">Food</option>
										<option value="Transport">Transport</option>
										<option value="Shopping">Shopping</option>
										<option value="Entertainment">Entertainment</option>
										<option value="Health">Health</option>
										<option value="Other">Other</option>
									</select>

									<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 text-xs">
										<FontAwesomeIcon icon={faChevronDown} />
									</div>
								</div>
							</div>

							<div>
								<label className="block text-xs font-medium text-slate-500 mb-1">Payment Method *</label>
								<div className="relative">
									<select
										required
										value={draft.payment_method ?? ""}
										onChange={(e) => updateField("payment_method", e.target.value)}
										className="w-full appearance-none border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-700 bg-white hover:border-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 cursor-pointer"
									>
										<option value="" disabled>Select a payment method</option>
										<option value="Credit Card">Credit Card</option>
										<option value="E-Wallet">E-Wallet</option>
										<option value="Cash">Cash</option>
									</select>

									<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 text-xs">
										<FontAwesomeIcon icon={faChevronDown} />
									</div>
								</div>
							</div>

						</div>
					</section>

					{/* Financials */}
					<section>
						<h3 className="text-sm font-semibold text-slate-900 mb-4">
							Financials
						</h3>
						<div className="md:grid md:grid-cols-4 gap-4 space-y-4 md:space-y-0">

							<div>
								<label className="block text-xs font-medium text-slate-500 mb-1"> Currency * </label>
								<div className="relative">
									<select
										required
										value={draft.currency ?? ""}
										onChange={(e) => updateField("currency", e.target.value)}
										className="w-full appearance-none border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-700 bg-white hover:border-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 cursor-pointer"
									>
										<option value="" disabled>Select currency</option>
										<option value="RM">RM</option>
										<option value="SGD">SGD</option>
										<option value="CNY">CNY</option>
										<option value="TWD">TWD</option>
										<option value="KRW">KRW</option>
										<option value="JPN">JPN</option>
										<option value="IDN">IDN</option>
										<option value="THB">THB</option>
										<option value="USD">USD</option>
									</select>

									{/* Custom Dropdown Arrow */}
									<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 text-xs">
										<FontAwesomeIcon icon={faChevronDown} />
									</div>
								</div>
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

							<div className="col-span-2 md:flex">
								<div>
									<label className="block text-xs font-bold text-slate-700 mb-1">Total Amount</label>
									<input
										type="number"
										step="0.01"
										value={calculatedTotal || ""}
										readOnly
										className="w-full border border-blue-500 rounded-lg px-3 py-2 text-sm font-bold text-slate-700"
									/>
								</div>
								<p className="text-xs text-slate-300 md:mt-10 md:ml-2">Auto-calculated</p>
							</div>

						</div>
					</section>

					{/* Line Items */}
					<section>

						<div className="flex items-center justify-between mb-4">
							<h3 className="text-sm font-semibold text-slate-900">Items</h3>
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
												<label className="block text-xs font-medium text-slate-500 mb-1">Item Name *</label>
												<input
													type="text"
													required
													value={item.name ?? ""}
													onChange={(e) => updateItem(idx, "name", e.target.value)}
													className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
												/>
											</div>

											<div className="md:col-span-3 col-span-1/2">
												<label className="block text-xs font-medium text-slate-500 mb-1">Qty *</label>
												<input
													type="number"
													required
													step="0"
													value={item.quantity || ""}
													onChange={(e) => updateItem(idx, "quantity", e.target.value === "" ? 0 : Number(e.target.value))}
													className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
												/>
											</div>

											<div className="md:col-span-3 col-span-1/2">
												<label className="block text-xs font-medium text-slate-500 mb-1">Price *</label>
												<input
													type="number"
													required
													step="0.01"
													value={item.price || ""}
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
							{saving ? "Saving..." : "Save"}
						</button>
					</div>
				</div>
			</form>
		</>
	);
}
