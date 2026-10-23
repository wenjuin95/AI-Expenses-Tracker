import { useEffect } from "react";

interface PreventRefreshProps {
	enabled: boolean;
}

export default function PreventRefresh({ enabled }: PreventRefreshProps) {
	useEffect(() => {
		if (!enabled) return;

		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			event.preventDefault();
			event.returnValue = "";
		};

		window.addEventListener("beforeunload", handleBeforeUnload);

		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, [enabled]);

	return null;
}
