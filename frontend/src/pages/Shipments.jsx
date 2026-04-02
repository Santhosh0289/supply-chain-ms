import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { Plus } from "lucide-react";
import usePaginatedFetch from "../hooks/usePaginatedFetch";
import FilterBar from "../components/FilterBar";
import Pagination from "../components/Pagination";

const empty = { order_id:"", carrier_name:"", tracking_number:"", estimated_delivery:"" };

const filterDefs = [
  { key:"search",  placeholder:"Search by tracking # or order ID", type:"text" },
  { key:"carrier", placeholder:"Filter by carrier",                type:"text" },
  { key:"status",  placeholder:"All statuses", type:"select", options:[
    {value:"pending",          label:"Pending"},
    {value:"in_transit",       label:"In Transit"},
    {value:"out_for_delivery", label:"Out for Delivery"},
    {value:"delivered",        label:"Delivered"},
    {value:"returned",         label:"Returned"},
  ]},
];

const Shipments = () => {
  const { data:shipments, meta, loading, load, nextPage, prevPage, currentPage, hasPrev, hasNext } =
    usePaginatedFetch("/shipments/", 10);

  const [filterVals, setFilterVals] = useState({});
  const [form, setForm]             = useState(empty);
  const [showForm, setShowForm]     = useState(false);

  useEffect(() => { load(); }, []);

  const handleFilterChange = (key, val) => setFilterVals(prev => ({...prev, [key]: val}));
  const handleSearch = () => load(filterVals);
  const handleReset  = () => { setFilterVals({}); load({}); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/shipments/", form); toast.success("Shipment created");
      setForm(empty); setShowForm(false); load(filterVals);
    } catch (err) { toast.error(err.response?.data?.detail || "Failed"); }
  };

  const updateStatus = async (id, status) => {
    await api.patch(`/shipments/${id}/status`, {status}); toast.success("Status updated"); load(filterVals);
  };

  const statusColor = { pending:"warning", in_transit:"transit", out_for_delivery:"transit", delivered:"delivered", returned:"inactive" };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Shipments</h1>
          <p className="page-subtitle">Track carriers, delivery status and returns</p>
        </div>
        <div className="page-actions">
          <button className="btn-primary" onClick={()=>setShowForm(true)}><Plus size={15}/> New Shipment</button>
        </div>
      </div>

      <FilterBar filters={filterDefs} values={filterVals} onChange={handleFilterChange} onSearch={handleSearch} onReset={handleReset}/>

      {showForm && (
        <div className="form-card">
          <div className="form-card-header">
            <span className="form-card-title">New Shipment</span>
            <button className="btn-secondary" onClick={()=>setShowForm(false)}>Cancel</button>
          </div>
          <form onSubmit={handleSubmit} className="grid-form">
            <div className="form-field"><label className="form-label">Order ID</label><input className="form-input" placeholder="MongoDB ObjectId of order" value={form.order_id} onChange={e=>setForm({...form,order_id:e.target.value})} required/></div>
            <div className="form-field"><label className="form-label">Carrier Name</label><input className="form-input" placeholder="e.g. FedEx, DHL, UPS" value={form.carrier_name} onChange={e=>setForm({...form,carrier_name:e.target.value})} required/></div>
            <div className="form-field"><label className="form-label">Tracking Number</label><input className="form-input" placeholder="e.g. 1Z999AA10123456784" value={form.tracking_number} onChange={e=>setForm({...form,tracking_number:e.target.value})} required/></div>
            <div className="form-field"><label className="form-label">Estimated Delivery</label><input className="form-input" type="date" value={form.estimated_delivery} onChange={e=>setForm({...form,estimated_delivery:e.target.value})} required/></div>
            <div className="form-actions"><button type="submit" className="btn-primary">Create Shipment</button></div>
          </form>
        </div>
      )}

      <div className="table-wrapper">
        <table className="data-table">
          <thead><tr><th>Order ID</th><th>Carrier</th><th>Tracking #</th><th>Est. Delivery</th><th>Status</th><th>Update</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={6}><div className="table-empty"><div className="table-empty-icon">⏳</div><p>Loading shipments...</p></div></td></tr>}
            {!loading && shipments.length === 0 && <tr><td colSpan={6}><div className="table-empty"><div className="table-empty-icon">🚚</div><p>No shipments found</p></div></td></tr>}
            {!loading && shipments.map(s=>(
              <tr key={s.id}>
                <td><code style={{fontSize:"0.75rem",color:"var(--text-muted)"}}>{s.order_id}</code></td>
                <td>{s.carrier_name}</td>
                <td><code style={{fontSize:"0.75rem",color:"var(--text-muted)"}}>{s.tracking_number}</code></td>
                <td>{s.estimated_delivery}</td>
                <td><span className={`badge badge-${statusColor[s.status] ?? "warning"}`}>{s.status?.replace(/_/g," ")}</span></td>
                <td>
                  <select className="status-select" defaultValue={s.status} onChange={e=>updateStatus(s.id,e.target.value)}>
                    {["pending","in_transit","out_for_delivery","delivered","returned"].map(st=>(
                      <option key={st} value={st}>{st.replace(/_/g," ")}</option>
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

export default Shipments;