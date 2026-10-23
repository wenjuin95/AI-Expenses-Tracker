import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import type { Receipt } from "../types/expenses";

import { parseReceipts } from "../api/expenseApi";
import PreventRefresh from "../components/PreventRefresh";
import Popup from "../components/Popup";
import BatchReviewPage from "./BatchReviewPage";

export default function ReceiptScanner() {
	const [selectedFile, setSelectedFile] = useState<File[]>([]);
	const [loading, setLoading] = useState(false);
	// ReturnType of parseReceipt mean that the type of result will be the same as the return type of the parseReceipt function, which is Promise<any> | null. This means that result can either be a Promise that resolves to any value (the parsed receipt data) or null if there was an error during parsing.
	const [result, setResult] = useState<Receipt[] | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = Array.from(event.target.files || []);

		if (file.length === 0) return;

		setSelectedFile((prevFiles) => (prevFiles ? [...prevFiles, ...file] : file));
		setResult(null); // Reset previous result
		setError(null); // Reset previous error
	};

	const handleUpload = async () => {
		if (!selectedFile || selectedFile.length === 0) {
			setError("No file selected.");
			return;
		}

		setLoading(true);
		setError(null); // Reset previous error

		try {
			const data = await parseReceipts(selectedFile);
			setResult(
				data
					.map(({ receipt }) => receipt)
					.filter((receipt): receipt is Receipt => receipt !== null),
			);
		} catch (err) {
			setError("Failed to parse receipt. Please try again.");
		} finally {
			setLoading(false);
		}
	}

	if (result && result.length > 0) {
		return (
			<BatchReviewPage
				results={result}
				setResults={setResult}
				setFiles={setSelectedFile}
			/>
		)
	}

	return (
		<div className="max-w-4xl mx-auto space-y-6 border-slate-200 rounded-xl p-6 bg-gray-100 shadow-sm">
			<PreventRefresh enabled={Boolean(selectedFile?.length || result?.length)} />
			<Popup
				open={Boolean(error)}
				type="error"
				title="Upload Error"
				message={error ?? ""}
				onOk={() => setError(null)}
			/>

			<div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
				<div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center hover:border-blue-500 transition-colors bg-slate-50/50 relative">
					<input
						type="file"
						multiple
						accept=".jpg,.jpeg,.png,.webp,.pdf"
						onChange={handleFileChange}
						className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
					/>
					<div className="space-y-2 pointer-events-none">
						<div className="mx-auto w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl">
							↑
						</div>
						<p className="text-sm font-medium text-slate-700">
							Click to upload or drag and drop
						</p>
						<p className="text-xs text-slate-400">PNG, JPG, WEBP or PDF</p>
					</div>
				</div>

				{selectedFile && selectedFile.length > 0 && (
					<div className="space-y-2">
						{selectedFile.map((file, index) => (
							<div
								key={`${file.name}-${index}`}
								className="flex items-center justify-between bg-slate-50 border border-slate-100 px-4 py-3 rounded-lg text-sm"
							>
								<span className="font-medium text-slate-700 truncate max-w-xs">
									{file.name}
								</span>

								<span className="text-xs text-slate-400">
									{(file.size / 1024 / 1024).toFixed(2)} MB
								</span>
								<button
									type="button"
									onClick={() => {
										setSelectedFile((prevFiles) => prevFiles?.filter((_, i) => i !== index) ?? null);
									}}
									aria-label={`Remove ${file.name}`}
									title="Remove receipt"
									className="ml-3 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-transparent text-slate-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
								>
									<FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5" aria-hidden="true" />
								</button>
							</div>
						))}
					</div>
				)}

				<button
					onClick={handleUpload}
					disabled={!selectedFile || loading}
					className="w-full py-2.5 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
				>
					{loading ? (
						<span className="flex items-center justify-center">
							<svg className="animate-spin mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
							</svg>
							Processing Receipt...
						</span>
					) : (
						"Process Receipt"
					)}
				</button>
			</div>

		</div>
	);
}
