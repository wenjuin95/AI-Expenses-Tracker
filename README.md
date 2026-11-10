# AI-Expense-Tracker

## About
AI-Expense-Tracker is a purely client-side web application that leverages the Google Gemini API to parse natural language and receipts into structured financial data. It runs entirely in the browser without a backend or external database.

---

## Problem
- Traditional expense trackers demand tedious, manual data entry, which leads to fatigue and inconsistent tracking.
- Modern AI-powered alternatives exist, they typically require paid subscriptions and force users to upload sensitive personal financial data to third-party cloud servers, creating privacy risks and data lock-in.

---

## Solution
- The AI processing directly to the client by utilizing a Bring-Your-Own-Key (BYOK) architecture with the Gemini API.
- Users can automate expense logging through natural language or receipt scanning while keeping 100% of their data stored locally on their device via IndexedDB. There are no backend servers, no subscriptions, and zero privacy compromises.

---

## Features
* **AI Receipt Parsing:** Upload a photo of a receipt and automatically extract the merchant, date, and total amount.
* **Natural Language Entry:** Type "spent 15 on lunch today" and let the LLM categorize and format it.
* **Zero Backend:** Fully client-side architecture with zero reliance on cloud databases.
* **Local Privacy:** All financial records are stored securely in the browser's IndexedDB.
* **Data Portability:** Export your entire transaction history to a JSON file for backup, and restore it at any time.

---

## Workflow
```
[ USER ]
   │
   ├── 1. Setup: Provides API Key ──────> [ Local Storage ]
   │
   └── 2. Input: Uploads receipt or
       types expense description
           │
           ▼
[ REACT FRONTEND ] <────────────────────────┐
           │                                │
           │ 3. Processing: Sends client    │
           │    request (Data + API Key)    │
           ▼                                │
    [ GEMINI API ]                          │ 5. UI Update:
           │                                │ Fetches new records
           │ Returns structured JSON        │ & displays to user
           ▼                                │
[ REACT FRONTEND ]                          │
           │                                │
           │ 4. Storage: Saves JSON         │
           ▼                                │
      [ INDEXEDDB ] ────────────────────────┘
      (Local Device)
```

---

## Tech Stack
* **Frontend:** React, TypeScript, Vite, TailwindCSS
* **AI Integration:** `@google/genai` (targeting Gemini 3.5 Flash Lite)
* **Storage:** IndexedDB (via Dexie.js / native API)

---

## Getting Started

### Prerequisites
* Node.js
* Gemini API Key

### Installation
1. Clone the repository:
```bash
git clone https://github.com/wenjuin95/AI-Receipt
cd AI-Expense-Tracker
```

2. Install dependencies:
```Bash
npm install
```

3. Start the development server:
```
npm run dev
```

4. Open http://localhost:5173 in your browser and enter your Gemini API key in the UI settings.

---

## Future Improvements
- Convert the application into a Progressive Web App (PWA) for native mobile installation and offline caching.

---

## License
Distributed under the MIT License. See [LICENSE](https://github.com/wenjuin95/AI-Receipt/blob/main/LICENSE) for more information.
