import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ChatBot from "c:/Users/harsh/OneDrive/Desktop/rb panchal final/rbp_frontend/src/components/Chatbot";

export default function ChatBotWrapper() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // hide chatbot on these routes
  const hiddenRoutes = ["/login", "/register"];

  // wait until auth state is resolved
  if (loading) return null;

  // not logged in → no chatbot
  if (!user) return null;

  // on login/register page → no chatbot
  if (hiddenRoutes.includes(location.pathname)) return null;

  return <ChatBot />;
}
