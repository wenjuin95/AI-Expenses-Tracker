export default function Footer() {
	return (
		<footer className="w-full px-4 py-1 text-theme-muted">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-y-4">

                {/* Clean, tracking-wide copyright text */}
                <div className="text-xs tracking-wide text-center sm:text-left">
                    &copy; {new Date().getFullYear()}{" "}
                    <span className="font-semibold">LOW WEN JUIN</span>.
                    All rights reserved.
                </div>

            </div>
        </footer>
	)
}
