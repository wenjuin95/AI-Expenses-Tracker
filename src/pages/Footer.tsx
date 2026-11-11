import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGithub } from "@fortawesome/free-brands-svg-icons"

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

                {/* Elegant social link with subtle transition properties */}
                <div className="flex items-center gap-x-4">
                    <a
                        href="https://wenjuin95.github.io/AI-Expenses-Tracker/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-x-2 text-xs font-medium text-theme-muted"
                    >
                        <FontAwesomeIcon icon={faGithub} className="text-xs text-theme-muted" />
                        <span>Source Code</span>
                    </a>
                </div>

            </div>
        </footer>
	)
}
