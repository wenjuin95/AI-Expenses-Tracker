import { useState } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faKeyboard, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

import ReceiptScanner from './pages/ReceiptScanner'
import ExpenseOverview from './pages/Overview'
import ManualEntry from "./pages/ManualEntry";
import './App.css'

function App() {
	const [activeView, setActiveView] = useState<'menu' | 'scan' | 'manual'>('menu');

return (
		<div className="max-w-4xl mx-auto space-y-8 p-4 md:p-6">
			<h1 className="text-2xl font-bold text-slate-900">Expense Tracker</h1>

			{/* Header & Back Button Area */}
			<div className="flex items-center">
				{/* Only show the Back button if they are NOT on the menu */}
				{activeView !== 'menu' && (
					<div className="flex justify-end w-full">
						<button
							onClick={() => setActiveView('menu')}
							className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors"
						>
							<FontAwesomeIcon icon={faArrowLeft} />
							Back to Menu
						</button>
					</div>
				)}
			</div>

			{/* Main Content Area */}
			<div className="border-slate-200 rounded-xl p-6 bg-gray-100 shadow-sm">
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
						<ReceiptScanner />
					</div>
				)}

				{/* 3. The Manual Entry Component */}
				{activeView === 'manual' && (
					<div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
						<ManualEntry />
					</div>
				)}
			</div>

			{/* Persistent Overview Section */}
			<div className="pt-8 border-t border-slate-200 mt-12">
				<ExpenseOverview />
			</div>
		</div>
	);
}

export default App
