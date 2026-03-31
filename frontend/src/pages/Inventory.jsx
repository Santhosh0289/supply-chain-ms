import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { Plus, Trash2, Pencil, AlertTriangle } from "lucide-react";

const empty = { product_name:"", sku:"", quantity:0, unit_price:0, warehouse_location:"", supplier_id:"", low_stock_threshold:10 };

const Inventory = () => {
  const [items, setItems]       = useState([]);
  const [form, setForm]         = useState(empty);
  const [editId, setEditId]     = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchAll = async () => {
    const res = await api.get("/inventory/");
    setItems(res.data);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, quantity: Number(form.quantity), unit_price: Number(form.unit_price), low_stock_threshold: Number(form.low_stock_threshold) };
      if (editId) {
        await api.put(`/inventory/${editId}`, payload);
        toast.success("Item updated");
      } else {
        await api.post("/inventory/", payload);
        toast.success("Item added");
      }
      setForm(empty); setEditId(null); setShowForm(false); fetchAll();
    } catch (err) { toast.error(err.response?.data?.detail || "Failed to save"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this item?")) return;
    await api.delete(`/inventory/${id}`);
    toast.success("Deleted"); fetchAll();
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
        <h1>Inventory</h1>
        <button className="btn-primary" onClick={() => { setForm(empty); setEditId(null); setShowForm(true); }}>
          <Plus size={16}/> Add Item
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h3>{editId ? "Edit Item" : "New Item"}</h3>
          <form onSubmit={handleSubmit} className="grid-form">
            <input placeholder=" Product Name"       value={form.product_name}       onChange={e=>setForm({...form,product_name:e.target.value})} required/>
            <input placeholder=" SKU"                value={form.sku}                onChange={e=>setForm({...form,sku:e.target.value})} required/>
            <input placeholder=" Quantity"  type="number" value={form.quantity}      onChange={e=>setForm({...form,quantity:e.target.value})} required/>
            <input placeholder=" Unit Price" type="number" step="0.01" value={form.unit_price} onChange={e=>setForm({...form,unit_price:e.target.value})} required/>
            <input placeholder=" Warehouse Location" value={form.warehouse_location} onChange={e=>setForm({...form,warehouse_location:e.target.value})} required/>
            <input placeholder=" Supplier ID"        value={form.supplier_id}        onChange={e=>setForm({...form,supplier_id:e.target.value})} required/>
            <input placeholder=" Low Stock Threshold" type="number" value={form.low_stock_threshold} onChange={e=>setForm({...form,low_stock_threshold:e.target.value})}/>
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
            <tr><th>Product</th><th>SKU</th><th>Qty</th><th>Price</th><th>Location</th><th>Stock</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>{item.product_name}</td>
                <td>{item.sku}</td>
                <td>{item.quantity}</td>
                <td>${item.unit_price}</td>
                <td>{item.warehouse_location}</td>
                <td>
                  {item.is_low_stock
                    ? <span className="badge badge-inactive"><AlertTriangle size={12}/> Low</span>
                    : <span className="badge badge-active">OK</span>}
                </td>
                <td className="actions">
                  <button className="icon-btn" onClick={()=>handleEdit(item)}><Pencil size={15}/></button>
                  <button className="icon-btn danger" onClick={()=>handleDelete(item.id)}><Trash2 size={15}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;