import React, { useState, useEffect } from 'react';
import { Page, ExpenseItem, UserSettings, HistoryItem } from './types';
import Dashboard from './components/Dashboard';
import Spreadsheet from './components/Spreadsheet';
import Advisor from './components/Advisor';
import Settings from './components/Settings';
import { LayoutDashboard, Table, Bot, Settings as SettingsIcon, Menu, X, Check, CalendarClock } from 'lucide-react';

// Default Data
const DEFAULT_SETTINGS: UserSettings = {
  monthlyIncome: 0,
  currencySymbol: '$',
  userName: 'Student',
  categories: ['Needs', 'Wants', 'Savings', 'Debt'],
  isOnboardingComplete: false,
  history: []
};

const DEFAULT_EXPENSES: ExpenseItem[] = [
  { id: '1', name: 'Rent', amount: 500, category: 'Needs', date: '2023-10-01', isImportant: true, isPaid: false },
  { id: '2', name: 'Groceries', amount: 200, category: 'Needs', date: '2023-10-05', isImportant: false, isPaid: false },
  { id: '3', name: 'Emergency Fund', amount: 50, category: 'Savings', date: '2023-10-01', isImportant: true, isPaid: false },
  { id: '4', name: 'Dining Out', amount: 40, category: 'Wants', date: '2023-10-10', isImportant: false, isPaid: false },
];

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  
  // Initialize Settings
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration for old settings that might lack categories or history
      if (!parsed.categories) parsed.categories = DEFAULT_SETTINGS.categories;
      if (!parsed.history) parsed.history = [];
      return parsed;
    }
    return DEFAULT_SETTINGS;
  });

  // Initialize Expenses
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : []; // Empty initially if no local storage
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Onboarding State
  const [tempIncome, setTempIncome] = useState('');

  // Renew Month State
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [renewIncome, setRenewIncome] = useState('');

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'spreadsheet', label: 'Spreadsheet', icon: Table },
    { id: 'advisor', label: 'AI Advisor', icon: Bot },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const income = parseFloat(tempIncome);
    if (income > 0) {
      setSettings(prev => ({ ...prev, monthlyIncome: income, isOnboardingComplete: true }));
      // If expenses are empty, populate defaults
      if (expenses.length === 0) {
          setExpenses(DEFAULT_EXPENSES);
      }
      setCurrentPage('spreadsheet'); // Direct to spreadsheet after setup
    }
  };

  const openRenewModal = () => {
    setRenewIncome(settings.monthlyIncome.toString());
    setIsRenewModalOpen(true);
  };

  const executeRenewMonth = (e: React.FormEvent) => {
    e.preventDefault();
    const income = parseFloat(renewIncome);
    if (isNaN(income) || income < 0) return;

    // 1. Archive Current Month
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const savedAmount = settings.monthlyIncome - totalSpent;
    const monthName = new Date().toLocaleString('default', { month: 'short', year: 'numeric' });

    const newHistoryItem: HistoryItem = {
        month: monthName,
        totalSpent: totalSpent,
        income: settings.monthlyIncome,
        saved: savedAmount
    };

    // 2. Update Settings (History + New Income)
    setSettings(prev => ({
        ...prev,
        monthlyIncome: income,
        history: [...prev.history, newHistoryItem]
    }));

    // 3. Reset Expenses
    // Keep items if they are marked Important OR if they are in Wants/Debt categories (recurring by nature of this app's usage)
    const categoriesToKeep = ['Wants', 'Debt'];
    setExpenses(prev => 
        prev.filter(item => 
            item.isImportant || categoriesToKeep.includes(item.category)
        ).map(item => ({ ...item, isPaid: false }))
    );

    setIsRenewModalOpen(false);
    // Provide visual feedback or switch page if needed
    if (currentPage !== 'dashboard') setCurrentPage('dashboard');
  };

  return (
    <div className="flex h-screen bg-slate-950 font-sans text-slate-200">
      
      {/* Onboarding Modal */}
      {!settings.isOnboardingComplete && (
        <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in-95 duration-300">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 mx-auto mb-4 border border-indigo-500/20">
                        <span className="text-3xl font-bold">S</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">Welcome to StudentFinance</h2>
                    <p className="text-slate-400 mt-2">Let's set up your monthly budget to get started.</p>
                </div>
                
                <form onSubmit={handleOnboardingSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">What is your monthly allowance / income?</label>
                        <div className="relative">
                            <span className="absolute left-4 top-3.5 text-slate-500 font-bold">{settings.currencySymbol}</span>
                            <input 
                                type="number" 
                                required
                                min="1"
                                placeholder="e.g. 1000"
                                value={tempIncome}
                                onChange={(e) => setTempIncome(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-lg font-medium text-white placeholder-slate-600"
                                autoFocus
                            />
                        </div>
                    </div>
                    <button 
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-500 transition-colors flex items-center justify-center shadow-lg shadow-indigo-900/20"
                    >
                        Start Tracking <Check className="ml-2 w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* Renew Month Modal */}
      {isRenewModalOpen && (
        <div className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center">
                            <CalendarClock className="w-6 h-6 mr-2 text-indigo-500" />
                            Start New Month
                        </h2>
                        <p className="text-slate-400 mt-2 text-sm">
                            We'll archive your current spending history and reset your tracking. Important items, Wants, and Debt will be kept.
                        </p>
                    </div>
                    <button onClick={() => setIsRenewModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <form onSubmit={executeRenewMonth} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">What is your budget for this new month?</label>
                        <div className="relative">
                            <span className="absolute left-4 top-3.5 text-slate-500 font-bold">{settings.currencySymbol}</span>
                            <input 
                                type="number" 
                                required
                                min="1"
                                placeholder="e.g. 1000"
                                value={renewIncome}
                                onChange={(e) => setRenewIncome(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-lg font-medium text-white placeholder-slate-600"
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <button 
                            type="button"
                            onClick={() => setIsRenewModalOpen(false)}
                            className="flex-1 bg-slate-800 text-slate-300 py-3.5 rounded-xl font-bold hover:bg-slate-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="flex-1 bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/20"
                        >
                            Start Fresh
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800">
        <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/30">S</div>
          <span className="text-xl font-bold text-slate-100 tracking-tight">StudentFinance</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id as Page)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                  currentPage === item.id 
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                    : 'text-slate-500 hover:bg-slate-800 hover:text-indigo-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-slate-900 border-b border-slate-800 z-50 flex justify-between items-center p-4">
        <div className="flex items-center space-x-2">
           <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
           <span className="font-bold text-slate-100">StudentFinance</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-400 hover:text-white">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-slate-900 z-40 pt-20 px-6">
           <nav className="space-y-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id as Page);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-4 px-4 py-4 rounded-xl text-lg font-medium border ${
                    currentPage === item.id 
                      ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span>{item.label}</span>
                </button>
              );
            })}
           </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative mt-16 md:mt-0 bg-slate-950">
        <div className="h-full w-full max-w-7xl mx-auto">
          {currentPage === 'dashboard' && <Dashboard expenses={expenses} settings={settings} onRenewMonth={openRenewModal} />}
          {currentPage === 'spreadsheet' && <Spreadsheet expenses={expenses} setExpenses={setExpenses} settings={settings} setSettings={setSettings} onRenewMonth={openRenewModal} />}
          {currentPage === 'advisor' && <Advisor expenses={expenses} settings={settings} />}
          {currentPage === 'settings' && <Settings settings={settings} setSettings={setSettings} expenses={expenses} setExpenses={setExpenses} onRenewMonth={openRenewModal} />}
        </div>
      </main>
    </div>
  );
}

export default App;