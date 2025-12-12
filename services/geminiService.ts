import { GoogleGenAI } from "@google/genai";
import { ExpenseItem, UserSettings, Category } from "../types";

const getSystemInstruction = (expenses: ExpenseItem[], settings: UserSettings): string => {
  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
  
  // Needs vs Wants Heuristic (Simple approach for AI context)
  // We provide the raw category data and let the AI reason about it, but we organize it clearly.
  const categoriesPresent = [...new Set([...settings.categories, ...expenses.map(e => e.category)])];
  
  // Generate Breakdown Text
  const breakdownLines = categoriesPresent.map(cat => {
    const items = expenses.filter(e => e.category === cat);
    if (items.length === 0) return null;
    const catTotal = items.reduce((sum, e) => sum + e.amount, 0);
    // Explicitly mention if an item is marked as Important
    const itemDetails = items.map(e => `${e.name} (${settings.currencySymbol}${e.amount}${e.isImportant ? ' - Important' : ''})`).join(', ');
    return `- ${cat}: ${settings.currencySymbol}${catTotal} [Items: ${itemDetails}]`;
  }).filter(Boolean).join('\n');

  // History Text
  const historyText = settings.history.length > 0 
    ? settings.history.map(h => `- ${h.month}: Spent ${settings.currencySymbol}${h.totalSpent}, Saved ${settings.currencySymbol}${h.saved}`).join('\n')
    : "No previous month history available yet.";

  return `
    You are a savvy, encouraging, and practical financial advisor specifically for students. 
    Your goal is to help students manage their money better, understand credit cards, investments, and how to save.

    **Current Student Profile:**
    - Name: ${settings.userName}
    - Monthly Income/Allowance: ${settings.currencySymbol}${settings.monthlyIncome}
    - Total Expenses Tracked (Current Month): ${settings.currencySymbol}${totalSpent}
    - Remaining Budget: ${settings.currencySymbol}${settings.monthlyIncome - totalSpent}
    - Savings Goal: The student wants to save more.

    **Current Month Expense Breakdown (Real Data):**
    ${breakdownLines.length > 0 ? breakdownLines : "No expenses recorded yet for this month."}

    **Past Months History:**
    ${historyText}

    **Guidelines:**
    1. **Needs vs. Wants Analysis**: When asked about saving, explicitly analyze their spending. 
       - **Crucial**: Treat items marked with "Important" as absolute 'Needs'.
       - For other items, classify categories like Rent, Utilities, Groceries, Tuition as 'Needs'.
       - Classify Dining Out, Entertainment, Subscriptions, Games as 'Wants'.
       - Point out specific "Wants" where they are spending too much based on the *Actual Data* provided above.
       - If there is no data, tell them "I need you to track some expenses first so I can see where your money is going."
    2. **Be Specific**: Do not give generic advice if you have data. Say "You spent $50 on Coffee, maybe cut that down" instead of "Cut down on coffee".
    3. **Credit Cards**: If asked, suggest starter cards (low fees, cashback) but warn about high interest.
    4. **Investments**: Explain basics (SIPs, Index Funds) simply, prioritizing safety.
    5. **Debt**: Always remind them to pay off Debt/EMIs first.
    6. **Tone**: Concise, friendly, use emojis.
    7. **Structure**: If analyzing spending, use bullet points for "Needs" vs "Wants".
  `;
};

export const generateFinancialAdvice = async (
  prompt: string,
  expenses: ExpenseItem[],
  settings: UserSettings
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: getSystemInstruction(expenses, settings),
        temperature: 0.7, 
      }
    });

    return response.text || "I couldn't generate a response right now. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I'm having trouble connecting to the financial brain right now. Check your connection or API key.";
  }
};