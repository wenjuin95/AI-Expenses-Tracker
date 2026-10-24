import { GoogleGenAI } from '@google/genai';
import { get, set } from 'idb-keyval';
import { receiptSchema, type Receipt } from '../types/expenses';
import { getErrorMessage, getErrorStatus } from '../types/errors';

// const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'YOUR_API_KEY';
const API_KEY = localStorage.getItem("api_key") || 'YOUR_API_KEY';
const STORAGE_KEY = "expenses_data";

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
	const reader = new FileReader();
	reader.readAsDataURL(file);
	reader.onload = () => {
	  if (typeof reader.result === 'string') {
		// reader.result looks like "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
		// We only need the base64 string part after the comma
		const base64Data = reader.result.split(',')[1];
		resolve(base64Data);
	  } else {
		reject(new Error("Failed to convert file"));
	  }
	};
	reader.onerror = (error) => reject(error);
  });
};

export async function parseReceipt(file: File): Promise<Receipt | null> {
	try {
		if (!API_KEY) {
			throw new Error("API key is not set. Please provide a valid API key.");
		}

		const ai = new GoogleGenAI({ apiKey: API_KEY });

		const base64Data = await fileToBase64(file);

		const filePart = {
			inlineData: {
				data: base64Data,
				mimeType: file.type // Automatically gets 'image/jpeg', 'application/pdf', etc.
			}
		};

		const prompt = `Extract detailed receipt information from this document. Today's date is ${new Date().toISOString().slice(0, 10)}.`;

		const response = await ai.models.generateContent({
			model: 'gemini-3.5-flash-lite',
			contents: [prompt, filePart],
			config: {
				responseMimeType: 'application/json',
				responseSchema: receiptSchema,
				temperature: 0.1
			}
		});

		if (!response.text) {
			console.warn('Received empty response from Gemini.');
			return null;
		}

		return JSON.parse(response.text) as Receipt;

	} catch (error) {
		const status = getErrorStatus(error);
		const message = getErrorMessage(error);
		if (status === 429 || message.includes('429')) {
			console.error("Rate limit exceeded (429 Too Many Requests). Please try again later.");
			throw new Error("Rate limit exceeded. Please try again later.");
		} else {
			console.error("Failed to parse receipt:", message);
			throw new Error(message || "Failed to parse receipt.");
		}

		return null;
	}
}

export async function parseReceipts(files: File[]): Promise<Array<{
	file: File;
	receipt: Receipt | null;
}>> {
	return Promise.all(
		files.map(async (file) => ({
			file,
			receipt: await parseReceipt(file)
		}))
	);
}

// Save a new expense to IndexedDB
export async function saveExpense(expense: Receipt): Promise<void> {
	try {
		// 1. Fetch existing expenses from IndexedDB (returns undefined if empty)
		const existingData = await get<Receipt[]>(STORAGE_KEY);
		const expenses = existingData || [];

		// 2. Create a new record with a unique ID and timestamp
		const newRecord = {
			...expense,
			id: crypto.randomUUID(),
			createdAt: new Date().toISOString()
		};

		// 3. Add the new record to the array
		expenses.push(newRecord);

		// 4. Save the updated array back to IndexedDB
		await set(STORAGE_KEY, expenses);

	} catch (error) {
		console.error("IndexedDB error:", error);
		throw new Error("Failed to save to database. Please check your device storage.");
	}
}

// Get saved expenses from indexedDB
export async function getSavedExpenses(): Promise<Receipt[]> {
	try {
		const data = await get<Receipt[]>(STORAGE_KEY);
		return data || [];
	} catch (error) {
		console.error("Failed to fetch from IndexedDB:", error);
		return [];
	}
}

export async function deleteExpense(id: string): Promise<void> {
	try {
		const existingData = await get<Receipt[]>(STORAGE_KEY);
		if (!existingData) return;

		// Keep all receipts EXCEPT the one with the matching ID
		const updatedExpenses = existingData.filter(expense => expense.id !== id);

		// Save the updated array back to IndexedDB
		await set(STORAGE_KEY, updatedExpenses);
	} catch (error) {
		console.error("Failed to delete expense:", error);
		throw new Error("Failed to delete the receipt.");
	}
}
