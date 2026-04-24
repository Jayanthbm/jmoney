import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Main Screens
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import TransactionsScreen from './screens/TransactionsScreen';
import BudgetsScreen from './screens/BudgetsScreen';
import GoalsScreen from './screens/GoalsScreen';
import ReportsScreen from './screens/ReportsScreen';
import SettingsScreen from './screens/SettingsScreen';
import AddTransactionScreen from './screens/AddTransactionScreen';
import CategoriesScreen from './screens/CategoriesScreen';
import PayeesScreen from './screens/PayeesScreen';
import QuickTransactionsScreen from './screens/QuickTransactionsScreen';
import CalendarViewScreen from './screens/CalendarViewScreen';
import DailyLimitDetailScreen from './screens/DailyLimitDetailScreen';

// Report Screens
import LivingCostsReportScreen from './screens/reports/LivingCostsReportScreen';
import SubscriptionBillsReportScreen from './screens/reports/SubscriptionBillsReportScreen';
import PayeeSummaryReportScreen from './screens/reports/PayeeSummaryReportScreen';
import CategorySummaryReportScreen from './screens/reports/CategorySummaryReportScreen';
import MonthlySummaryReportScreen from './screens/reports/MonthlySummaryReportScreen';
import YearlySummaryReportScreen from './screens/reports/YearlySummaryReportScreen';
import YearlyCategoryReportScreen from './screens/reports/YearlyCategoryReportScreen';
import YearlyPayeeReportScreen from './screens/reports/YearlyPayeeReportScreen';
import PayeeOverviewReportScreen from './screens/reports/PayeeOverviewReportScreen';
import CategoryOverviewReportScreen from './screens/reports/CategoryOverviewReportScreen';

export default function AppRouter() {
  // TODO: Replace with real auth check
  const isLoggedIn = false;

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<LoginScreen />} />

        {/* Protected routes — redirect to /login if not authenticated */}
        <Route
          path="/dashboard"
          element={isLoggedIn ? <DashboardScreen /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/transactions"
          element={isLoggedIn ? <TransactionsScreen /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/budgets"
          element={isLoggedIn ? <BudgetsScreen /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/goals"
          element={isLoggedIn ? <GoalsScreen /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/reports"
          element={isLoggedIn ? <ReportsScreen /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/settings"
          element={isLoggedIn ? <SettingsScreen /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/transactions/add"
          element={isLoggedIn ? <AddTransactionScreen /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/categories"
          element={isLoggedIn ? <CategoriesScreen /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/payees"
          element={isLoggedIn ? <PayeesScreen /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/quick-transactions"
          element={isLoggedIn ? <QuickTransactionsScreen /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/transactions/calendar"
          element={isLoggedIn ? <CalendarViewScreen /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/dashboard/daily-limit"
          element={isLoggedIn ? <DailyLimitDetailScreen /> : <Navigate to="/login" replace />}
        />

        {/* Report Sub-screens */}
        <Route
          path="/reports/living-costs"
          element={isLoggedIn ? <LivingCostsReportScreen /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/reports/subscription-bills"
          element={isLoggedIn ? <SubscriptionBillsReportScreen /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/reports/payee-summary"
          element={isLoggedIn ? <PayeeSummaryReportScreen /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/reports/category-summary"
          element={isLoggedIn ? <CategorySummaryReportScreen /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/reports/monthly-summary"
          element={isLoggedIn ? <MonthlySummaryReportScreen /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/reports/yearly-summary"
          element={isLoggedIn ? <YearlySummaryReportScreen /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/reports/yearly-category"
          element={isLoggedIn ? <YearlyCategoryReportScreen /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/reports/yearly-payee"
          element={isLoggedIn ? <YearlyPayeeReportScreen /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/reports/payee-overview"
          element={isLoggedIn ? <PayeeOverviewReportScreen /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/reports/category-overview"
          element={isLoggedIn ? <CategoryOverviewReportScreen /> : <Navigate to="/login" replace />}
        />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to={isLoggedIn ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
