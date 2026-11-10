import { Type } from '@google/genai';

export type ExpenseCategory =
  | "Food"
  | "Transport"
  | "Shopping"
  | "Entertainment"
  | "Health"
  | "Other";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Health",
  "Other",
];

export const EXPENSE_CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Food: "#f59e0b",
  Transport: "#4287f5",
  Shopping: "#50cc49",
  Entertainment: "#8b5cf6",
  Health: "#ec4899",
  Other: "#64748b",
};

export const UNCATEGORIZED_COLOR = "#94a3b8";

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Receipt {
  id?: string;
  createdAt?: string;
  merchant_name: string;
  date?: string;
  currency: string;
  subtotal?: number;
  discount?: number;
  tax?: number;
  total_amount: number;
  amount_paid?: number;
  payment_method?: string;
  category?: ExpenseCategory;
  items: ReceiptItem[];
}

export const receiptSchema = {
  type: Type.OBJECT,
  properties: {
    merchant_name: { type: Type.STRING, description: "Name of the store or merchant" },
    date: { type: Type.STRING, description: "Date of the transaction in YYYY-MM-DD format" },
    currency: { type: Type.STRING, description: "Currency code (e.g., USD, RM)" },
    subtotal: { type: Type.NUMBER, description: "Subtotal amount before tax and discounts" },
    discount: { type: Type.NUMBER, description: "Total discount applied" },
    tax: { type: Type.NUMBER, description: "Total tax amount" },
    total_amount: { type: Type.NUMBER, description: "Final total amount to be paid" },
    amount_paid: { type: Type.NUMBER, description: "Actual amount paid by the customer" },
    payment_method: { type: Type.STRING, description: "Method of payment (e.g., Cash, Credit Card, E-Wallet)" },
    category: {
      type: Type.STRING,
      enum: ["Food", "Transport", "Shopping", "Entertainment", "Health", "Other"]
    },
    items: {
      type: Type.ARRAY,
      description: "List of individual items purchased",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of the item" },
          quantity: { type: Type.NUMBER, description: "Quantity purchased" },
          price: { type: Type.NUMBER, description: "Price per unit or total price for this item line" }
        },
        required: ["name", "quantity", "price"]
      }
    }
  },
  required: ["merchant_name", "total_amount", "currency", "items"]
};
