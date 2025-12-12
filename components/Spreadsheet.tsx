import React, { useState, useMemo } from 'react';
import { ExpenseItem, Category, UserSettings, HistoryItem } from '../types';
import { Trash2, Plus, X, LayoutGrid, AlertCircle, CheckCircle, Pencil, ArrowUpDown, CalendarClock, ChevronDown, ChevronUp, Star } from 'lucide-react';

interface SortConfig {
  key: keyof ExpenseItem;
  direction: 'asc' | 'desc';
}

interface ExpenseTableProps {
  category: string;
  expenses: ExpenseItem[];
  currencySymbol: string;
  updateExpense: (id: string, field: keyof ExpenseItem, value: any) => void;
  deleteExpense: (id: string) => void;
  addRow: (category: string) => void;
  deleteTable: (category: string) => void;
}

const ExpenseTable: React.FC<ExpenseTableProps> = ({ 
  category, 
  expenses, 
  currencySymbol, 
  updateExpense, 
  deleteExpense, 
  addRow, 
  deleteTable 
}) => {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const categoryExpenses = expenses.filter(e => e.category === category);
  const subTotal = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSort = (key: keyof ExpenseItem) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedExpenses = useMemo(() => {
    let sortableItems = [...categoryExpenses];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [categoryExpenses, sortConfig]);

  const renderSortIcon = (key: keyof ExpenseItem) => {
      if (sortConfig?.key !== key) return <ArrowUpDown className="w-3 h-3 ml-1 text-slate-600 opacity-0 group-hover:opacity-50" />;
      return sortConfig.direction === 'asc' 
        ? <ChevronUp className="w-3 h-3 ml-1 text-indigo-400" /> 
        : <ChevronDown className="w-3 h-3 ml-1 text-indigo-400" />;
  };

  return (
    <div className="bg-slate-900 rounded-xl shadow-lg shadow-black/20 border border-slate-800 overflow-hidden flex flex-col h-full ring-1 ring-white/5">
        {/* Table Header */}
        <div className="bg-slate-900/50 px-6 py-4 border-b border-slate-800 flex justify-between items-center group flex-none">
            <div className="flex items-center space-x-3">
                <h3 className="text-lg font-bold text-slate-100 tracking-tight">{category}</h3>
                <span className="px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 rounded-full text-[10px] font-semibold uppercase tracking-wider">
                    {categoryExpenses.length} items
                </span>
            </div>
            <div className="flex items-center space-x-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Subtotal</span>
                <span className="text-lg font-mono font-bold text-indigo-400">{currencySymbol}{subTotal.toLocaleString()}</span>
                <button onClick={() => deleteTable(category)} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>

        {/* Table Grid */}
        <div className="overflow-x-auto overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-900 sticky top-0 z-10 shadow-sm">
                        <th className="px-6 py-3 w-16 text-center">Done</th>
                        <th 
                            className="px-6 py-3 cursor-pointer hover:text-slate-300 transition-colors group select-none"
                            onClick={() => handleSort('name')}
                        >
                            <div className="flex items-center">Item Name {renderSortIcon('name')}</div>
                        </th>
                        <th 
                            className="px-6 py-3 w-32 text-right cursor-pointer hover:text-slate-300 transition-colors group select-none"
                            onClick={() => handleSort('amount')}
                        >
                             <div className="flex items-center justify-end">Amount {renderSortIcon('amount')}</div>
                        </th>
                        <th 
                            className="px-6 py-3 w-36 cursor-pointer hover:text-slate-300 transition-colors group select-none"
                            onClick={() => handleSort('date')}
                        >
                             <div className="flex items-center">Due Date {renderSortIcon('date')}</div>
                        </th>
                        <th className="px-6 py-3 w-20 text-center">Important</th>
                        <th className="px-6 py-3 w-12"></th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {sortedExpenses.map(item => (
                        <tr key={item.id} className={`border-b border-slate-800/50 transition-colors group/row ${
                            item.isPaid ? 'bg-slate-900/30' : 
                            item.isImportant ? 'bg-amber-500/5 hover:bg-amber-500/10' : 
                            'hover:bg-slate-800/40'
                        }`}>
                            <td className="px-6 py-3 text-center">
                                <label className="relative flex items-center justify-center cursor-pointer p-2 -m-2 group/check">
                                    <input 
                                        type="checkbox" 
                                        checked={item.isPaid}
                                        onChange={(e) => updateExpense(item.id, 'isPaid', e.target.checked)}
                                        className="peer w-5 h-5 appearance-none rounded-md border-2 border-slate-600 checked:bg-indigo-500 checked:border-indigo-500 transition-all cursor-pointer group-hover/check:border-indigo-400" 
                                    />
                                    <CheckCircle className="w-3.5 h-3.5 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
                                </label>
                            </td>
                            <td className="px-6 py-3 p-0">
                                <input 
                                    type="text" 
                                    value={item.name}
                                    onChange={(e) => updateExpense(item.id, 'name', e.target.value)}
                                    placeholder="New Item"
                                    className={`w-full bg-transparent border-none p-0 focus:ring-0 placeholder-slate-600 font-medium transition-colors ${
                                        item.isPaid ? 'text-slate-500 line-through decoration-slate-600' : 
                                        item.isImportant ? 'text-amber-200' : 'text-slate-200'
                                    }`}
                                />
                            </td>
                            <td className="px-6 py-3 p-0 relative">
                                <div className="flex items-center justify-end group/input">
                                    <span className="text-slate-600 text-xs mr-1 group-focus-within/input:text-indigo-500 transition-colors">{currencySymbol}</span>
                                    <input 
                                        type="number" 
                                        value={item.amount || ''}
                                        onChange={(e) => updateExpense(item.id, 'amount', parseFloat(e.target.value) || 0)}
                                        placeholder="0"
                                        className={`w-20 bg-transparent border-none p-0 focus:ring-0 text-right font-mono transition-colors ${
                                            item.isPaid ? 'text-slate-500' : 
                                            item.isImportant ? 'text-amber-200' : 'text-slate-200'
                                        }`}
                                    />
                                </div>
                            </td>
                            <td className="px-6 py-3 p-0">
                                <input 
                                    type="date"
                                    value={item.date}
                                    onChange={(e) => updateExpense(item.id, 'date', e.target.value)}
                                    className={`w-full bg-transparent border-none p-0 focus:ring-0 text-xs [color-scheme:dark] ${item.isImportant ? 'text-amber-200/70' : 'text-slate-500 focus:text-slate-300'}`} 
                                />
                            </td>
                            <td className="px-6 py-3 text-center">
                                <button 
                                    onClick={() => updateExpense(item.id, 'isImportant', !item.isImportant)}
                                    className={`p-2 rounded-lg transition-all transform active:scale-95 ${
                                        item.isImportant 
                                        ? 'text-amber-400 bg-amber-500/10 shadow-sm' 
                                        : 'text-slate-700 hover:text-amber-400 hover:bg-slate-800'
                                    }`}
                                    title={item.isImportant ? "Marked as Important" : "Mark as Important"}
                                >
                                    <Star className={`w-5 h-5 ${item.isImportant ? 'fill-amber-400' : 'fill-none'}`} />
                                </button>
                            </td>
                            <td className="px-6 py-3 text-center">
                                <button 
                                    onClick={() => deleteExpense(item.id)}
                                    className="text-slate-600 hover:text-red-400 transition-all transform hover:scale-110 p-2 opacity-60 hover:opacity-100"
                                    title="Delete Item"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                    <tr>
                        <td colSpan={6} className="px-6 py-3">
                            <button 
                                onClick={() => addRow(category)}
                                className="flex items-center text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-indigo-400 transition-colors group w-full py-1"
                            >
                                <div className="w-5 h-5 rounded-full border border-dashed border-slate-600 flex items-center justify-center mr-2 group-hover:border-indigo-500 group-hover:bg-indigo-500/10">
                                    <Plus className="w-3 h-3" />
                                </div>
                                Add {category} Item
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
  );
};

interface SpreadsheetProps {
  expenses: ExpenseItem[];
  setExpenses: React.Dispatch<React.SetStateAction<ExpenseItem[]>>;
  settings: UserSettings;
  setSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
  onRenewMonth: () => void;
}

const Spreadsheet: React.FC<SpreadsheetProps> = ({ expenses, setExpenses, settings, setSettings, onRenewMonth }) => {
  const [newTableName, setNewTableName] = useState('');
  const [isAddingTable, setIsAddingTable] = useState(false);
  const [isEditingIncome, setIsEditingIncome] = useState(false);
  const [tempIncome, setTempIncome] = useState('');

  // --- Logic ---
  // Only count items explicitly marked as Important
  const fixedSpendItems = expenses.filter(e => e.isImportant);
  const fixedSpendTotal = fixedSpendItems.reduce((sum, item) => sum + item.amount, 0);
  
  const hasFixedItems = fixedSpendItems.length > 0;
  const allFixedPaid = hasFixedItems && fixedSpendItems.every(e => e.isPaid);
  
  const totalPaid = expenses.filter(e => e.isPaid).reduce((sum, item) => sum + item.amount, 0);
  const remaining = settings.monthlyIncome - totalPaid;

  const updateExpense = (id: string, field: keyof ExpenseItem, value: any) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const deleteExpense = (id: string) => {
      setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const addRow = (category: string) => {
    const newExpense: ExpenseItem = {
      id: crypto.randomUUID(),
      name: '',
      amount: 0,
      category,
      date: new Date().toISOString().split('T')[0],
      isImportant: false,
      isPaid: false
    };
    setExpenses(prev => [...prev, newExpense]);
  };

  const handleAddTable = () => {
    if (newTableName && !settings.categories.includes(newTableName)) {
        setSettings(prev => ({
            ...prev,
            categories: [...prev.categories, newTableName]
        }));
        setNewTableName('');
        setIsAddingTable(false);
    }
  };

  const deleteTable = (categoryToDelete: string) => {
      if(confirm(`Delete "${categoryToDelete}" table? This will not delete the expenses, but they will be hidden until reassigned.`)) {
          setSettings(prev => ({
              ...prev,
              categories: prev.categories.filter(c => c !== categoryToDelete)
          }));
      }
  };

  const startEditingIncome = () => {
    setTempIncome(settings.monthlyIncome.toString());
    setIsEditingIncome(true);
  };

  const saveIncome = () => {
    const newVal = parseFloat(tempIncome);
    if (!isNaN(newVal) && newVal >= 0) {
        setSettings(prev => ({ ...prev, monthlyIncome: newVal }));
    }
    setIsEditingIncome(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 relative">
        {/* Top Summary Block */}
        <div className="bg-slate-900 border-b border-slate-800 p-6 z-10 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Total Income (Editable) */}
                <div className="p-4 bg-slate-800 rounded-xl border border-slate-700/50 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                         <LayoutGrid className="w-16 h-16 text-indigo-500" />
                    </div>
                    <div className="flex justify-between items-center mb-1 relative z-10">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monthly Income</p>
                        {!isEditingIncome && (
                            <button 
                                onClick={startEditingIncome}
                                className="text-slate-500 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all"
                                title="Edit Income"
                            >
                                <Pencil className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                    
                    {isEditingIncome ? (
                        <div className="flex items-center relative z-10">
                            <span className="text-lg font-bold text-slate-500 mr-1">{settings.currencySymbol}</span>
                            <input 
                                autoFocus
                                type="number" 
                                value={tempIncome}
                                onChange={(e) => setTempIncome(e.target.value)}
                                onBlur={saveIncome}
                                onKeyDown={(e) => e.key === 'Enter' && saveIncome()}
                                className="w-full bg-slate-900 border border-indigo-500 rounded px-2 py-1 text-xl font-bold text-white focus:outline-none shadow-inner"
                            />
                        </div>
                    ) : (
                        <div 
                            onClick={startEditingIncome}
                            className="cursor-pointer hover:bg-slate-700/50 -mx-2 px-2 rounded transition-colors relative z-10"
                        >
                             <p className="text-2xl font-bold text-slate-100 tracking-tight">{settings.currencySymbol}{settings.monthlyIncome.toLocaleString()}</p>
                        </div>
                    )}
                </div>
                
                {/* 2. Fixed Spend (Status Signal) */}
                <div className={`p-4 rounded-xl border transition-all duration-500 ${
                    !hasFixedItems ? 'bg-slate-800 border-slate-700/50' :
                    allFixedPaid ? 'bg-emerald-950/30 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-red-950/30 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                }`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center ${
                                !hasFixedItems ? 'text-slate-400' :
                                allFixedPaid ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                                Important Spend
                                {hasFixedItems && (
                                    allFixedPaid 
                                    ? <CheckCircle className="w-3 h-3 ml-1.5" /> 
                                    : <AlertCircle className="w-3 h-3 ml-1.5" />
                                )}
                            </p>
                            <p className={`text-2xl font-bold tracking-tight ${
                                !hasFixedItems ? 'text-slate-100' :
                                allFixedPaid ? 'text-emerald-300' : 'text-red-300'
                            }`}>
                                {settings.currencySymbol}{fixedSpendTotal.toLocaleString()}
                            </p>
                        </div>
                        {hasFixedItems && !allFixedPaid && (
                           <span className="text-[9px] font-black bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/20 uppercase tracking-wider">
                               Priority
                           </span>
                        )}
                         {hasFixedItems && allFixedPaid && (
                           <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wider">
                               Done
                           </span>
                        )}
                    </div>
                </div>

                {/* 3. Remaining Balance */}
                <div className="p-4 bg-slate-800 rounded-xl border border-slate-700/50 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-2 opacity-10">
                         <LayoutGrid className="w-16 h-16 text-emerald-500" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 relative z-10">Remaining Balance</p>
                    <div className="flex items-baseline space-x-2 relative z-10">
                        <p className={`text-2xl font-bold tracking-tight ${remaining < 0 ? 'text-red-400' : 'text-slate-100'}`}>
                            {settings.currencySymbol}{remaining.toLocaleString()}
                        </p>
                        <span className="text-xs text-slate-500 font-medium">
                            (Income - Paid)
                        </span>
                    </div>
                </div>
            </div>

            {/* Actions: New Table & Renew Month */}
            <div className="flex flex-col space-y-3 justify-center min-w-[140px]">
                 {/* Renew Month Button */}
                <button 
                    onClick={onRenewMonth}
                    className="flex items-center justify-center space-x-2 bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-lg transition-all text-sm font-semibold group"
                >
                    <CalendarClock className="w-4 h-4 group-hover:animate-pulse" />
                    <span>Start New Month</span>
                </button>

                 {isAddingTable ? (
                    <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-1 animate-in fade-in slide-in-from-right-4">
                        <input 
                            autoFocus
                            type="text" 
                            placeholder="Name..."
                            className="bg-transparent border-none focus:ring-0 text-sm px-2 py-1.5 w-24 text-white placeholder-slate-500"
                            value={newTableName}
                            onChange={(e) => setNewTableName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTable()}
                        />
                        <button onClick={handleAddTable} className="p-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-500">
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setIsAddingTable(false)} className="p-1.5 text-slate-400 hover:text-white">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                 ) : (
                    <button 
                        onClick={() => setIsAddingTable(true)}
                        className="flex items-center justify-center space-x-2 bg-slate-800 text-slate-300 border border-slate-700 px-4 py-2 rounded-lg hover:bg-slate-700 hover:text-white transition-all text-sm font-semibold"
                    >
                        <LayoutGrid className="w-4 h-4" />
                        <span>Add Table</span>
                    </button>
                 )}
            </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 pb-32 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start max-w-7xl mx-auto">
                {settings.categories.map(cat => (
                    <ExpenseTable 
                        key={cat} 
                        category={cat} 
                        expenses={expenses}
                        currencySymbol={settings.currencySymbol}
                        updateExpense={updateExpense}
                        deleteExpense={deleteExpense}
                        addRow={addRow}
                        deleteTable={deleteTable}
                    />
                ))}
                
                {settings.categories.length === 0 && (
                    <div className="col-span-full text-center py-20">
                        <div className="bg-slate-900/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-slate-800">
                             <LayoutGrid className="w-8 h-8 text-slate-600" />
                        </div>
                        <h3 className="text-slate-300 font-medium text-lg">Your workspace is empty</h3>
                        <p className="text-slate-500 mt-2">Click "Add Table" to start organizing your budget.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default Spreadsheet;