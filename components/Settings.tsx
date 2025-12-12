import React from 'react';
import { UserSettings, ExpenseItem } from '../types';
import { RefreshCw, Trash, User } from 'lucide-react';

interface SettingsProps {
  settings: UserSettings;
  setSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
  expenses: ExpenseItem[];
  setExpenses: React.Dispatch<React.SetStateAction<ExpenseItem[]>>;
  onRenewMonth: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, setSettings, expenses, setExpenses, onRenewMonth }) => {
  const handleClearAll = () => {
    if (confirm("Are you sure? This deletes ALL data including history.")) {
      setExpenses([]);
      setSettings(prev => ({ ...prev, history: [], onboardingCompleted: false }));
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-100 mb-6">Settings</h1>
      
      <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-indigo-500" />
            Profile & Budget
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Your Name</label>
              <input 
                type="text" 
                value={settings.userName}
                onChange={e => setSettings(prev => ({ ...prev, userName: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Currency Symbol</label>
                <input 
                  type="text" 
                  value={settings.currencySymbol}
                  onChange={e => setSettings(prev => ({ ...prev, currencySymbol: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Monthly Income/Allowance</label>
                <input 
                  type="number" 
                  value={settings.monthlyIncome}
                  onChange={e => setSettings(prev => ({ ...prev, monthlyIncome: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Actions</h2>
          <div className="space-y-3">
            <button 
              onClick={onRenewMonth}
              className="w-full flex items-center justify-center space-x-2 bg-indigo-500/10 text-indigo-400 py-3 rounded-lg border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Renew Month (Archive & Reset)</span>
            </button>
            <p className="text-xs text-slate-500 text-center">Use this at the start of every month to save history, keep important bills, and clear one-time purchases.</p>
            
            <button 
              onClick={handleClearAll}
              className="w-full flex items-center justify-center space-x-2 bg-red-500/10 text-red-400 py-3 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-colors mt-4"
            >
              <Trash className="w-5 h-5" />
              <span>Reset Everything</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;