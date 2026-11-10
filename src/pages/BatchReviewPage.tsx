import React, { useState } from "react";
// Remove or keep useNavigate depending on if you use React Router
// import { useNavigate } from "react-router-dom";
import type { Receipt } from "../types/expenses";
import ReviewReceipt from "../components/ReviewReceipt";

interface BatchReviewPageProps {
	results: Receipt[];
	setResults: React.Dispatch<React.SetStateAction<Receipt[] | null>>;
	setFiles: React.Dispatch<React.SetStateAction<File[]>>;
	onReviewComplete: () => void;
}

export default function BatchReviewPage({
	results,
	setResults,
	setFiles,
	onReviewComplete,
}: BatchReviewPageProps) {
	// const navigate = useNavigate();
	const [processedCount, setProcessedCount] = useState(0);

	const handleReceiptComplete = () => {
		setProcessedCount((prevCount) => {
			const newCount = prevCount + 1;

			// If all receipts have been processed (saved or cancelled)
			if (newCount === results.length) {
				// Add a small delay so the user can see the final "Saved" or "Cancelled" UI
				setTimeout(() => {
					setResults(null);
					setFiles([]);
					onReviewComplete();
					window.location.reload(); // Reload the page to show the updated list of receipts
				}, 1000);
			}

			return newCount;
		});
	};

	if (results.length === 0) {
		return (
			<div className="max-w-4xl mx-auto p-8 text-center">
				<p className="text-slate-500">No receipts to review.</p>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto space-y-6 border border-slate-200 rounded-xl p-6 bg-gray-100 shadow-sm">
			<div>
				<h1 className="text-2xl font-bold text-slate-900">
					Review Receipts
				</h1>
				<p className="text-sm text-slate-500 mt-1">
					Review and edit each receipt before saving it. ({processedCount} of {results.length} processed)
				</p>
			</div>

			{/* Responsive grid: 1 column on phone, 2 columns on large screens */}
			<div className="grid grid-cols-1 gap-6 items-start">
				{results.map((result, index) => (
					<ReviewReceipt
						key={index}
						result={result}
						index={index}
						total={results.length}
						onComplete={handleReceiptComplete}
					/>
				))}
			</div>
		</div>
	);
}
