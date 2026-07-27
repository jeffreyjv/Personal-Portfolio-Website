import { createContext, useContext } from "react";

/**
 * Context + hook live apart from the provider component so that file can export
 * only components — otherwise React Fast Refresh can't hot-reload it.
 */
export const PortfolioUIContext = createContext(null);

export function usePortfolioUI() {
  const ctx = useContext(PortfolioUIContext);
  if (!ctx) throw new Error("usePortfolioUI must be used within PortfolioUIProvider");
  return ctx;
}
