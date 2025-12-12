import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ExpenseItem, UserSettings } from '../types';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, PieChart as PieIcon, Activity, CalendarClock } from 'lucide-react';

interface DashboardProps {
  expenses: ExpenseItem[];
  settings: UserSettings;
  onRenewMonth: () => void;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const Dashboard: React.FC<DashboardProps> = ({ expenses, settings, onRenewMonth }) => {
  // Only count expenses that are marked as PAID (Done)
  const paidExpenses = expenses.filter(item => item.isPaid);
  const totalExpenses = paidExpenses.reduce((acc, item) => acc + item.amount, 0);
  
  const remaining = settings.monthlyIncome - totalExpenses;
  const savingsRate = settings.monthlyIncome > 0 ? ((remaining / settings.monthlyIncome) * 100).toFixed(1) : '0';

  const categoryData = useMemo(() => {
    const data: Record<string, number> = {};
    // Initialize with 0 for all known categories
    settings.categories.forEach(c => data[c] = 0);
    
    // Only aggregate PAID expenses
    paidExpenses.forEach(item => {
      const cat = item.category || 'Uncategorized';
      data[cat] = (data[cat] || 0) + item.amount;
    });

    return Object.entries(data)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [paidExpenses, settings.categories]);

  // Calculate totals based on PAID expenses and the IMPORTANT flag
  // This matches the user's explicit marking instead of guessing by category
  const importantPaidTotal = paidExpenses.filter(e => e.isImportant).reduce((a, b) => a + b.amount, 0);
  const otherPaidTotal = paidExpenses.filter(e => !e.isImportant).reduce((a, b) => a + b.amount, 0);

  // Prepare History Data for Chart
  const trendData = useMemo(() => {
    if (!settings.history || settings.history.length === 0) return [];
    // Take the last 6 months
    return settings.history.slice(-6).map(h => ({
      month: h.month,
      amount: h.totalSpent
    }));
  }, [settings.history]);

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full pb-24 scrollbar-thin scrollbar-thumb-slate-700">
      <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-100">Welcome back, {settings.userName} 👋</h1>
            <p className="text-slate-400">Here's your financial overview based on paid expenses.</p>
        </div>
        <button 
            onClick={onRenewMonth}
            className="flex items-center space-x-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:text-white text-slate-400 px-4 py-2 rounded-lg transition-colors font-medium text-sm"
        >
            <CalendarClock className="w-4 h-4" />
            <span>Start New Month</span>
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-4 rounded-xl shadow-lg border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Monthly Budget</span>
            <div className="bg-indigo-500/10 p-2 rounded-lg">
              <DollarSign className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100">{settings.currencySymbol}{settings.monthlyIncome.toLocaleString()}</div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl shadow-lg border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Spent (Done)</span>
            <div className="bg-amber-500/10 p-2 rounded-lg">
              <TrendingDown className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100">{settings.currencySymbol}{totalExpenses.toLocaleString()}</div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl shadow-lg border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Remaining</span>
            <div className={`p-2 rounded-lg ${remaining < 0 ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
              {remaining < 0 ? (
                 <AlertCircle className="w-4 h-4 text-red-500" />
              ) : (
                 <TrendingUp className="w-4 h-4 text-emerald-500" />
              )}
            </div>
          </div>
          <div className={`text-2xl font-bold ${remaining < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {settings.currencySymbol}{remaining.toLocaleString()}
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl shadow-lg border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Savings Rate</span>
            <div className="bg-blue-500/10 p-2 rounded-lg">
              <PieIcon className="w-4 h-4 text-blue-500" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100">{savingsRate}%</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 p-6 rounded-xl shadow-lg border border-slate-800">
          <h3 className="text-lg font-bold text-slate-100 mb-4">Expense Breakdown (Paid)</h3>
          {categoryData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `${settings.currencySymbol}${value}`}
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155', color: '#f8fafc', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-600">
              No paid expenses recorded yet.
            </div>
          )}
        </div>

        <div className="bg-slate-900 p-6 rounded-xl shadow-lg border border-slate-800">
          <h3 className="text-lg font-bold text-slate-100 mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800">
                <p className="text-sm font-medium text-slate-400">Important (Paid)</p>
                <p className="text-xl font-bold text-slate-200">{settings.currencySymbol}{importantPaidTotal.toLocaleString()}</p>
                <p className="text-xs text-slate-500">Items marked with Star ⭐</p>
            </div>
            <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800">
                <p className="text-sm font-medium text-slate-400">Other (Paid)</p>
                <p className="text-xl font-bold text-slate-200">{settings.currencySymbol}{otherPaidTotal.toLocaleString()}</p>
                <p className="text-xs text-slate-500">All other expenses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Spending Trend Chart */}
      <div className="bg-slate-900 p-6 rounded-xl shadow-lg border border-slate-800">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-100 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-indigo-500" />
                Spending Trend (Last 6 Months)
            </h3>
        </div>
        
        {trendData.length > 0 ? (
          <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis 
                          dataKey="month" 
                          stroke="#94a3b8" 
                          tick={{fill: '#94a3b8', fontSize: 12}} 
                          axisLine={false}
                          tickLine={false}
                      />
                      <YAxis 
                          stroke="#94a3b8" 
                          tick={{fill: '#94a3b8', fontSize: 12}} 
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(value) => `${settings.currencySymbol}${value}`}
                      />
                      <Tooltip 
                          formatter={(value: number) => [`${settings.currencySymbol}${value}`, 'Spent']}
                          contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155', color: '#f8fafc' }}
                          itemStyle={{ color: '#818cf8' }}
                          labelStyle={{ color: '#94a3b8' }}
                      />
                      <Line 
                          type="monotone" 
                          dataKey="amount" 
                          stroke="#6366f1" 
                          strokeWidth={3} 
                          dot={{ fill: '#1e293b', stroke: '#6366f1', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, fill: '#818cf8' }}
                      />
                  </LineChart>
              </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-slate-600 bg-slate-950/30 rounded-lg border border-dashed border-slate-800">
             <Activity className="w-8 h-8 mb-2 opacity-50" />
             <p>No history data yet.</p>
             <p className="text-xs mt-1 text-slate-500">Data will appear here after you "Renew Month".</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;