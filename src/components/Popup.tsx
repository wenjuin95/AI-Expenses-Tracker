import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCircleCheck,
	faCircleExclamation,
	faCircleQuestion,
	faXmark,
	faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";

export type PopupType = "error" | "success" | "cancel" | "info";

interface PopupProps {
	open: boolean;
	type: PopupType;
	title: string;
	message: string;
	onOk?: () => void;
	onCancel?: () => void;
	okLabel?: string;
	showOkButton?: boolean;
	cancelLabel?: string;
	showDontShowAgain?: boolean;
	storageKey?: string;
}

const popupStyles: Record<
	PopupType,
	{
		icon: typeof faCircleCheck;
		iconClass: string;
		buttonClass: string;
	}
> = {
	error: {
		icon: faCircleExclamation,
		iconClass: "text-blue-500 text-4xl",
		buttonClass: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
	},
	success: {
		icon: faCircleCheck,
		iconClass: "text-blue-500 text-4xl",
		buttonClass: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
	},
	cancel: {
		icon: faCircleQuestion,
		iconClass: "text-blue-500 text-4xl",
		buttonClass: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
	},
	info: {
		icon: faCircleInfo,
		iconClass: "text-blue-500 text-4xl",
		buttonClass: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
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
	showOkButton = true,
	cancelLabel = "Cancel",
	showDontShowAgain = false,
	storageKey,
}: PopupProps) {
	const [isChecked, setIsChecked] = useState(false);
	const [isPermanentlyHidden, setIsPermanentlyHidden] = useState(false);

	useEffect(() => {
		if (storageKey && localStorage.getItem(storageKey) === "true") {
			setIsPermanentlyHidden(true);
		}
	}, [storageKey]);

	if (!open || isPermanentlyHidden) return null;

	const style = popupStyles[type];

	const handleClose = (callback?: () => void) => {
		if (showDontShowAgain && isChecked && storageKey) {
			localStorage.setItem(storageKey, "true");
		}
		callback?.();
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm transition-opacity"
			role="presentation"
			onMouseDown={(event) => {
				if (event.target === event.currentTarget) handleClose(onCancel);
			}}
		>
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby="popup-title"
				aria-describedby="popup-message"
				className="relative w-full max-w-sm rounded-2xl bg-white p-6 pt-8 text-center shadow-2xl"
			>
				{/* Close Button (Top Right) */}
				<button
					type="button"
					onClick={() => handleClose(onCancel ?? onOk)}
					aria-label="Close popup"
					className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
				>
					<FontAwesomeIcon icon={faXmark} className="h-5 w-5" aria-hidden="true" />
				</button>

				{/* Icon (Top Center) */}
				<div className="mx-auto mb-4 flex items-center justify-center">
					<FontAwesomeIcon
						icon={style.icon}
						className={`h-14 w-14 drop-shadow-sm ${style.iconClass}`}
						aria-hidden="true"
					/>
				</div>

				{/* Text Content */}
				<h2 id="popup-title" className="text-xl font-bold text-slate-900">
					{title}
				</h2>
				<p id="popup-message" className="mt-2 text-sm leading-relaxed text-slate-500">
					{message}
				</p>

				{/* Checkbox area (styled as a neat pill/box) */}
				{showDontShowAgain && storageKey && (
					<div className="mt-6 flex items-center justify-center gap-2 rounded-lg py-2.5 px-3">
						<input
							type="checkbox"
							id={`dont-show-${storageKey}`}
							checked={isChecked}
							onChange={(e) => setIsChecked(e.target.checked)}
							className="h-4 w-4 rounded border-slate-300 text-blue-600 transition focus:ring-blue-500 cursor-pointer"
						/>
						<label
							htmlFor={`dont-show-${storageKey}`}
							className="text-xs font-medium text-slate-600 select-none cursor-pointer"
						>
							Do not show this message again
						</label>
					</div>
				)}

				{/* Buttons (Side by side on desktop, stacked on mobile) */}
				{(onOk || onCancel) && (
					<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
						{onCancel && (
							<button
								type="button"
								onClick={() => handleClose(onCancel)}
								className="w-full sm:w-1/2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
							>
								{cancelLabel}
							</button>
						)}
						{onOk && showOkButton && (
							<button
								type="button"
								onClick={() => handleClose(onOk)}
								className={`w-full sm:w-1/2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${style.buttonClass}`}
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
