import { createContext, useContext, type Dispatch } from "react";
import type { QueryAction } from "./queryReducer";

export const QueryDispatchContext = createContext<Dispatch<QueryAction> | null>(
  null
);

export function useQueryDispatch() {
  const dispatch = useContext(QueryDispatchContext);
  if (!dispatch) {
    throw new Error(
      "useQueryDispatch must be used inside QueryDispatchContext"
    );
  }
  return dispatch;
}
