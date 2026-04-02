import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { Plus, Trash2, Pencil } from "lucide-react";
import usePaginatedFetch from "../hooks/usePaginatedFetch";
import FilterBar from "../components/FilterBar";
import Pagination from "../components/Pagination";

const empty = { name:"", contact_email:"", phone:"", address:"", category:"", status:"active" };

const filterDefs = [
  { key:"search",   placeholder:"Search by name",     type:"text" },
  { key:"category", placeholder:"Filter by category", type:"text" },
  { key:"status",   placeholder:"All statuses",        type:"select", options:[
    {value:"active",      label:"Active"},
    {value:"inactive",    label:"Inactive"},
    {value:"blacklisted", label:"Blacklisted"},
  ]},
];

const Suppliers = () => {
  const { data:suppliers, meta, loading, load, nextPage, prevPage, currentPage, hasPrev, hasNext } =
    usePaginatedFetch("/suppliers/", 10);

  const [filterVals, setFilterVals] = useState({});
  const [form, setForm]             = useState(empty);
  const [editId, setEditId]         = useState(null);
  const [showForm, setShowForm]     = useState(false);

  useEffect(() => { load(); }, []);

  const handleFilterChange = (key, val) => setFilterVals(prev => ({...prev, [key]: val}));
  const handleSearch  = () => load(filterVals);
  const handleReset   = () => { setFilterVals({}); load({}); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) { await api.put(`/suppliers/${editId}`, form); toast.success("Supplier updated"); }
      else        { await api.post("/suppliers/", form);          toast.success("Supplier added");   }
      setForm(empty); setEditId(null); setShowForm(false); load(filterVals);
    } catch { toast.error("Failed to save supplier"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this supplier?")) return;
    await api.delete(`/suppliers/${id}`);
    toast.success("Deleted"); load(filterVals);
  };

  const handleEdit = (s) => {
    setForm({ name:s.name, contact_email:s.contact_email, phone:s.phone, address:s.address, category:s.category, status:s.status });
    setEditId(s.id); setShowForm(true);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Suppliers</h1>
          <p className="page-subtitle">Manage your supplier network and procurement contacts</p>
        </div>
        <div className="page-actions">
          <button className="btn-primary" onClick={() => { setForm(empty); setEditId(null); setShowForm(true); }}>
            <Plus size={15}/> Add Supplier
          </button>
        </div>
      </div>

      <FilterBar
        filters={filterDefs}
        values={filterVals}
        onChange={handleFilterChange}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      {showForm && (
        <div className="form-card">
          <div className="form-card-header">
            <span className="form-card-title">{editId ? "Edit Supplier" : "New Supplier"}</span>
            <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
          <form onSubmit={handleSubmit} className="grid-form">
            <div className="form-field"><label className="form-label">Name</label><input className="form-input" placeholder="e.g. Acme Corp" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></div>
            <div className="form-field"><label className="form-label">Contact Email</label><input className="form-input" placeholder="contact@supplier.com" value={form.contact_email} onChange={e=>setForm({...form,contact_email:e.target.value})} required/></div>
            <div className="form-field"><label className="form-label">Phone</label><input className="form-input" placeholder="+1 555 000 0000" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} required/></div>
            <div className="form-field"><label className="form-label">Address</label><input className="form-input" placeholder="123 Supply St, City" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} required/></div>
            <div className="form-field"><label className="form-label">Category</label><input className="form-input" placeholder="e.g. Electronics, Textiles" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} required/></div>
            <div className="form-field">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="blacklisted">Blacklisted</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Save Supplier</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-wrapper">
        <table className="data-table">
          <thead><tr>
            <th>Name</th><th>Email</th><th>Phone</th><th>Category</th><th>Status</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {loading && <tr><td colSpan={6}><div className="table-empty"><div className="table-empty-icon">⏳</div><p>Loading suppliers...</p></div></td></tr>}
            {!loading && suppliers.length === 0 && <tr><td colSpan={6}><div className="table-empty"><div className="table-empty-icon">🏭</div><p>No suppliers found</p></div></td></tr>}
            {!loading && suppliers.map(s => (
              <tr key={s.id}>
                <td><strong>{s.name}</strong></td>
                <td>{s.contact_email}</td>
                <td>{s.phone}</td>
                <td>{s.category}</td>
                <td><span className={`badge badge-${s.status}`}>{s.status}</span></td>
                <td><div className="actions">
                  <button className="icon-btn" onClick={()=>handleEdit(s)}><Pencil size={14}/></button>
                  <button className="icon-btn danger" onClick={()=>handleDelete(s.id)}><Trash2 size={14}/></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination currentPage={currentPage} hasPrev={hasPrev} hasNext={hasNext}
          onPrev={prevPage} onNext={nextPage} count={meta?.count} loading={loading}/>
      </div>
    </div>
  );
};

export default Suppliers;