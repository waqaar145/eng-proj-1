import { useState } from "react";
import debounce from "lodash.debounce";
import { useCallback } from "react";

export default function usePagination() {
  let initial_state = {
    pageSize: 10,
    pageNo: 1,
    sort: "desc",
    q: "",
  };
  const [currentState, setCurrentState] = useState(initial_state);

  const handlePageChange = (page) => {
    setCurrentState({
      ...currentState,
      pageNo: page,
    });
  }

  const handleSearch = useCallback(debounce((data) => {
    setCurrentState({
      ...currentState,
      q: data,
    });
  }, 1000), []);

  return {
    currentState,
    setCurrentState,
    handlePageChange,
    handleSearch
  };
}