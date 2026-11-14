import { useEffect, useMemo, useState } from "react";
import { get, set } from "idb-keyval";
import { getSavedExpenses } from "../api/expenseApi";
import type { Receipt, ReceiptItem } from "../types/expenses";
import ReceiptScanner from "./ReceiptScanner";

type SplitStep = "choose" | "saved" | "scan" | "split";

type SplitItem = ReceiptItem & {
	lineId: string;
};

interface SplitRecord {
	id: string;
	items: SplitItem[];
	subtotal: number;
	taxAmount: number;
	total: number;
	createdAt: string;
}

interface SplitSession {
	sourceId: string;
	remainingItems: SplitItem[];
	splits: SplitRecord[];
}

const SPLIT_SESSIONS_KEY = "split_bill_sessions";

const toSplitItems = (items: ReceiptItem[]): SplitItem[] =>
	items.map((item, index) => ({ ...item, lineId: `line-${index}` }));

export default function SplitBill({ receiptId }: { receiptId?: string }) {
	const [expenses, setExpenses] = useState<Receipt[]>([]);
	const [receipt, setReceipt] = useState<Receipt | null>(null);
	const [sourceId, setSourceId] = useState<string | null>(null);
	const [remainingItems, setRemainingItems] = useState<SplitItem[]>([]);
	const [splits, setSplits] = useState<SplitRecord[]>([]);
	const [mySelections, setMySelections] = useState<Record<string, number>>({});
	const [step, setStep] = useState<SplitStep>("choose");
	const [loading, setLoading] = useState(true);
	const [loadingSession, setLoadingSession] = useState(false);
	const [storageError, setStorageError] = useState<string | null>(null);

	useEffect(() => {
		const fetchReceipts = async () => {
			const savedExpenses = await getSavedExpenses();
			setExpenses(savedExpenses);
			setLoading(false);
		};

		fetchReceipts();
	}, []);

	useEffect(() => {
		if (!receiptId || expenses.length === 0) return;

		const savedReceipt = expenses.find((expense) => expense.id === receiptId);
		if (savedReceipt) {
			void selectReceipt(savedReceipt);
		}
	}, [expenses, receiptId]);

	useEffect(() => {
		const selections: Record<string, number> = {};
		remainingItems.forEach((item) => {
			selections[item.lineId] = 0;
		});
		setMySelections(selections);
	}, [remainingItems]);

	const persistSession = async (
		sourceId: string,
		nextRemainingItems: SplitItem[],
		nextSplits: SplitRecord[],
	) => {
		const sessions = (await get<SplitSession[]>(SPLIT_SESSIONS_KEY)) || [];
		const nextSession: SplitSession = {
			sourceId,
			remainingItems: nextRemainingItems,
			splits: nextSplits,
		};
		const updatedSessions = sessions.filter((session) => session.sourceId !== sourceId);
		await set(SPLIT_SESSIONS_KEY, [...updatedSessions, nextSession]);
	};

	const selectReceipt = async (selectedReceipt: Receipt) => {
		const sourceId = selectedReceipt.id || `scan-${crypto.randomUUID()}`;
		setReceipt(selectedReceipt);
		setSourceId(sourceId);
		setStorageError(null);
		setLoadingSession(true);

		try {
			const sessions = (await get<SplitSession[]>(SPLIT_SESSIONS_KEY)) || [];
			const existingSession = sessions.find((session) => session.sourceId === sourceId);
			setRemainingItems(existingSession?.remainingItems || toSplitItems(selectedReceipt.items));
			setSplits(existingSession?.splits || []);
			setStep("split");
		} catch (error) {
			console.error("Failed to load split session:", error);
			setRemainingItems(toSplitItems(selectedReceipt.items));
			setSplits([]);
			setStorageError("Previous split history could not be loaded.");
			setStep("split");
		} finally {
			setLoadingSession(false);
		}
	};

	const updateSelection = (lineId: string, increment: number, maxQty: number) => {
		setMySelections((previous) => {
			const currentQty = previous[lineId] || 0;
			const newQty = Math.max(0, Math.min(currentQty + increment, maxQty));
			return { ...previous, [lineId]: newQty };
		});
	};

	const calculateTotals = (items: SplitItem[], selections?: Record<string, number>) => {
		const subtotal = items.reduce((sum, item) => {
			const quantity = selections ? selections[item.lineId] || 0 : item.quantity;
			const unitPrice = item.quantity > 0 ? item.price / item.quantity : 0;
			return sum + unitPrice * quantity;
		}, 0);
		const taxRate = receipt?.tax || 0;
		const total = subtotal * (taxRate > 0 ? 1 + taxRate / 100 : 1);

		return {
			subtotal: Number(subtotal.toFixed(2)),
			taxAmount: Number((total - subtotal).toFixed(2)),
			total: Number(total.toFixed(2)),
		};
	};

	const selectedTotals = useMemo(
		() => calculateTotals(remainingItems, mySelections),
		[remainingItems, mySelections, receipt],
	);
	const remainingTotals = useMemo(
		() => calculateTotals(remainingItems),
		[remainingItems, receipt],
	);

	const makeSplit = async () => {
		if (!receipt || !sourceId) return;

		if (selectedTotals.subtotal <= 0) {
			setStorageError("Select at least one item before making a split.");
			return;
		}

		const selectedItems = remainingItems
			.map((item) => {
				const selectedQuantity = mySelections[item.lineId] || 0;
				if (selectedQuantity === 0) return null;

				const unitPrice = item.quantity > 0 ? item.price / item.quantity : 0;
				return {
					...item,
					quantity: selectedQuantity,
					price: Number((unitPrice * selectedQuantity).toFixed(2)),
				};
			})
			.filter((item): item is SplitItem => item !== null);
		const nextRemainingItems = remainingItems
			.map((item) => {
				const selectedQuantity = mySelections[item.lineId] || 0;
				const unitPrice = item.quantity > 0 ? item.price / item.quantity : 0;
				return {
					...item,
					quantity: item.quantity - selectedQuantity,
					price: Number((unitPrice * (item.quantity - selectedQuantity)).toFixed(2)),
				};
			})
			.filter((item) => item.quantity > 0);
		const nextSplit: SplitRecord = {
			id: crypto.randomUUID(),
			items: selectedItems,
			subtotal: selectedTotals.subtotal,
			taxAmount: selectedTotals.taxAmount,
			total: selectedTotals.total,
			createdAt: new Date().toISOString(),
		};
		const nextSplits = [...splits, nextSplit];
		try {
			await persistSession(sourceId, nextRemainingItems, nextSplits);
			setRemainingItems(nextRemainingItems);
			setSplits(nextSplits);
			setStorageError(null);
		} catch (error) {
			console.error("Failed to save split:", error);
			setStorageError("The split could not be saved.");
		}
	};

	const modifySplit = async (splitId: string) => {
		if (!receipt || !sourceId) return;

		const splitToRestore = splits.find((split) => split.id === splitId);
		if (!splitToRestore) return;

		const restoredItems = [...remainingItems];
		splitToRestore.items.forEach((splitItem) => {
			const existingItem = restoredItems.find((item) => item.lineId === splitItem.lineId);
			if (existingItem) {
				existingItem.quantity += splitItem.quantity;
				existingItem.price = Number((existingItem.price + splitItem.price).toFixed(2));
			} else {
				restoredItems.push({ ...splitItem });
			}
		});

		const nextSplits = splits.filter((split) => split.id !== splitId);
		try {
			await persistSession(sourceId, restoredItems, nextSplits);
			setRemainingItems(restoredItems);
			setSplits(nextSplits);
			setStorageError(null);
		} catch (error) {
			console.error("Failed to modify split:", error);
			setStorageError("The split could not be modified.");
		}
	};

	if (loading || loadingSession) return <div className="p-4 text-center">Loading receipts...</div>;

	if (step === "choose") {
		return (
			<div className="mx-auto max-w-md rounded-xl border bg-white p-6 text-center shadow-sm">
				<h2 className="text-2xl font-bold text-slate-900">Split a bill</h2>
				<p className="mt-2 text-sm text-slate-500">Choose how you want to provide the receipt.</p>
				<div className="mt-6 grid gap-3">
					<button type="button" onClick={() => setStep("saved")} className="rounded-lg bg-blue-600 px-4 py-4 font-medium text-white hover:bg-blue-700">
						Choose saved receipt
					</button>
					<button type="button" onClick={() => setStep("scan")} className="rounded-lg bg-blue-600 px-4 py-4 font-medium text-white hover:bg-blue-700">
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
					<p className="mt-4 text-center text-sm text-slate-500">No saved receipts found.</p>
				) : (
					<select
						defaultValue=""
						onChange={(event) => {
							const selectedReceipt = expenses.find((expense) => expense.id === event.target.value);
							if (selectedReceipt) void selectReceipt(selectedReceipt);
						}}
						className="mt-4 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700"
					>
						<option value="" disabled>Select a receipt</option>
						{expenses.map((expense) => (
							<option key={expense.id} value={expense.id}>{expense.merchant_name} ( {expense.date || "No date"} )</option>
						))}
					</select>
				)}
				<button type="button" onClick={() => setStep("choose")} className="mt-6 w-full rounded-lg bg-slate-200 py-2 font-medium text-slate-800">
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
					onReceiptScanned={(scannedReceipt) => void selectReceipt(scannedReceipt)}
				>
					<button type="button" onClick={() => setStep("choose")} className="w-full rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-300">
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
					<h2 className="text-sm font-bold lg:text-xl">{receipt.merchant_name}</h2>
					<button type="button" onClick={() => { setReceipt(null); setSourceId(null); setStep("choose"); }} className="rounded-lg bg-slate-200 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-300">
						Change receipt
					</button>
				</div>
				<p className="mb-6 text-sm text-gray-500">Tax applied: {(receipt.tax ?? 0) > 0 ? `${receipt.tax}%` : "None"}</p>

				{storageError && <p className="mb-4 text-sm text-red-600">{storageError}</p>}

				{remainingItems.length > 0 ? (
					<div className="space-y-4">
						{remainingItems.map((item) => {
							const myQty = mySelections[item.lineId] || 0;
							const unitPrice = item.quantity > 0 ? item.price / item.quantity : 0;
							return (
								<div key={item.lineId} className="flex items-center justify-between border-b py-2">
									<div>
										<p className="font-medium">{item.name}</p>
										<p className="text-sm text-gray-500">{receipt.currency} {unitPrice.toFixed(2)} each <span className="text-xs">(Remaining: {item.quantity})</span></p>
									</div>
									<div className="flex items-center space-x-3">
										<button type="button" onClick={() => updateSelection(item.lineId, -1, item.quantity)} className="flex h-8 w-8 items-center justify-center rounded-full text-white bg-blue-600 hover:bg-blue-700 font-bold">-</button>
										<span className="w-4 text-center font-semibold">{myQty}</span>
										<button type="button" onClick={() => updateSelection(item.lineId, 1, item.quantity)} className="flex h-8 w-8 items-center justify-center rounded-full text-white bg-blue-600 hover:bg-blue-700 font-bold">+</button>
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<p className="rounded-lg bg-slate-50 p-4 text-center text-sm text-slate-500">All receipt items have been split.</p>
				)}

				<div className="mt-8 rounded-lg p-4">
					<div className="mb-2 flex justify-between text-sm font-medium"><span>Selected subtotal:</span><span>{receipt.currency} {selectedTotals.subtotal.toFixed(2)}</span></div>
					<div className="mb-2 flex justify-between text-sm text-gray-500"><span>Remaining amount:</span><span>{receipt.currency} {remainingTotals.total.toFixed(2)}</span></div>
					<div className="mt-1 flex justify-between border-t pt-3 text-lg font-bold"><span>Selected total:</span><span className="text-blue-600">{receipt.currency} {selectedTotals.total.toFixed(2)}</span></div>
				</div>

				<button type="button" onClick={() => void makeSplit()} disabled={remainingItems.length === 0} className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
					{splits.length === 0 ? "Make split" : "Make another split"}
				</button>
			</div>

			<div className="rounded-xl border bg-white p-6 shadow-sm">
				<h3 className="mb-4 text-lg font-bold">All splits</h3>
				{splits.length === 0 ? (
					<p className="text-sm text-slate-500">No splits created yet.</p>
				) : (
					<div className="space-y-3">
						{splits.map((split, index) => (
							<div key={split.id} className="rounded-lg border border-slate-200 p-3">
								<div className="flex items-center justify-between">
									<p className="font-medium">Split {index + 1}</p>
									<p className="font-bold">{receipt.currency} {split.total.toFixed(2)}</p>
								</div>
								<p className="mt-1 text-xs text-slate-500">{split.items.map((item) => `${item.name} x${item.quantity}`).join(", ")}</p>
								<button type="button" onClick={() => void modifySplit(split.id)} className="mt-3 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
									Cancel this split
								</button>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
