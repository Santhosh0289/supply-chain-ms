import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ currentPage, hasPrev, hasNext, onPrev, onNext, count, loading }) => (
  <div className="pagination-bar">
    <span className="pagination-info">
      {loading ? "Loading..." : `Page ${currentPage} · ${count ?? 0} results`}
    </span>
    <div className="pagination-controls">
      <button
        className="pag-btn"
        onClick={onPrev}
        disabled={!hasPrev || loading}
      >
        <ChevronLeft size={16}/> Previous
      </button>
      <span className="pag-page">{currentPage}</span>
      <button
        className="pag-btn"
        onClick={onNext}
        disabled={!hasNext || loading}
      >
        Next <ChevronRight size={16}/>
      </button>
    </div>
  </div>
);

export default Pagination;