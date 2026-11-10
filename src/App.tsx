import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faKeyboard, faArrowLeft, faMoon, faSun } from "@fortawesome/free-solid-svg-icons";

import ReceiptScanner from './pages/ReceiptScanner'
import ExpenseOverview from './pages/Overview'
import ManualEntry from "./pages/ManualEntry";
import './App.css'

function App() {
	const [activeView, setActiveView] = useState<'menu' | 'scan' | 'manual'>('menu');
	const [theme, setTheme] = useState<"light" | "dark">(() => {
		const savedTheme = localStorage.getItem("expense-tracker-theme");
		if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
		return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
	});

	useEffect(() => {
		document.documentElement.dataset.theme = theme;
		localStorage.setItem("expense-tracker-theme", theme);
	}, [theme]);

	const toggleTheme = () => {
		setTheme((currentTheme) => currentTheme === "light" ? "dark" : "light");
	};

return (
		<div className="max-w-4xl mx-auto space-y-8 p-4 md:p-6">
			<div className="flex items-center mx-2 lg:justify-center">
				<img src="public/Expense Tracker Logo.png" alt="Expense Tracker Logo" className="h-25 w-30 lg:h-45 lg:w-50" />
				<div className="relative">
					<h1 className="whitespace-nowrap font-extrabold text-4xl pl-2 text-slate-900 sm:text-4xl lg:text-7xl lg:pl-4">
						Expense<br />Tracker
					</h1>
					<button
						type="button"
						onClick={toggleTheme}
						aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
						title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
						aria-pressed={theme === "dark"}
						className={`absolute -right-14 bottom-0 inline-flex h-6 w-11 items-center rounded-full border p-0.5 transition-colors sm:-right-12 lg:-right-15 lg:h-7 lg:w-12 ${
							theme === "dark"
								? "border-blue-500 bg-blue-500"
								: "border-amber-300 bg-amber-200"
						}`}
					>
						<span
							className={`flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] shadow-sm transition-transform lg:h-6 lg:w-6 ${
								theme === "dark" ? "translate-x-5 lg:translate-x-5" : "translate-x-0"
							}`}
						>
							<FontAwesomeIcon
								icon={theme === "light" ? faSun : faMoon}
								className={theme === "light" ? "text-amber-500" : "text-blue-500"}
							/>
						</span>
					</button>
				</div>
			</div>

			<div className="p-5">
				{/* Back Button Area */}
				<div className="mb-4">
					{/* Only show the Back button if they are NOT on the menu */}
					{activeView !== 'menu' && (
						<div className="flex justify-end w-full">
							<button
								onClick={() => setActiveView('menu')}
								className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors"
							>
								<FontAwesomeIcon icon={faArrowLeft} />
								Back to Menu
							</button>
						</div>
					)}
				</div>

				{/* Main Content Area */}
				<div className="flex-1">
					{/* 1. The Choosing Menu */}
					{activeView === 'menu' && (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">


							{/* AI Scan Option Card */}
							<button
								onClick={() => setActiveView('scan')}
								className="flex flex-col items-center justify-center p-8 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-center group shadow-sm"
							>
								<div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
									<FontAwesomeIcon icon={faCamera} className="text-2xl" />
								</div>
								<h3 className="text-lg font-bold text-slate-900 mb-1">Scan Receipt</h3>
								<p className="text-sm text-slate-500">
									Upload an image or PDF and let AI extract the details automatically.
								</p>
							</button>

							{/* Manual Option Card */}
							<button
								onClick={() => setActiveView('manual')}
								className="flex flex-col items-center justify-center p-8 bg-white border-2 border-slate-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all text-center group shadow-sm"
							>
								<div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
									<FontAwesomeIcon icon={faKeyboard} className="text-2xl" />
								</div>
								<h3 className="text-lg font-bold text-slate-900 mb-1">Manual Entry</h3>
								<p className="text-sm text-slate-500">
									Type in the expense details yourself without using a receipt.
								</p>
							</button>
						</div>
					)}

					{/* 2. The AI Scanner Component */}
					{activeView === 'scan' && (
						<div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
							<ReceiptScanner onReviewComplete={() => setActiveView('menu')} />
						</div>
					)}

					{/* 3. The Manual Entry Component */}
					{activeView === 'manual' && (
						<div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
							<ManualEntry />
						</div>
					)}
				</div>
			</div>

			{/* Persistent Overview Section */}
			<div className="pt-6 border-t border-slate-200 mt-12">
				<ExpenseOverview theme={theme} />
			</div>
		</div>
	);
}

export default App
