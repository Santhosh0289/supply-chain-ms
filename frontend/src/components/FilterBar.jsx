import { Search } from "lucide-react";

/**
 * Generic filter bar.
 * filters = [{ key, placeholder, type: "text"|"select", options: [{value,label}] }]
 */
const FilterBar = ({ filters, values, onChange, onSearch, onReset }) => (
  <div className="filter-bar">
    {filters.map(f => (
      f.type === "select" ? (
        <select
          key={f.key}
          className="filter-select"
          value={values[f.key] ?? ""}
          onChange={e => onChange(f.key, e.target.value)}
        >
          <option value="">{f.placeholder}</option>
          {f.options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ) : (
        <div key={f.key} className="filter-search-wrap">
          <Search size={14} className="filter-search-icon"/>
          <input
            className="filter-input"
            placeholder={f.placeholder}
            value={values[f.key] ?? ""}
            onChange={e => onChange(f.key, e.target.value)}
            onKeyDown={e => e.key === "Enter" && onSearch()}
          />
        </div>
      )
    ))}
    <button className="btn-primary" onClick={onSearch}>Search</button>
    <button className="btn-secondary" onClick={onReset}>Reset</button>
  </div>
);

export default FilterBar;