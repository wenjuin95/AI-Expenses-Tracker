import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

// Extend the Event interface for the PWA prompt
interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function InstallPWAButton() {
	const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
	const [isIOS, setIsIOS] = useState(false);
	const [showIOSInstructions, setShowIOSInstructions] = useState(false);
	useEffect(() => {
		// Detect if the device is iOS
		const userAgent = window.navigator.userAgent.toLowerCase();
		const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);

		// Check if the app is already in standalone mode (installed)
		const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
							 ('standalone' in window.navigator && (window.navigator as any).standalone);

		if (isIOSDevice && !isStandalone) {
			setIsIOS(true);
		}

		// Capture the install prompt event for Android and Desktop Chrome/Edge
		const handleBeforeInstallPrompt = (e: Event) => {
			e.preventDefault();
			setDeferredPrompt(e as BeforeInstallPromptEvent);
		};

		window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

		return () => {
			window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
		};
	}, []);

	const handleInstallClick = async () => {
		if (deferredPrompt) {
			// Trigger the native Android/Desktop install prompt
			await deferredPrompt.prompt();
			const { outcome } = await deferredPrompt.userChoice;

			if (outcome === 'accepted') {
				setDeferredPrompt(null);
			}
		} else if (isIOS) {
			// Show the manual instructions for iOS
			setShowIOSInstructions(true);
		}
	};

  // Do not render the button if the app is already installed or cannot be installed
  if (!deferredPrompt && !isIOS) return null;

	return (
		<>
		<button
			onClick={handleInstallClick}
			className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
		>
			<FontAwesomeIcon icon={faDownload} className="mr-2" />
			Install App
		</button>

		{/* iOS Instructions Modal */}
		{showIOSInstructions && (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
				<div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full shadow-lg">
					<h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Install on iPhone</h3>
					<p className="text-gray-600 dark:text-gray-300 mb-4">
						Apple does not allow web apps to install automatically. To install:
					</p>
					<ol className="list-decimal pl-5 text-gray-600 dark:text-gray-300 space-y-2 mb-6">
						<li>Tap the <strong>Share</strong> button at the bottom of Safari (the square with an arrow pointing up).</li>
						<li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
					</ol>
					<button
						onClick={() => setShowIOSInstructions(false)}
						className="w-full py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
					>
						Got it
					</button>
				</div>
			</div>
		)}
		</>
	);
}
