// src/pages/Settings/Settings.js

import "./Settings.css";

import * as MdIcons from "react-icons/md";

import { get, set } from "idb-keyval";
import {
  getCategoryCachekeys,
  getGroupCacheKey,
  getPayeeCacheKey,
  getRelativeTime,
  getSupabaseUserIdFromLocalStorage,
} from "../../utils";
import { useCallback, useEffect, useState } from "react";
import {
  addGroupInDb,
  deleteGroupInDb,
  updateGroupInDb,
  syncLocalGroupsWithSupabase,
} from "../../supabaseData";

import AppLayout from "../../components/Layouts/AppLayout";
import Button from "../../components/Button/Button";
import MyModal from "../../components/Layouts/MyModal";
import { supabase } from "../../supabaseClient";

const LAST_REFRESHED_KEY = "settings-last-refreshed";

const Settings = () => {
  const [categoryType, setCategoryType] = useState("Expense");
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [payees, setPayees] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editGroup, setEditGroup] = useState(null);
  const [groupFormName, setGroupFormName] = useState("");
  const [groupFormDesc, setGroupFormDesc] = useState("");
  const [addingGroup, setAddingGroup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);

  const { INCOME_CACHE_KEY, EXPENSE_CACHE_KEY } = getCategoryCachekeys();
  const { PAYEE_CACHE_KEY } = getPayeeCacheKey();
  const { GROUPS_CACHE_KEY } = getGroupCacheKey();

  const getVisibleLimit = useCallback(() => {
    const width = window.innerWidth;
    if (width < 768) return 6; // Mobile
    if (width < 1024) return 9; // Tablet
    return 12;
  }, []);

  const [visibleLimit, setVisibleLimit] = useState(getVisibleLimit());

  useEffect(() => {
    const handleResize = () => {
      setVisibleLimit(getVisibleLimit());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [getVisibleLimit]);

  const categoriesToShow =
    categoryType === "Expense" ? expenseCategories : incomeCategories;

  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllPayees, setShowAllPayees] = useState(false);

  const visibleCategories = showAllCategories
    ? categoriesToShow
    : categoriesToShow.slice(0, visibleLimit);

  const visiblePayees = showAllPayees ? payees : payees.slice(0, visibleLimit);

  const fetchIfMissing = async (key, fetcher) => {
    const cached = await get(key);
    if (cached && cached.length > 0) {
      return cached;
    }
    console.log("from supabase");
    const fresh = await fetcher();
    await set(key, fresh);
    return fresh;
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    const userId = getSupabaseUserIdFromLocalStorage();

    await syncLocalGroupsWithSupabase();

    const [expense, income, payeeList, groupList] = await Promise.all([
      fetchIfMissing(EXPENSE_CACHE_KEY, async () => {
        const { data } = await supabase
          .from("categories")
          .select("*")
          .eq("type", "Expense")
          .order("name", { ascending: true });
        return data || [];
      }),
      fetchIfMissing(INCOME_CACHE_KEY, async () => {
        const { data } = await supabase
          .from("categories")
          .select("*")
          .eq("type", "Income")
          .order("name", { ascending: true });
        return data || [];
      }),
      fetchIfMissing(PAYEE_CACHE_KEY, async () => {
        const { data } = await supabase
          .from("payees")
          .select("*")
          .order("name", { ascending: true });
        return data || [];
      }),
      fetchIfMissing(GROUPS_CACHE_KEY, async () => {
        const { data } = await supabase
          .from("transaction_groups")
          .select("*")
          .order("name", { ascending: true });
        return data || [];
      }),
    ]);

    setExpenseCategories(expense);
    setIncomeCategories(income);
    setPayees(payeeList);
    setGroups(groupList);

    const last = localStorage.getItem(userId + "_" + LAST_REFRESHED_KEY);
    if (last) {
      setLastSynced(Number(last));
    } else {
      const now = Date.now();
      localStorage.setItem(userId + "_" + LAST_REFRESHED_KEY, now);
      setLastSynced(now);
    }

    setLoading(false);
  }, [EXPENSE_CACHE_KEY, INCOME_CACHE_KEY, PAYEE_CACHE_KEY, GROUPS_CACHE_KEY]);

  const refreshData = useCallback(async () => {
    setSyncing(true);
    const userId = getSupabaseUserIdFromLocalStorage();

    await syncLocalGroupsWithSupabase();

    const [expenseData, incomeData, payeeData, groupData] = await Promise.all([
      supabase
        .from("categories")
        .select("*")
        .eq("type", "Expense")
        .order("name", { ascending: true }),
      supabase
        .from("categories")
        .select("*")
        .eq("type", "Income")
        .order("name", { ascending: true }),
      supabase.from("payees").select("*").order("name", { ascending: true }),
      supabase
        .from("transaction_groups")
        .select("*")
        .order("name", { ascending: true }),
    ]);

    const expense = expenseData.data || [];
    const income = incomeData.data || [];
    const payees = payeeData.data || [];
    const groupList = groupData.data || [];

    await set(EXPENSE_CACHE_KEY, expense);
    await set(INCOME_CACHE_KEY, income);
    await set(PAYEE_CACHE_KEY, payees);
    await set(GROUPS_CACHE_KEY, groupList);

    setExpenseCategories(expense);
    setIncomeCategories(income);
    setPayees(payees);
    setGroups(groupList);

    const now = Date.now();
    localStorage.setItem(userId + "_" + LAST_REFRESHED_KEY, now);
    setLastSynced(now);

    setSyncing(false);
  }, [EXPENSE_CACHE_KEY, INCOME_CACHE_KEY, PAYEE_CACHE_KEY, GROUPS_CACHE_KEY]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const renderIcon = (iconName) => {
    const Icon = MdIcons[iconName];
    return Icon ? <Icon size={16} style={{ marginRight: 8 }} /> : null;
  };

  const handleClearAndLogout = async () => {
    // Clear localStorage & sessionStorage
    localStorage.clear();
    sessionStorage.clear();

    // Clear IndexedDB
    indexedDB.databases().then((dbs) => {
      dbs.forEach((db) => indexedDB.deleteDatabase(db.name));
    });

    // Clear cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    await supabase.auth.signOut();
  };

  const handleGroupModalOpen = (group = null) => {
    setEditGroup(group);
    if (group) {
      setGroupFormName(group.name);
      setGroupFormDesc(group.description || "");
    } else {
      setGroupFormName("");
      setGroupFormDesc("");
    }
    setIsGroupModalOpen(true);
  };

  const handleGroupModalClose = () => {
    setIsGroupModalOpen(false);
    setEditGroup(null);
    setGroupFormName("");
    setGroupFormDesc("");
  };

  const handleSaveGroup = async (e) => {
    e.preventDefault();
    if (!groupFormName.trim()) return;
    setAddingGroup(true);
    try {
      if (editGroup) {
        const updated = await updateGroupInDb({
          ...editGroup,
          name: groupFormName.trim(),
          description: groupFormDesc.trim(),
        });
        setGroups((prev) =>
          prev
            .map((g) => (g.id === editGroup.id ? updated : g))
            .sort((a, b) => a.name.localeCompare(b.name))
        );
      } else {
        const newGroup = await addGroupInDb({
          name: groupFormName.trim(),
          description: groupFormDesc.trim(),
        });
        setGroups((prev) =>
          [...prev, newGroup].sort((a, b) => a.name.localeCompare(b.name))
        );
      }
      handleGroupModalClose();
    } catch (err) {
      console.error("Error saving group:", err);
    } finally {
      setAddingGroup(false);
    }
  };

  const handleDeleteGroup = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this group? Transactions in this group will not be deleted but will no longer be grouped."
      )
    )
      return;
    try {
      await deleteGroupInDb(id);
      setGroups((prev) => prev.filter((g) => g.id !== id));
      handleGroupModalClose();
    } catch (err) {
      console.error("Error deleting group:", err);
    }
  };

  return (
    <AppLayout title="Settings" loading={loading} onRefresh={refreshData}>
      <div className="sync-status">
        {lastSynced && (
          <small className="sync-time">
            {syncing && <MdIcons.MdSync className="syncing-icon" />} Last
            synced: {getRelativeTime(lastSynced)}
          </small>
        )}
      </div>
      <div className="settings-wrapper">
        {/* Categories */}
        <div className="settings-section">
          <div className="settings-header">
            <h2>Categories</h2>
            <div className="category-toggle">
              <button
                className={categoryType === "Expense" ? "active" : ""}
                onClick={() => setCategoryType("Expense")}
              >
                Expense
              </button>
              <button
                className={categoryType === "Income" ? "active" : ""}
                onClick={() => setCategoryType("Income")}
              >
                Income
              </button>
            </div>
          </div>
          <div className="category-grid">
            {visibleCategories?.map((category) => (
              <div className="category-card" key={category.id}>
                {renderIcon(category.icon)}
                <span>{category.name}</span>
              </div>
            ))}
          </div>

          {categoriesToShow?.length > visibleLimit && (
            <button
              className="show-more-btn"
              onClick={() => setShowAllCategories((prev) => !prev)}
            >
              {showAllCategories ? "Show Less" : "Show More"}
            </button>
          )}
        </div>

        {/* Payees */}
        <div className="settings-section">
          <h2>Payees</h2>
          <div className="payee-grid">
            {visiblePayees.map((payee) => (
              <div className="payee-card" key={payee.id}>
                <img src={payee.logo} alt={payee.name} className="payee-logo" />
                <div className="payee-name">{payee.name}</div>
              </div>
            ))}
          </div>

          {payees.length > visibleLimit && (
            <button
              className="show-more-btn"
              onClick={() => setShowAllPayees((prev) => !prev)}
            >
              {showAllPayees ? "Show Less" : "Show More"}
            </button>
          )}
        </div>

        {/* Groups */}
        <div className="settings-section">
          <div className="settings-header">
            <h2>Groups</h2>
            {groups.length > 0 && (
              <button
                className="add-group-icon-btn"
                onClick={() => handleGroupModalOpen()}
                aria-label="Add group"
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--primary-color)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: "4px",
                }}
              >
                <MdIcons.MdAdd size={24} />
              </button>
            )}
          </div>
          {groups.length === 0 ? (
            <div
              className="no-groups-container"
              style={{
                textAlign: "center",
                padding: "24px",
                background: "var(--card-bg, #f8f9fa)",
                borderRadius: "8px",
                border: "1px dashed var(--border-color, #e0e0e0)",
                marginTop: "12px",
              }}
            >
              <p
                style={{
                  margin: "0 0 12px 0",
                  color: "#777",
                  fontSize: "14px",
                }}
              >
                No Groups
              </p>
              <Button
                onClick={() => handleGroupModalOpen()}
                text="Add New"
                variant="primary"
              />
            </div>
          ) : (
            <div className="group-grid">
              {groups.map((group) => (
                <div
                  className="group-card"
                  key={group.id}
                  onClick={() => handleGroupModalOpen(group)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="group-info">
                    <div className="group-name">{group.name}</div>
                    {group.description && (
                      <div className="group-desc">{group.description}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <MyModal showModal={isGroupModalOpen} onClose={handleGroupModalClose}>
          <h3 style={{ marginBottom: "16px", color: "var(--text-color)" }}>
            {editGroup ? "Edit Group" : "Add Group"}
          </h3>
          <form
            onSubmit={handleSaveGroup}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div
              className="form-group"
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "var(--text-color)",
                }}
              >
                Group Name
              </label>
              <input
                type="text"
                placeholder="e.g. Trip to Ooty"
                value={groupFormName}
                onChange={(e) => setGroupFormName(e.target.value)}
                className="modal-group-input"
                required
              />
            </div>
            <div
              className="form-group"
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "var(--text-color)",
                }}
              >
                Description
              </label>
              <textarea
                placeholder="Description (Optional)"
                value={groupFormDesc}
                onChange={(e) => setGroupFormDesc(e.target.value)}
                className="modal-group-textarea"
              />
            </div>
            <div
              className="button-group"
              style={{ display: "flex", gap: "10px", marginTop: "8px" }}
            >
              <Button
                type="submit"
                text={addingGroup ? "Saving..." : editGroup ? "Save" : "Add"}
                disabled={addingGroup}
                variant="success"
              />
              {editGroup && (
                <Button
                  type="button"
                  onClick={() => handleDeleteGroup(editGroup.id)}
                  text="Delete"
                  variant="danger"
                />
              )}
              <Button
                type="button"
                onClick={handleGroupModalClose}
                text="Cancel"
                variant="info"
              />
            </div>
          </form>
        </MyModal>
      </div>
      <div className="settings-footer">
        <button className="clear-cache-btn" onClick={handleClearAndLogout}>
          Clear Cache and Logout
        </button>
      </div>
    </AppLayout>
  );
};

export default Settings;
