import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { Plus } from "lucide-react";

const empty = { order_id:"", carrier_name:"", tracking_number:"", estimated_delivery:"" };

const Shipments = () => {
  const [shipments, setShipments] = useState([]);
  const [form, setForm]           = useState(empty);
  const [showForm, setShowForm]   = useState(false);

  const fetchAll = async () => {
    const res = await api.get("/shipments/");
    setShipments(res.data);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/shipments/", form);
      toast.success("Shipment created");
      setForm(empty); setShowForm(false); fetchAll();
    } catch (err) { toast.error(err.response?.data?.detail || "Failed"); }
  };

  const updateStatus = async (id, status) => {
    await api.patch(`/shipments/${id}/status`, { status });
    toast.success("Status updated"); fetchAll();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Shipments</h1>
        <button className="btn-primary" onClick={()=>setShowForm(true)}>
          <Plus size={16}/> New Shipment
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h3>New Shipment</h3>
          <form onSubmit={handleSubmit} className="grid-form">
            <input placeholder=" Order ID"          value={form.order_id}          onChange={e=>setForm({...form,order_id:e.target.value})} required/>
            <input placeholder=" Carrier Name"      value={form.carrier_name}      onChange={e=>setForm({...form,carrier_name:e.target.value})} required/>
            <input placeholder=" Tracking Number"   value={form.tracking_number}   onChange={e=>setForm({...form,tracking_number:e.target.value})} required/>
            <input placeholder=" Estimated Delivery" type="date" value={form.estimated_delivery} onChange={e=>setForm({...form,estimated_delivery:e.target.value})} required/>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Create</button>
              <button type="button" className="btn-secondary" onClick={()=>setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr><th>Order ID</th><th>Carrier</th><th>Tracking</th><th>Est. Delivery</th><th>Status</th><th>Update</th></tr>
          </thead>
          <tbody>
            {shipments.map(s => (
              <tr key={s.id}>
                <td>{s.order_id}</td>
                <td>{s.carrier_name}</td>
                <td>{s.tracking_number}</td>
                <td>{s.estimated_delivery}</td>
                <td><span className={`badge badge-active`}>{s.status}</span></td>
                <td>
                  <select defaultValue={s.status} onChange={e=>updateStatus(s.id,e.target.value)} className="status-select">
                    {["pending","in_transit","out_for_delivery","delivered","returned"].map(st=>(
                      <option key={st} value={st}>{st}</option>
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

export default Shipments;