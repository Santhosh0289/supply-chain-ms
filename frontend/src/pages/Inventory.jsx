import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { Plus, Trash2, Pencil, AlertTriangle } from "lucide-react";
import usePaginatedFetch from "../hooks/usePaginatedFetch";
import FilterBar from "../components/FilterBar";
import Pagination from "../components/Pagination";

const empty = { product_name:"", sku:"", quantity:0, unit_price:0, warehouse_location:"", supplier_id:"", low_stock_threshold:10 };

const filterDefs = [
  { key:"search",   placeholder:"Search product name", type:"text" },
  { key:"sku",      placeholder:"Filter by SKU",       type:"text" },
  { key:"location", placeholder:"Warehouse location",  type:"text" },
  { key:"low_stock",placeholder:"Stock level",          type:"select", options:[
    {value:"true", label:"Low Stock Only"},
  ]},
];

const Inventory = () => {
  const { data:items, meta, loading, load, nextPage, prevPage, currentPage, hasPrev, hasNext } =
    usePaginatedFetch("/inventory/", 10);

  const [filterVals, setFilterVals] = useState({});
  const [form, setForm]             = useState(empty);
  const [editId, setEditId]         = useState(null);
  const [showForm, setShowForm]     = useState(false);

  useEffect(() => { load(); }, []);

  const handleFilterChange = (key, val) => setFilterVals(prev => ({...prev, [key]: val}));
  const handleSearch = () => load(filterVals);
  const handleReset  = () => { setFilterVals({}); load({}); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {...form, quantity:Number(form.quantity), unit_price:Number(form.unit_price), low_stock_threshold:Number(form.low_stock_threshold)};
      if (editId) { await api.put(`/inventory/${editId}`, payload); toast.success("Item updated"); }
      else        { await api.post("/inventory/", payload);          toast.success("Item added");   }
      setForm(empty); setEditId(null); setShowForm(false); load(filterVals);
    } catch (err) { toast.error(err.response?.data?.detail || "Failed"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this item?")) return;
    await api.delete(`/inventory/${id}`); toast.success("Deleted"); load(filterVals);
  };

  const handleEdit = (item) => {
    setForm({ product_name:item.product_name, sku:item.sku, quantity:item.quantity,
      unit_price:item.unit_price, warehouse_location:item.warehouse_location,
      supplier_id:item.supplier_id, low_stock_threshold:item.low_stock_threshold });
    setEditId(item.id); setShowForm(true);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">Track stock levels across all warehouse locations</p>
        </div>
        <div className="page-actions">
          <button className="btn-primary" onClick={() => { setForm(empty); setEditId(null); setShowForm(true); }}>
            <Plus size={15}/> Add Item
          </button>
        </div>
      </div>

      <FilterBar filters={filterDefs} values={filterVals} onChange={handleFilterChange} onSearch={handleSearch} onReset={handleReset}/>

      {showForm && (
        <div className="form-card">
          <div className="form-card-header">
            <span className="form-card-title">{editId ? "Edit Item" : "New Inventory Item"}</span>
            <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
          <form onSubmit={handleSubmit} className="grid-form">
            <div className="form-field"><label className="form-label">Product Name</label><input className="form-input" placeholder="e.g. USB-C Cable 2m" value={form.product_name} onChange={e=>setForm({...form,product_name:e.target.value})} required/></div>
            <div className="form-field"><label className="form-label">SKU</label><input className="form-input" placeholder="e.g. USB-C-2M-BLK" value={form.sku} onChange={e=>setForm({...form,sku:e.target.value})} required/></div>
            <div className="form-field"><label className="form-label">Quantity</label><input className="form-input" type="number" placeholder="0" value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})} required/></div>
            <div className="form-field"><label className="form-label">Unit Price (₹)</label><input className="form-input" type="number" step="0.01" placeholder="0.00" value={form.unit_price} onChange={e=>setForm({...form,unit_price:e.target.value})} required/></div>
            <div className="form-field"><label className="form-label">Warehouse Location</label><input className="form-input" placeholder="e.g. Warehouse A - Bay 3" value={form.warehouse_location} onChange={e=>setForm({...form,warehouse_location:e.target.value})} required/></div>
            <div className="form-field"><label className="form-label">Supplier ID</label><input className="form-input" placeholder="MongoDB ObjectId of supplier" value={form.supplier_id} onChange={e=>setForm({...form,supplier_id:e.target.value})} required/></div>
            <div className="form-field"><label className="form-label">Low Stock Threshold</label><input className="form-input" type="number" placeholder="10" value={form.low_stock_threshold} onChange={e=>setForm({...form,low_stock_threshold:e.target.value})}/></div>
            <div className="form-actions"><button type="submit" className="btn-primary">Save Item</button></div>
          </form>
        </div>
      )}

      <div className="table-wrapper">
        <table className="data-table">
          <thead><tr><th>Product</th><th>SKU</th><th>Qty</th><th>Price</th><th>Location</th><th>Stock</th><th>Actions</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={7}><div className="table-empty"><div className="table-empty-icon">⏳</div><p>Loading inventory...</p></div></td></tr>}
            {!loading && items.length === 0 && <tr><td colSpan={7}><div className="table-empty"><div className="table-empty-icon">📦</div><p>No items found</p></div></td></tr>}
            {!loading && items.map(item => (
              <tr key={item.id}>
                <td><strong>{item.product_name}</strong></td>
                <td><code style={{fontSize:"0.75rem", color:"var(--text-muted)"}}>{item.sku}</code></td>
                <td>{item.quantity}</td>
                <td>₹{item.unit_price}</td>
                <td>{item.warehouse_location}</td>
                <td>
                  {item.is_low_stock
                    ? <span className="badge badge-inactive"><AlertTriangle size={11}/> Low</span>
                    : <span className="badge badge-active">OK</span>}
                </td>
                <td><div className="actions">
                  <button className="icon-btn" onClick={()=>handleEdit(item)}><Pencil size={14}/></button>
                  <button className="icon-btn danger" onClick={()=>handleDelete(item.id)}><Trash2 size={14}/></button>
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

export default Inventory;