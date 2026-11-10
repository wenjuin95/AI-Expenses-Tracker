import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faReceipt, faChevronDown, faDownload } from "@fortawesome/free-solid-svg-icons";
import { getSavedExpenses, deleteExpense } from "../api/expenseApi";
import type { Receipt } from "../types/expenses";
import ExpenseChart from "../components/Chart";
import { exportCsv } from "../components/ExportFile";

export default function ExpenseOverview() {
	const [expenses, setExpenses] = useState<Receipt[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		loadExpenses();
	}, []);

	const loadExpenses = async () => {
		try {
			setLoading(true);
			const data = await getSavedExpenses();
			console.log("Fetched expenses:", data); // Debugging log

			// Sort by newest first (using the createdAt timestamp)
			const sortedData = data.sort((a, b) => {
				const dateA = new Date(a.createdAt || 0).getTime();
				const dateB = new Date(b.createdAt || 0).getTime();
				return dateB - dateA;
			});

			setExpenses(sortedData);
		} catch (err) {
			setError("Failed to load expenses.");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id: string | undefined) => {
		if (!id) return;

		// Native browser confirmation dialog
		if (!window.confirm("Are you sure you want to delete this receipt?")) return;

		try {
			await deleteExpense(id);
			// Instantly remove it from the screen without reloading from the database
			setExpenses((prev) => prev.filter((expense) => expense.id !== id));
		} catch (err) {
			alert("Failed to delete the receipt.");
		}
	};

	const handleExport = () => {
		exportCsv(expenses);
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	if (error) {
		return <div className="text-red-500 text-center p-8">{error}</div>;
	}

return (
		<div className="max-w-7xl mx-auto space-y-6 border-slate-200 rounded-xl p-6 bg-gray-100 shadow-sm">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-slate-700">
					<FontAwesomeIcon icon={faReceipt} className="mr-2" />
					Overview
				</h1>
				<div>
					<button
						onClick={handleExport}
						className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md"
					>
						<FontAwesomeIcon icon={faDownload} className="mr-2" />
						Export CSV
					</button>
				</div>
			</div>

			{expenses.length === 0 ? (
				<div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
					<FontAwesomeIcon icon={faReceipt} className="h-12 w-12 text-slate-300 mb-4" />
					<h3 className="text-lg font-medium text-slate-900">No expenses yet</h3>
					<p className="text-slate-500 mt-1">Upload and scan a receipt to get started.</p>
				</div>
			) : (
				<>
					<ExpenseChart expenses={expenses} />


					<div>
						{expenses.map((expense) => (
							<div
								key={expense.id}
								className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative"
							>
								{/* Delete Button */}
								<button
									onClick={() => handleDelete(expense.id)}
									className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
									title="Delete receipt"
								>
									<FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
								</button>

								{/* Header Info */}
								<div className="pr-8">
									<h3 className="font-bold text-slate-900 truncate">
										{expense.merchant_name || "Unknown Merchant"}
									</h3>
									<p className="text-xs text-slate-500 mt-1">
										{expense.date ? new Date(expense.date).toLocaleDateString() : "No date"}
									</p>
								</div>

								{/* Totals */}
								<div className="mt-4 pt-4 border-t border-slate-100 flex items-end justify-between">
									<div>
										<span className="inline-block px-2.5 py-1 bg-slate-200 text-slate-600 text-xs font-medium rounded-md">
											{expense.category || "Uncategorized"}
										</span>
									</div>
									<div className="text-right">
										<p className="text-xs text-slate-500 font-medium">{expense.currency}</p>
										<p className="text-xl font-bold text-slate-900">
											{expense.total_amount?.toFixed(2)}
										</p>
									</div>
								</div>

								{/* Line Items Dropdown */}
								{expense.items && expense.items.length > 0 && (
									<div className="mt-4 pt-4 border-t border-slate-100">
										<details className="group [&_summary::-webkit-details-marker]:hidden">
											<summary className="flex items-center justify-between text-xs font-medium text-slate-500 cursor-pointer hover:text-slate-800 list-none select-none">
												<span>View {expense.items.length} item(s)</span>
												<FontAwesomeIcon
													icon={faChevronDown}
													className="h-3 w-3 transition-transform group-open:rotate-180"
												/>
											</summary>

											{/* Dropdown Content */}
											<div className="mt-3 space-y-2 max-h-40 overflow-y-auto pr-1">
												{expense.items.map((item, idx) => (
													<div key={idx} className="flex justify-between items-start text-xs bg-slate-200 p-2 rounded">
														<div className="flex-1 pr-2 truncate">
															<span className="font-semibold text-slate-700 mr-1.5 px-1.5 py-0.3 bg-white">
																{item.quantity}
															</span>
															<span className="text-slate-600">
																{item.name || "Unknown Item"}
															</span>
														</div>
														<div className="font-medium text-slate-900">
															{expense.currency} {item.price?.toFixed(2)}
														</div>
													</div>
												))}
											</div>
										</details>
									</div>
								)}

							</div>
						))}
					</div>
				</>
			)}
		</div>
	);
}
