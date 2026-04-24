import React, { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { Card, Button, Input } from "../components/Common";
import { categoryService } from "../services/categoryService";
import { useAuth } from "../store/AuthContext";
import { Plus, Tag } from "lucide-react";

const Categories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("Expense");

  useEffect(() => {
    if (user) {
      categoryService.getAll(user.id).then(setCategories);
    }
  }, [user]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const cat = await categoryService.add(
      user.id,
      newName,
      newType,
      "category"
    );
    setCategories([...categories, cat]);
    setNewName("");
    setShowAdd(false);
  };

  return (
    <Layout>
      <div className="screen-header">
        <h1>Categories</h1>
        <Button onClick={() => setShowAdd(!showAdd)}>
          <Plus size={18} /> Add
        </Button>
      </div>

      {showAdd && (
        <Card className="form-card" style={{ marginBottom: "2rem" }}>
          <form onSubmit={handleAdd}>
            <Input
              label="Category Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Shopping"
              required
            />
            <div className="type-toggle">
              <button
                type="button"
                className={`toggle-btn ${newType === "Expense" ? "active" : ""}`}
                onClick={() => setNewType("Expense")}
              >
                Expense
              </button>
              <button
                type="button"
                className={`toggle-btn ${newType === "Income" ? "active" : ""}`}
                onClick={() => setNewType("Income")}
              >
                Income
              </button>
            </div>
            <Button type="submit" style={{ width: "100%" }}>
              Create Category
            </Button>
          </form>
        </Card>
      )}

      <div className="items-grid">
        {categories.map((cat) => (
          <Card key={cat.id} className="item-card">
            <div className="item-icon-bg">
              <Tag
                size={20}
                color={
                  cat.type === "Expense" ? "var(--danger)" : "var(--success)"
                }
              />
            </div>
            <div className="item-info">
              <div className="item-name">{cat.name}</div>
              <div className="item-type">{cat.type}</div>
            </div>
          </Card>
        ))}
      </div>
    </Layout>
  );
};

export default Categories;
