import React, { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { Card, Button, Input } from "../components/Common";
import { payeeService } from "../services/payeeService";
import { useAuth } from "../store/AuthContext";
import { Plus, User } from "lucide-react";

const Payees = () => {
  const { user } = useAuth();
  const [payees, setPayees] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (user) {
      payeeService.getAll(user.id).then(setPayees);
    }
  }, [user]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const p = await payeeService.add(user.id, newName, "");
    setPayees([...payees, p]);
    setNewName("");
    setShowAdd(false);
  };

  return (
    <Layout>
      <div className="screen-header">
        <h1>Payees</h1>
        <Button onClick={() => setShowAdd(!showAdd)}>
          <Plus size={18} /> Add
        </Button>
      </div>

      {showAdd && (
        <Card className="form-card" style={{ marginBottom: "2rem" }}>
          <form onSubmit={handleAdd}>
            <Input
              label="Payee Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Starbucks"
              required
            />
            <Button type="submit" style={{ width: "100%" }}>
              Create Payee
            </Button>
          </form>
        </Card>
      )}

      <div className="items-grid">
        {payees.map((p) => (
          <Card key={p.id} className="item-card">
            <div className="item-icon-bg">
              <User size={20} color="var(--primary)" />
            </div>
            <div className="item-info">
              <div className="item-name">{p.name}</div>
            </div>
          </Card>
        ))}
      </div>
    </Layout>
  );
};

export default Payees;
