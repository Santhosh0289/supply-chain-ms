import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { Plus } from "lucide-react";
import usePaginatedFetch from "../hooks/usePaginatedFetch";
import FilterBar from "../components/FilterBar";
import Pagination from "../components/Pagination";

const statusColors = { pending:"warning", confirmed:"active", packed:"active", dispatched:"transit", delivered:"delivered", cancelled:"cancelled" };

const filterDefs = [
  { key:"search", placeholder:"Search customer name / email", type:"text" },
  { key:"status", placeholder:"All statuses", type:"select", options:[
    {value:"pending",    label:"Pending"},
    {value:"confirmed",  label:"Confirmed"},
    {value:"packed",     label:"Packed"},
    {value:"dispatched", label:"Dispatched"},
    {value:"delivered",  label:"Delivered"},
    {value:"cancelled",  label:"Cancelled"},
  ]},
];

const Orders = () => {
  const { data:orders, meta, loading, load, nextPage, prevPage, currentPage, hasPrev, hasNext } =
    usePaginatedFetch("/orders/", 10);

  const [filterVals, setFilterVals] = useState({});
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm] = useState({
    customer_name:"", customer_email:"", customer_address:"",
    items:[{ product_id:"", product_name:"", quantity:1, unit_price:0 }]
  });

  useEffect(() => { load(); }, []);

  const handleFilterChange = (key, val) => setFilterVals(prev => ({...prev, [key]: val}));
  const handleSearch = () => load(filterVals);
  const handleReset  = () => { setFilterVals({}); load({}); };

  const addItem    = () => setForm({...form, items:[...form.items, {product_id:"",product_name:"",quantity:1,unit_price:0}]});
  const updateItem = (i, field, value) => { const items=[...form.items]; items[i][field]=value; setForm({...form,items}); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {...form, items:form.items.map(it=>({...it,quantity:Number(it.quantity),unit_price:Number(it.unit_price)}))};
      await api.post("/orders/", payload); toast.success("Order created");
      setShowForm(false); load(filterVals);
    } catch { toast.error("Failed to create order"); }
  };

  const updateStatus = async (id, status) => {
    await api.patch(`/orders/${id}/status`, {status}); toast.success("Status updated"); load(filterVals);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">End-to-end order lifecycle management</p>
        </div>
        <div className="page-actions">
          <button className="btn-primary" onClick={()=>setShowForm(true)}><Plus size={15}/> New Order</button>
        </div>
      </div>

      <FilterBar filters={filterDefs} values={filterVals} onChange={handleFilterChange} onSearch={handleSearch} onReset={handleReset}/>

      {showForm && (
        <div className="form-card">
          <div className="form-card-header">
            <span className="form-card-title">New Order</span>
            <button className="btn-secondary" onClick={()=>setShowForm(false)}>Cancel</button>
          </div>
          <form onSubmit={handleSubmit} className="grid-form">
            <div className="form-field"><label className="form-label">Customer Name</label><input className="form-input" placeholder="e.g. John Smith" value={form.customer_name} onChange={e=>setForm({...form,customer_name:e.target.value})} required/></div>
            <div className="form-field"><label className="form-label">Customer Email</label><input className="form-input" placeholder="john@example.com" value={form.customer_email} onChange={e=>setForm({...form,customer_email:e.target.value})} required/></div>
            <div className="form-field"><label className="form-label">Delivery Address</label><input className="form-input" placeholder="123 Main St, City, ZIP" value={form.customer_address} onChange={e=>setForm({...form,customer_address:e.target.value})} required/></div>
            <div className="items-section">
              <h4>Order Items</h4>
              {form.items.map((item,i)=>(
                <div key={i} className="order-item-row">
                  <input className="form-input" placeholder="Product ID" value={item.product_id} onChange={e=>updateItem(i,"product_id",e.target.value)}/>
                  <input className="form-input" placeholder="Product Name" value={item.product_name} onChange={e=>updateItem(i,"product_name",e.target.value)}/>
                  <input className="form-input" placeholder="Qty" type="number" value={item.quantity} onChange={e=>updateItem(i,"quantity",e.target.value)}/>
                  <input className="form-input" placeholder="Unit Price" type="number" value={item.unit_price} onChange={e=>updateItem(i,"unit_price",e.target.value)}/>
                </div>
              ))}
              <button type="button" className="btn-secondary" onClick={addItem}>+ Add Item</button>
            </div>
            <div className="form-actions"><button type="submit" className="btn-primary">Place Order</button></div>
          </form>
        </div>
      )}

      <div className="table-wrapper">
        <table className="data-table">
          <thead><tr><th>Customer</th><th>Email</th><th>Total</th><th>Status</th><th>Date</th><th>Update Status</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={6}><div className="table-empty"><div className="table-empty-icon">⏳</div><p>Loading orders...</p></div></td></tr>}
            {!loading && orders.length === 0 && <tr><td colSpan={6}><div className="table-empty"><div className="table-empty-icon">🛒</div><p>No orders found</p></div></td></tr>}
            {!loading && orders.map(o=>(
              <tr key={o.id}>
                <td><strong>{o.customer_name}</strong></td>
                <td>{o.customer_email}</td>
                <td>₹{o.total_amount?.toFixed(2)}</td>
                <td><span className={`badge badge-${statusColors[o.status]}`}>{o.status}</span></td>
                <td>{o.created_at ? new Date(o.created_at).toLocaleDateString() : "—"}</td>
                <td>
                  <select className="status-select" defaultValue={o.status} onChange={e=>updateStatus(o.id,e.target.value)}>
                    {["pending","confirmed","packed","dispatched","delivered","cancelled"].map(s=>(
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
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

export default Orders;