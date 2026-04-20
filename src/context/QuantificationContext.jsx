import { createContext, useContext, useState, useCallback } from "react";
import { quantificationAPI } from "../services/api";

const QuantificationContext = createContext();

export function QuantificationProvider({ children }) {
  const [quantifiedRisks, setQuantifiedRisks] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadQuantified = useCallback(async () => {
    try {
      setLoading(true);
      const res = await quantificationAPI.list();
      setQuantifiedRisks(res.data || []);
    } catch (e) { console.error("Failed to load quantified risks:", e); }
    finally { setLoading(false); }
  }, []);

  const runSimulation = useCallback(async (riskId, data) => {
    try {
      setLoading(true);
      const res = await quantificationAPI.simulate(riskId, data);
      setSimulationResult(res);
      // Refresh list
      const list = await quantificationAPI.list();
      setQuantifiedRisks(list.data || []);
      return res;
    } catch (e) { console.error("Failed to simulate:", e); return null; }
    finally { setLoading(false); }
  }, []);

  const loadPortfolio = useCallback(async (year) => {
    try {
      setLoading(true);
      const res = await quantificationAPI.getPortfolio(year);
      setPortfolio(res);
    } catch (e) { console.error("Failed to load portfolio:", e); setPortfolio(null); }
    finally { setLoading(false); }
  }, []);

  const runPortfolio = useCallback(async (year) => {
    try {
      setLoading(true);
      const res = await quantificationAPI.runPortfolio(year);
      setPortfolio(res);
      return res;
    } catch (e) { console.error("Failed to run portfolio:", e); return null; }
    finally { setLoading(false); }
  }, []);

  return (
    <QuantificationContext.Provider value={{
      quantifiedRisks, portfolio, simulationResult, loading,
      loadQuantified, runSimulation, loadPortfolio, runPortfolio,
      setSimulationResult,
    }}>
      {children}
    </QuantificationContext.Provider>
  );
}

export function useQuantification() {
  const ctx = useContext(QuantificationContext);
  if (!ctx) throw new Error("useQuantification must be used within QuantificationProvider");
  return ctx;
}

export default QuantificationContext;
