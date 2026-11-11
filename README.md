# Expense Tracker

## About
Expense Tracker is a purely client-side web application that leverages the Google Gemini API to parse receipts into structured financial data. It runs entirely in the browser without a backend or external database.


Demo:

https://github.com/user-attachments/assets/ec42a440-2bb9-42d7-bec9-dfcec17a75ed


---

## Problem
- Traditional expense trackers demand tedious, manual data entry, which leads to fatigue and inconsistent tracking.
- Modern AI-powered alternatives exist, they typically require paid subscriptions and force users to upload sensitive personal financial data to third-party cloud servers, creating privacy risks and data lock-in.

---

## Solution
- The AI processing directly to the client by utilizing a Bring-Your-Own-Key (BYOK) architecture with the Gemini API.
- Users can automate expense logging through receipt scanning, while always retaining full control to review, edit, or manually enter data before saving it.
- 100% of the data is stored locally on the user's device via IndexedDB. There are no backend servers, no subscriptions, and zero privacy compromises.

---

## Features
* **Human-in-the-Loop Verification:** The AI does the heavy lifting, but you always review, edit, and confirm the extracted details before anything is saved to your database.
* **Manual Entry Support:** Need to quickly log something yourself? You can easily bypass the AI and enter expenses manually at any time.
* **AI Receipt Parsing:** Upload a photo of a receipt and let the AI automatically extract the merchant, date, and total amount for your review.
* **Zero Backend:** Fully client-side architecture with zero reliance on cloud databases.
* **Local Privacy:** All financial records are stored securely in the browser's IndexedDB.
* **CSV Export:** Download your recorded expenses into a universal CSV format, making it easy to open and manage in Excel, Google Sheets, or Numbers.

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
[ REACT FRONTEND ] <──────────────────────────────────┐
           │                                          │
           │ 3. Processing: Sends client              │
           │    request (Data + API Key)              │
           ▼                                          │
    [ GEMINI API ]                                    │
           │                                          │ 5. Data Visualization:
           │ Returns structured JSON                  │ Fetches all records from
           ▼                                          │ IndexedDB to display:
[ REACT FRONTEND ]                                    │  ├── Expense History (Table/List)
           │                                          │  └── Spending Charts (Visuals)
           │ 4. Storage: Saves JSON                   │
           ▼                                          │
      [ INDEXEDDB ] ──────────────────────────────────┘
      (Local Device)
           │
           │ 6. Data Portability: User clicks "Export to CSV"
           ▼
[ REACT FRONTEND ]
           │
           │ Queries IndexedDB, converts JSON to CSV format
           ▼
        [ USER ] <── (Downloads .csv file to local device)
```

---

## Tech Stack
* **Frontend:** React, TypeScript, Vite, TailwindCSS
* **AI Integration:** Gemini API
* **Storage:** IndexedDB (idb-keyval)

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
- Allow conversational inputs (e.g., typing "spent 15 on milk tea today") that the LLM will automatically categorize and format into a draft record.
- AI assistant to help you split bill with tax calculation

---

## License
Distributed under the MIT License. See [LICENSE](https://github.com/wenjuin95/AI-Receipt/blob/main/LICENSE) for more information.
