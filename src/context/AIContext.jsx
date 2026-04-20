import { createContext, useContext, useState, useCallback } from "react";
import { aiAPI } from "../services/api";

const AIContext = createContext();

export function AIProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const loadConversations = useCallback(async () => {
    try {
      const res = await aiAPI.listConversations();
      setConversations(res.data || []);
    } catch (e) { console.error("Failed to load conversations:", e); }
  }, []);

  const loadConversation = useCallback(async (id) => {
    try {
      setLoading(true);
      const res = await aiAPI.getConversation(id);
      setActiveConversation(res);
      setMessages(res.messages || []);
    } catch (e) { console.error("Failed to load conversation:", e); }
    finally { setLoading(false); }
  }, []);

  const createConversation = useCallback(async (contextType, title) => {
    try {
      const res = await aiAPI.createConversation({ context_type: contextType, title });
      setConversations(prev => [res, ...prev]);
      setActiveConversation(res);
      setMessages([]);
      return res;
    } catch (e) { console.error("Failed to create conversation:", e); return null; }
  }, []);

  const sendMessage = useCallback(async (conversationId, message) => {
    try {
      setSending(true);
      setMessages(prev => [...prev, { role: "user", content: message, created_at: new Date().toISOString() }]);
      const res = await aiAPI.sendMessage(conversationId, message);
      setMessages(prev => [...prev, { role: "assistant", content: res.content, tokens_used: res.tokens_used, created_at: new Date().toISOString() }]);
      return res;
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: `⚠️ Error: ${e.message || "Failed to get response"}`, created_at: new Date().toISOString() }]);
      return null;
    } finally { setSending(false); }
  }, []);

  const archiveConversation = useCallback(async (id) => {
    try {
      await aiAPI.archiveConversation(id);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (activeConversation?.id === id) { setActiveConversation(null); setMessages([]); }
    } catch (e) { console.error("Failed to archive:", e); }
  }, [activeConversation]);

  const loadInsights = useCallback(async (params) => {
    try {
      const res = await aiAPI.listInsights(params);
      setInsights(res.data || []);
    } catch (e) { console.error("Failed to load insights:", e); }
  }, []);

  const updateInsightStatus = useCallback(async (id, status) => {
    try {
      const res = await aiAPI.updateInsight(id, { status });
      setInsights(prev => prev.map(i => i.id === id ? res : i));
    } catch (e) { console.error("Failed to update insight:", e); }
  }, []);

  return (
    <AIContext.Provider value={{
      conversations, activeConversation, messages, insights,
      loading, sending,
      loadConversations, loadConversation, createConversation,
      sendMessage, archiveConversation, setActiveConversation,
      loadInsights, updateInsightStatus,
    }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const ctx = useContext(AIContext);
  if (!ctx) throw new Error("useAI must be used within AIProvider");
  return ctx;
}

export default AIContext;
