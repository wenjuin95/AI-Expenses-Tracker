import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faKey } from "@fortawesome/free-solid-svg-icons";
import type { Receipt } from "../types/expenses";
import { getErrorMessage } from "../types/errors";

import { parseReceipts } from "../api/expenseApi";
import PreventRefresh from "../components/PreventRefresh";
import Popup from "../components/Popup";
import BatchReviewPage from "./BatchReviewPage";

export default function ReceiptScanner() {
	const [apiKey, setApiKey] = useState("");
	const [isApiKeySaved, setIsApiKeySaved] = useState(false);
	const [showApiKeySavedPopup, setShowApiKeySavedPopup] = useState(false);

	const [selectedFile, setSelectedFile] = useState<File[]>([]);
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState<Receipt[] | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const savedKey = localStorage.getItem("api_key");
		if (savedKey) {
			setApiKey(savedKey);
			setIsApiKeySaved(true);
		}
	}, []);

	const handleSaveApiKey = () => {
		if (!apiKey.trim()) return;
		localStorage.setItem("api_key", apiKey.trim());
		setIsApiKeySaved(true);
		setShowApiKeySavedPopup(true);
	}

	const handleRemoveApiKey = () => {
		localStorage.removeItem("api_key");
		setApiKey("");
		setIsApiKeySaved(false);
	}

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
			console.log("Parsed Receipts:", data);
			setResult(
				data
					.map(({ receipt }) => receipt)
					.filter((receipt): receipt is Receipt => receipt !== null),
			);
		} catch (err) {
			const ErrorMessage = getErrorMessage(err);
			if (ErrorMessage.toLocaleLowerCase().includes("api key")) {
				console.error("Invalid API key provided. Please check your API key and try again.");
				setError("Invalid API key. Please check your API key and try again.");
			} else {
				console.error("An unexpected error occurred while processing the receipt. Please try again.");
				setError("An unexpected error occurred while processing the receipt. Please try again.");
			}
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

	if (!isApiKeySaved) {
		return (
			<>
				{/* catch error key */}
				<Popup
					open={Boolean(error)}
					type="error"
					title="API Error"
					message={error ?? ""}
					onOk={() => setError(null)}
				/>

				<div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm max-w-md mx-auto mt-6">
					<div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 text-xl">
						<FontAwesomeIcon icon={faKey} />
					</div>
					<h2 className="text-xl font-bold text-slate-900 mb-2">Setup Gemini API</h2>
					<p className="text-sm text-slate-500 mb-6">
						To use the AI receipt scanner, please enter your own Google Gemini API key. This key is saved locally on your device and is never sent to our servers.
					</p>

					<div className="space-y-4">
						<div>
							<label className="block text-xs font-medium text-slate-700 mb-1">API Key</label>
							<input
								type="password"
								value={apiKey}
								onChange={(e) => setApiKey(e.target.value)}
								placeholder="AIzaSy..."
								className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<button
							onClick={handleSaveApiKey}
							disabled={!apiKey.trim()}
							className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
						>
							Save
						</button>

						<p className="text-xs text-center text-slate-400 mt-4">
							Don't have a key? Get one for free from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google AI Studio</a>.
						</p>
					</div>
				</div>
			</>
		);
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

			<Popup
				open={showApiKeySavedPopup}
				type="success"
				title="API Key Saved"
				message="Your API key has been saved successfully."
				onOk={() => setShowApiKeySavedPopup(false)}
			/>

			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-slate-900">Upload Receipt</h1>
					<p className="text-sm text-slate-500 mt-1">
						Upload a receipt and review the extracted information before saving.
					</p>
				</div>

				{/* Button to remove API Key */}
				<button
					onClick={handleRemoveApiKey}
					className="text-xs text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md flex items-center gap-2 transition-colors border border-red-200"
					title="Delete saved API key"
				>
					<FontAwesomeIcon icon={faTrash} className="w-3 h-3" /> Remove API Key
				</button>
			</div>

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
