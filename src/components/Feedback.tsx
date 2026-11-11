import { useState } from "react";
import { faCircleCheck, faCircleExclamation, faPaperPlane, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface FeedbackProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function Feedback({ isOpen, onClose }: FeedbackProps) {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		message: ""
	})
	const [isLoading, setIsLoading] = useState(false);
	const [submitStatus, setSubmitStatus] = useState<{
		type: "success" | "error" | null;
		message: string;
	}>({ type: null, message: "" });

	if (!isOpen) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		setIsLoading(true);
		setSubmitStatus({ type: null, message: "" });
		try {
			const res = await fetch("https://formspree.io/f/mvgpalyp", {
				method: "POST",
				headers: {
					Accept: "application/json"
				},
				body: JSON.stringify(formData)
			});
			await res.json();
			if (res.ok) {
				setSubmitStatus({ type: "success", message: "Message sent successfully!" });
				setFormData({ name: "", email: "", message: "" });
				setTimeout(() => {
					setSubmitStatus({ type: null, message: "" });
					onClose(); // Close the feedback form after a short delay
				}, 2000);
			}
		} catch (error) {
			console.log("Error submitting form:", error);
			setSubmitStatus({ type: "error", message: "Failed to send message. Please try again later." });
		}  finally {
			setIsLoading(false);
		}
	}

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
			role="presentation"
			onMouseDown={(event) => {
				if (event.target === event.currentTarget) onClose();
			}}
		>
			<div
				className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
				role="dialog"
				aria-modal="true"
				aria-labelledby="feedback-title"
			>
				<div className="mb-5 flex items-center justify-between">
					<div />
					<h2 className="text-xl font-bold text-slate-900">
						Feedback
					</h2>
					<button
						type="button"
						onClick={onClose}
						aria-label="Close feedback form"
						className="text-slate-400 transition hover:text-slate-700"
					>
						<FontAwesomeIcon icon={faXmark} />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
							<div>
								<label
									htmlFor="name"
									className="mb-1 block text-sm font-medium text-slate-700"
								>
									Name
								</label>
								<input
									id="name"
									type="text"
									required
									placeholder="Enter your name"
									value={formData.name}
									onChange={(e) => setFormData({ ...formData, name: e.target.value })}
									className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
								/>
							</div>

							<div>
								<label
									htmlFor="email"
									className="mb-1 block text-sm font-medium text-slate-700"
								>
									Email
								</label>
								<input
									id="email"
									type="email"
									required
									placeholder="Enter your email"
									value={formData.email}
									onChange={(e) => setFormData({ ...formData, email: e.target.value })}
									className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
								/>
							</div>

							<div>
								<label
									htmlFor="message"
									className="mb-1 block text-sm font-medium text-slate-700"
								>
									Message
								</label>
								<textarea
									id="message"
									placeholder="Enter your message"
									rows={5}
									value={formData.message}
									onChange={(e) => setFormData({ ...formData, message: e.target.value })}
									className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
								/>
							</div>

							<button
								type="submit"
								disabled={isLoading}
								className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 font-semibold text-white transition-all ${
									isLoading
										? "cursor-not-allowed bg-blue-400"
										: "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-300"
								}`}
							>
								{isLoading ? (
									<span className="animate-pulse">Sending...</span>
								) : (
									<>
										Send Feedback
										<FontAwesomeIcon icon={faPaperPlane} />
									</>
								)}
							</button>

							{/* error/success message */}
							{submitStatus.type && (
								<div
									className={`flex items-center gap-3 p-4 rounded-xl ${
										submitStatus.type === "success"
											? "border border-emerald-200 bg-emerald-50 text-emerald-700"
											: "border border-red-200 bg-red-50 text-red-700"
									}`}
								>
									{submitStatus.type === "success" ? (
										<FontAwesomeIcon icon={faCircleCheck} className="text-emerald-600" />
									) : (
										<FontAwesomeIcon icon={faCircleExclamation} className="text-red-600" />
									)}
									<p className="text-sm">{submitStatus.message}</p>
								</div>
							)}
				</form>
			</div>
		</div>
	);
}
