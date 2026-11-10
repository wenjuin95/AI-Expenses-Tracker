import type { Receipt } from "../types/expenses";

const downloadFile = (content: Blob, filename: string) => {
	const url = URL.createObjectURL(content);

	const link = document.createElement("a");
	link.href = url;
	link.download = filename;

	document.body.appendChild(link);
	link.click();

	document.body.removeChild(link);
	URL.revokeObjectURL(url);
};

export function exportCsv(expenses: Receipt[]) {
	if (expenses.length === 0) {
		alert("No expenses available to export.");
		return;
	}

	const headers = [
		"Merchant",
		"Date",
		"Category",
		"Items Name",
		"Quantity",
		"Unit Price",
		"Total Amount"
	];

	const rows = expenses.flatMap((expense) =>
		(expense.items || []).map((item) => [
			expense.merchant_name || "Unknown Merchant",
			expense.date || "",
			expense.category || "Uncategorized",
			item.name || "Unknown Item",
			item.quantity ?? 0,
			item.price ?? 0,
			(item.quantity ?? 0) * (item.price ?? 0)
		])
	);

	const escapeCSV = (value: unknown) => {
		const text = String(value ?? "");
		return `"${text.replace(/"/g, '""')}"`;
	};

	const csvContent = [
		headers.map(escapeCSV).join(","),
		...rows.map((row) => row.map(escapeCSV).join(","))
	].join("\r\n");

	const blob = new Blob(
		[csvContent],
		{ type: "text/csv;charset=utf-8;" }
	);

	downloadFile(
		blob,
		`Expenses_${new Date().toISOString().slice(0, 10)}.csv`
	);
};
