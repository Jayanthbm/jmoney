import React, { useState } from "react";
import { Layout } from "../components/Layout";
import { Card } from "../components/Common";
import { SettingRow } from "../components/SettingRow";
import { useAuth, supabase } from "../store/AuthContext";
import { useTheme } from "../store/ThemeContext";
import { useToast } from "../store/ToastContext";
import { db } from "../db/db";
import { storageService } from "../services/storageService";
import { syncService } from "../services/syncService";
import { useNavigate } from "react-router-dom";
import {
  Sun,
  Moon,
  Bell,
  Fingerprint,
  Category,
  Store,
  Zap,
  Trash2,
  RefreshCw,
  User,
  LogOut,
  ChevronRight,
  Tag,
  Users,
  Smartphone,
} from "lucide-react";

const Settings = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleLogout = async () => {
    if (
      window.confirm(
        "Are you sure you want to securely log out? Local data remains safe."
      )
    ) {
      await supabase.auth.signOut();
    }
  };

  const handleResetData = async () => {
    if (
      window.confirm(
        "This will permanently delete all your Transactions and local records. Account info remains safe. Continue?"
      )
    ) {
      setIsResetting(true);
      try {
        await db.delete();
        await storageService.clear();
        showToast("Data reset successfully.", "success");
        setTimeout(() => window.location.reload(), 1000);
      } catch (err) {
        showToast("Reset failed.", "error");
      } finally {
        setIsResetting(false);
      }
    }
  };

  const handleManualSync = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      await syncService.pushLocalChanges(user.id);
      showToast("Sync successful!", "success");
    } catch (err) {
      showToast("Sync failed.", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Layout>
      <div className="screen-header">
        <h1>Settings</h1>
      </div>

      <div className="settings-content">
        {/* Appearance */}
        <div className="section-header-text">Appearance</div>
        <div className="group-card">
          <div className="theme-selector">
            <div
              className={`theme-option ${!isDark ? "active" : ""}`}
              onClick={() => isDark && toggleTheme()}
            >
              <Sun size={18} /> Light
            </div>
            <div
              className={`theme-option ${isDark ? "active" : ""}`}
              onClick={() => !isDark && toggleTheme()}
            >
              <Moon size={18} /> Dark
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="section-header-text">Preferences</div>
        <div className="group-card">
          <SettingRow
            icon={Bell}
            title="Daily Reminders"
            value="Coming soon"
            onPress={() => {}}
          />
          <div className="divider" />
          <SettingRow
            icon={Smartphone}
            title="Use Biometrics"
            value="N/A for Web"
            showArrow={false}
          />
        </div>

        {/* Manage Data */}
        <div className="section-header-text">Manage Data</div>
        <div className="group-card">
          <SettingRow
            icon={Tag}
            title="Categories"
            value="Manage Categories"
            onPress={() => navigate("/categories")}
          />
          <div className="divider" />
          <SettingRow
            icon={Users}
            title="Payees"
            value="Manage Payees"
            onPress={() => navigate("/payees")}
          />
          <div className="divider" />
          <SettingRow
            icon={Zap}
            title="Quick Transactions"
            value="Manage Templates"
            onPress={() => {}}
          />
          <div className="divider" />
          <SettingRow
            icon={Trash2}
            title="Reset Data"
            value="Wipe all local records"
            color="#ef4444"
            onPress={handleResetData}
            isLoading={isResetting}
          />
          <div className="divider" />
          <SettingRow
            icon={RefreshCw}
            title="Cloud Sync"
            value={isSyncing ? "Syncing..." : "Last synced: Just now"}
            onPress={handleManualSync}
            isLoading={isSyncing}
          />
        </div>

        {/* Account */}
        <div className="section-header-text">Account</div>
        <div className="group-card">
          <SettingRow
            icon={User}
            title="User Email"
            value={user?.email || "Guest"}
            showArrow={false}
          />
          <div className="divider" />
          <SettingRow
            icon={LogOut}
            title="Sign Out"
            color="#ef4444"
            onPress={handleLogout}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
