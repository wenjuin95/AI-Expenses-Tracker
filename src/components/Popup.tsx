import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCircleCheck,
	faCircleExclamation,
	faCircleQuestion,
	faXmark,
} from "@fortawesome/free-solid-svg-icons";

export type PopupType = "error" | "success" | "cancel";

interface PopupProps {
	open: boolean;
	type: PopupType;
	title: string;
	message: string;
	onOk?: () => void;
	onCancel?: () => void;
	okLabel?: string;
	cancelLabel?: string;
}

const popupStyles: Record<PopupType, {
	icon: typeof faCircleCheck;
	iconClass: string;
	buttonClass: string;
}> = {
	error: {
		icon: faCircleExclamation,
		iconClass: "text-red-500",
		buttonClass: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
	},
	success: {
		icon: faCircleCheck,
		iconClass: "text-emerald-500",
		buttonClass: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500",
	},
	cancel: {
		icon: faCircleQuestion,
		iconClass: "text-amber-500",
		buttonClass: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500",
	},
};

export default function Popup({
	open,
	type,
	title,
	message,
	onOk,
	onCancel,
	okLabel = "OK",
	cancelLabel = "Cancel",
}: PopupProps) {
	if (!open) return null;

	const style = popupStyles[type];

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
			role="presentation"
			onMouseDown={(event) => {
				if (event.target === event.currentTarget) onCancel?.();
			}}
		>
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby="popup-title"
				aria-describedby="popup-message"
				className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
			>
				<div className="flex items-start gap-4">
					<FontAwesomeIcon
						icon={style.icon}
						className={`mt-0.5 h-6 w-6 shrink-0 ${style.iconClass}`}
						aria-hidden="true"
					/>
					<div className="min-w-0 flex-1">
						<div className="flex items-start justify-between gap-4">
							<h2 id="popup-title" className="text-lg font-semibold text-slate-900">
								{title}
							</h2>
							<button
								type="button"
								onClick={onCancel ?? onOk}
								aria-label="Close popup"
								className="text-slate-400 transition-colors hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 rounded"
							>
								<FontAwesomeIcon icon={faXmark} aria-hidden="true" />
							</button>
						</div>
						<p id="popup-message" className="mt-2 text-sm leading-6 text-slate-600">
							{message}
						</p>
					</div>
				</div>

				{(onOk || onCancel) && (
					<div className="mt-6 flex justify-end gap-3">
						{onCancel && (
							<button
								type="button"
								onClick={onCancel}
								className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
							>
								{cancelLabel}
							</button>
						)}
						{onOk && (
							<button
								type="button"
								onClick={onOk}
								className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${style.buttonClass}`}
							>
								{okLabel}
							</button>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
