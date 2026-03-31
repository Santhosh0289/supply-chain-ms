import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { Plus, Trash2, Pencil } from "lucide-react";

const empty = { name:"", contact_email:"", phone:"", address:"", category:"", status:"active" };

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm]           = useState(empty);
  const [editId, setEditId]       = useState(null);
  const [showForm, setShowForm]   = useState(false);

  const fetchAll = async () => {
    const res = await api.get("/suppliers/");
    setSuppliers(res.data);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/suppliers/${editId}`, form);
        toast.success("Supplier updated");
      } else {
        await api.post("/suppliers/", form);
        toast.success("Supplier added");
      }
      setForm(empty); setEditId(null); setShowForm(false); fetchAll();
    } catch { toast.error("Failed to save supplier"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this supplier?")) return;
    await api.delete(`/suppliers/${id}`);
    toast.success("Deleted"); fetchAll();
  };

  const handleEdit = (s) => {
    setForm({ name:s.name, contact_email:s.contact_email, phone:s.phone,
              address:s.address, category:s.category, status:s.status });
    setEditId(s.id); setShowForm(true);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Suppliers</h1>
        <button className="btn-primary" onClick={() => { setForm(empty); setEditId(null); setShowForm(true); }}>
          <Plus size={16}/> Add Supplier
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h3>{editId ? "Edit Supplier" : "New Supplier"}</h3>
          <form onSubmit={handleSubmit} className="grid-form">
            <input placeholder=" Name"          value={form.name}          onChange={e=>setForm({...form,name:e.target.value})} required/>
            <input placeholder=" Email"         value={form.contact_email} onChange={e=>setForm({...form,contact_email:e.target.value})} required/>
            <input placeholder=" Phone"         value={form.phone}         onChange={e=>setForm({...form,phone:e.target.value})} required/>
            <input placeholder=" Address"       value={form.address}       onChange={e=>setForm({...form,address:e.target.value})} required/>
            <input placeholder=" Category"      value={form.category}      onChange={e=>setForm({...form,category:e.target.value})} required/>
            <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blacklisted">Blacklisted</option>
            </select>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Save</button>
              <button type="button" className="btn-secondary" onClick={()=>setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Phone</th><th>Category</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {suppliers.map(s => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.contact_email}</td>
                <td>{s.phone}</td>
                <td>{s.category}</td>
                <td><span className={`badge badge-${s.status}`}>{s.status}</span></td>
                <td className="actions">
                  <button className="icon-btn" onClick={()=>handleEdit(s)}><Pencil size={15}/></button>
                  <button className="icon-btn danger" onClick={()=>handleDelete(s.id)}><Trash2 size={15}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Suppliers;