import { useEffect, useMemo, useState } from "react";
import { getSavedExpenses } from "../api/expenseApi";
import type { Receipt } from "../types/expenses";
import ReceiptScanner from "./ReceiptScanner";

type SplitStep = "choose" | "saved" | "scan" | "split";

export default function SplitBill({ receiptId }: { receiptId?: string }) {
	const [expenses, setExpenses] = useState<Receipt[]>([]);
	const [receipt, setReceipt] = useState<Receipt | null>(null);
	const [mySelections, setMySelections] = useState<Record<string, number>>({});
	const [step, setStep] = useState<SplitStep>("choose");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchReceipts = async () => {
			const savedExpenses = await getSavedExpenses();
			setExpenses(savedExpenses);
			setLoading(false);
		};

		fetchReceipts();
	}, []);

	useEffect(() => {
		if (!receiptId) return;

		const savedReceipt = expenses.find((expense) => expense.id === receiptId);
		if (savedReceipt) {
			setReceipt(savedReceipt);
			setStep("split");
		}
	}, [expenses, receiptId]);

	useEffect(() => {
		if (!receipt) {
			setMySelections({});
			return;
		}

		const selections: Record<string, number> = {};
		receipt.items.forEach((_, index) => {
			selections[String(index)] = 0;
		});
		setMySelections(selections);
	}, [receipt]);

	const updateSelection = (itemIndex: number, increment: number, maxQty: number) => {
		setMySelections((previous) => {
			const currentQty = previous[String(itemIndex)] || 0;
			const newQty = Math.max(0, Math.min(currentQty + increment, maxQty));
			return { ...previous, [String(itemIndex)]: newQty };
		});
	};

	const totals = useMemo(() => {
		if (!receipt) return { subtotal: 0, taxAmount: 0, total: 0 };

		const subtotal = receipt.items.reduce((sum, item, index) => {
			const quantity = mySelections[String(index)] || 0;
			const unitPrice = item.quantity > 0 ? item.price / item.quantity : 0;
			return sum + unitPrice * quantity;
		}, 0);
		const taxRate = receipt.tax || 0;
		const total = subtotal * (taxRate > 0 ? 1 + taxRate / 100 : 1);

		return {
			subtotal: Number(subtotal.toFixed(2)),
			taxAmount: Number((total - subtotal).toFixed(2)),
			total: Number(total.toFixed(2)),
		};
	}, [receipt, mySelections]);

	if (loading) return <div className="p-4 text-center">Loading receipts...</div>;

	if (step === "choose") {
		return (
			<div className="mx-auto max-w-md rounded-xl border bg-white p-6 text-center shadow-sm">
				<h2 className="text-2xl font-bold text-slate-900">Split a bill</h2>
				<p className="mt-2 text-sm text-slate-500">
					Choose how you want to provide the receipt.
				</p>
				<div className="mt-6 grid gap-3">
					<button
						type="button"
						onClick={() => setStep("saved")}
						className="rounded-lg bg-blue-600 px-4 py-4 font-medium text-white transition hover:bg-blue-700"
					>
						Choose saved receipt
					</button>
					<button
						type="button"
						onClick={() => setStep("scan")}
						className="rounded-lg bg-blue-600 px-4 py-4 font-medium text-white transition hover:bg-blue-700"
					>
						Scan receipt
					</button>
				</div>
			</div>
		);
	}

	if (step === "saved") {
		return (
			<div className="mx-auto max-w-md rounded-xl border bg-white p-6 shadow-sm">
				<h2 className="text-xl font-bold text-slate-900">Choose a saved receipt</h2>
				{expenses.length === 0 ? (
					<p className="mt-4 text-sm text-slate-500 text-center">
						No saved receipts found.
					</p>
				) : (
					<select
						defaultValue=""
						onChange={(event) => {
							const selectedReceipt = expenses.find(
								(expense) => expense.id === event.target.value,
							);
							if (selectedReceipt) {
								setReceipt(selectedReceipt);
								setStep("split");
							}
						}}
						className="mt-4 w-full rounded-lg border border-slate-300 text-slate-700 bg-white hover:border-slate-400 px-3 py-2"
					>
						<option value="" disabled>Select a receipt</option>
						{expenses.map((expense) => (
							<option key={expense.id} value={expense.id}>
								{expense.merchant_name} - {expense.date || "No date"}
							</option>
						))}
					</select>
				)}
				<button
					type="button"
					onClick={() => setStep("choose")}
					className="mt-6 w-full rounded-lg bg-slate-200 py-2 font-medium text-slate-800"
				>
					Back
				</button>
			</div>
		);
	}

	if (step === "scan") {
		return (
			<div className="space-y-4">
				<ReceiptScanner
					onReviewComplete={() => setStep("choose")}
					onReceiptScanned={(scannedReceipt) => {
						setReceipt(scannedReceipt);
						setStep("split");
					}}
				>
					<button
						type="button"
						onClick={() => setStep("choose")}
						className=" w-full rounded-lg bg-slate-200 hover:bg-slate-300 px-4 py-2 text-sm font-medium text-slate-800"
					>
						Back
					</button>
				</ReceiptScanner>
			</div>
		);
	}

	if (!receipt) return null;

	return (
		<div className="mx-auto max-w-md space-y-6 p-4">
			<div className="rounded-xl border bg-white p-6 shadow-sm">
				<div className="mb-3 flex items-center justify-between gap-3">
					<h2 className="text-sm lg:text-xl font-bold">{receipt.merchant_name}</h2>
				</div>
				<p className="mb-6 text-sm text-gray-500">
					Tax applied: {(receipt.tax ?? 0) > 0 ? `${receipt.tax}%` : "None"}
				</p>
				<div className="mb-4 flex items-center justify-end">
					<button
						type="button"
						onClick={() => {
							setReceipt(null);
							setStep("choose");
						}}
						className="rounded-lg bg-slate-200 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-300 transition"
					>
						Change receipt
					</button>
				</div>

				<div className="space-y-4">
					{receipt.items.map((item, index) => {
						const myQty = mySelections[String(index)] || 0;
						const unitPrice = item.quantity > 0 ? item.price / item.quantity : 0;

						return (
							<div key={`${item.name}-${index}`} className="flex items-center justify-between border-b py-2">
								<div>
									<p className="font-medium">{item.name}</p>
									<p className="text-sm text-gray-500">
										{receipt.currency} {unitPrice.toFixed(2)} each
										<span className="text-xs"> (Total: {item.quantity})</span>
									</p>
								</div>
								<div className="flex items-center space-x-3">
									<button
										type="button"
										onClick={() => updateSelection(index, -1, item.quantity)}
										className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 font-bold"
									>
										-
									</button>
									<span className="w-4 text-center font-semibold">{myQty}</span>
									<button
										type="button"
										onClick={() => updateSelection(index, 1, item.quantity)}
										className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600"
									>
										+
									</button>
								</div>
							</div>
						);
					})}
				</div>

				<div className="mt-8 rounded-lg p-4">
					<div className="mb-2 flex justify-between text-sm">
						<span>Subtotal:</span>
						<span>{receipt.currency} {totals.subtotal.toFixed(2)}</span>
					</div>
					{(receipt.tax ?? 0) > 0 && (
						<div className="mb-2 flex justify-between text-sm">
							<span>Tax ({receipt.tax}%):</span>
							<span>{receipt.currency} {totals.taxAmount.toFixed(2)}</span>
						</div>
					)}
					<div className="mt-1 flex justify-between border-t pt-3 text-lg font-bold">
						<span>Total to Pay:</span>
						<span className="text-blue-600">
							{receipt.currency} {totals.total.toFixed(2)}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
