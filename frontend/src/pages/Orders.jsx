import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { Plus } from "lucide-react";

const statusColors = { pending:"warning", confirmed:"active", packed:"active",
                       dispatched:"active", delivered:"active", cancelled:"inactive" };

const Orders = () => {
  const [orders, setOrders]     = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    customer_name:"", customer_email:"", customer_address:"",
    items:[{ product_id:"", product_name:"", quantity:1, unit_price:0 }]
  });

  const fetchAll = async () => {
    const res = await api.get("/orders/");
    setOrders(res.data);
  };

  useEffect(() => { fetchAll(); }, []);

  const addItem = () => setForm({...form, items:[...form.items, { product_id:"", product_name:"", quantity:1, unit_price:0 }]});

  const updateItem = (i, field, value) => {
    const items = [...form.items];
    items[i][field] = value;
    setForm({...form, items});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, items: form.items.map(it=>({...it, quantity:Number(it.quantity), unit_price:Number(it.unit_price)})) };
      await api.post("/orders/", payload);
      toast.success("Order created");
      setShowForm(false);
      fetchAll();
    } catch { toast.error("Failed to create order"); }
  };

  const updateStatus = async (id, status) => {
    await api.patch(`/orders/${id}/status`, { status });
    toast.success("Status updated");
    fetchAll();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Orders</h1>
        <button className="btn-primary" onClick={()=>setShowForm(true)}>
          <Plus size={16}/> New Order
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h3>New Order</h3>
          <form onSubmit={handleSubmit} className="grid-form">
            <input placeholder=" Customer Name"    value={form.customer_name}    onChange={e=>setForm({...form,customer_name:e.target.value})} required/>
            <input placeholder=" Customer Email"   value={form.customer_email}   onChange={e=>setForm({...form,customer_email:e.target.value})} required/>
            <input placeholder=" Customer Address" value={form.customer_address} onChange={e=>setForm({...form,customer_address:e.target.value})} required/>
            <div className="items-section">
              <h4>Order Items</h4>
              {form.items.map((item, i) => (
                <div key={i} className="order-item-row">
                  <input placeholder=" Product ID"   value={item.product_id}   onChange={e=>updateItem(i,"product_id",e.target.value)}/>
                  <input placeholder=" Product Name" value={item.product_name} onChange={e=>updateItem(i,"product_name",e.target.value)}/>
                  <input placeholder=" Qty"  type="number" value={item.quantity}   onChange={e=>updateItem(i,"quantity",e.target.value)}/>
                  <input placeholder=" Price" type="number" value={item.unit_price} onChange={e=>updateItem(i,"unit_price",e.target.value)}/>
                </div>
              ))}
              <button type="button" className="btn-secondary" onClick={addItem}>+ Add Item</button>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Place Order</button>
              <button type="button" className="btn-secondary" onClick={()=>setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr><th>Customer</th><th>Email</th><th>Total</th><th>Status</th><th>Date</th><th>Update Status</th></tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td>{o.customer_name}</td>
                <td>{o.customer_email}</td>
                <td>${o.total_amount?.toFixed(2)}</td>
                <td><span className={`badge badge-${statusColors[o.status]}`}>{o.status}</span></td>
                <td>{new Date(o.created_at).toLocaleDateString()}</td>
                <td>
                  <select defaultValue={o.status} onChange={e=>updateStatus(o.id, e.target.value)} className="status-select">
                    {["pending","confirmed","packed","dispatched","delivered","cancelled"].map(s=>(
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;