import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWifi } from "@fortawesome/free-solid-svg-icons";

export default function OfflinePage() {
	return (
		<main className="flex min-h-screen items-center justify-center px-6 text-center">
			<div className="max-w-md">
				<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-blue-600">
					<FontAwesomeIcon icon={faWifi} className="text-3xl" />
				</div>
				<h1 className="text-3xl font-extrabold text-slate-900">You&apos;re offline</h1>
				<p className="mt-3 text-slate-500">
					Please reconnect to the internet to use Expense Tracker.
				</p>
			</div>
		</main>
	);
}
