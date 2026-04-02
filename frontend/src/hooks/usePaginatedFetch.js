import { useState, useCallback } from "react";
import api from "../api/axios";

/**
 * Generic hook for cursor-paginated API endpoints.
 * Keeps a stack of past cursors so "Previous" works correctly.
 */
const usePaginatedFetch = (endpoint, limit = 10) => {
  const [data,        setData]        = useState([]);
  const [meta,        setMeta]        = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [cursorStack, setCursorStack] = useState([null]); // stack of cursors, [null] = page 1
  const [filters,     setFilters]     = useState({});

  const fetch = useCallback(async (cursor, activeFilters) => {
    setLoading(true);
    try {
      const params = { limit, ...activeFilters };
      if (cursor) params.cursor = cursor;
      const res = await api.get(endpoint, { params });
      setData(res.data.data ?? res.data);
      setMeta(res.data.meta ?? null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, limit]);

  // Initial load / filter change — always resets to page 1
  const load = useCallback((newFilters = {}) => {
    setFilters(newFilters);
    setCursorStack([null]);
    fetch(null, newFilters);
  }, [fetch]);

  const nextPage = () => {
    if (!meta?.next_cursor) return;
    const newStack = [...cursorStack, meta.next_cursor];
    setCursorStack(newStack);
    fetch(meta.next_cursor, filters);
  };

  const prevPage = () => {
    if (cursorStack.length <= 1) return;
    const newStack = cursorStack.slice(0, -1);
    setCursorStack(newStack);
    fetch(newStack[newStack.length - 1], filters);
  };

  const currentPage = cursorStack.length;
  const hasPrev     = cursorStack.length > 1;
  const hasNext     = meta?.has_more ?? false;

  return { data, meta, loading, load, nextPage, prevPage, currentPage, hasPrev, hasNext, filters };
};

export default usePaginatedFetch;