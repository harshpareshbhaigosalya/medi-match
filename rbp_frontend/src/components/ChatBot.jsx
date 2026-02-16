import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, X, Sparkles, Mic, Maximize2, Minimize2, Layout, ArrowRight } from "lucide-react";
import { http, apiUrl } from "../lib/http";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";


export default function ChatBot() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [pendingActions, setPendingActions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [listening, setListening] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const { user, token } = useAuth();

  // STREAMING AI MESSAGE -> Updated to JSON parsing
  async function sendMessage() {
    if (!input.trim() || loading) return;
    const text = input.trim().toLowerCase();
    // If user confirms a pending action (yes/y), execute it locally instead of sending to AI
    if ((text === "yes" || text === "y") && pendingActions.length > 0) {
      setMessages((prev) => [...prev, { role: "assistant", content: "✅ Done." }]);
      // execute pending actions
      for (const action of pendingActions) {
        if (action.type === "ADD_TO_CART") {
          for (const item of action.variants) {
            await http.post("/cart/add", { variant_id: item.variant_id, quantity: item.qty || 1 });
          }
          setMessages((prev) => [...prev, { role: "system", content: "🛒 Added items to your cart" }]);
        }
        if (action.type === "CLEAR_CART") {
          await http.post("/cart/clear");
          setMessages((prev) => [...prev, { role: "system", content: "✅ Cart cleared." }]);
        }
      }
      setPendingActions([]);
      setInput("");
      return;
    }

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setStatusText("Analyzing your request...");

    try {
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token} `;
      else if (localStorage.getItem("token")) headers.Authorization = `Bearer ${localStorage.getItem("token")} `;

      let baseUrl = apiUrl;
      // If apiUrl ends with /api, remove it to get root for /ai/chat if needed, OR just use it if /ai/chat is under /api.
      // Looking at app.py: app.register_blueprint(ai_bp)
      // We need to check ai_routes.py prefix.
      // Let's assume it's /ai or /api/ai.
      // Safest is to use the same logic as before but with apiUrl.
      const rootUrl = baseUrl.replace("/api", "").replace(/\/$/, "");
      const res = await fetch(`${rootUrl}/ai/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify({ message: userMsg.content, user_id: user?.id }),
      });

      const data = await res.json();
      setStatusText("Preparing results...");
      await new Promise(r => setTimeout(r, 600)); // Smooth transition

      // Add assistant message
      if (data.response || data.actions) {
        if (data.response) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: data.response },
          ]);
        }
      }

      // Handle actions if any
      if (data.actions) {
        handleActions(data.actions);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Oops! Something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // SYSTEM / ACTION MESSAGES
  async function handleActions(actions) {
    for (const action of actions) {
      if (action.type === "ADD_TO_CART") {
        if (action.confirm) {
          // queue for confirmation instead of immediate execution
          setPendingActions((prev) => [...prev, action]);
          setMessages((prev) => [...prev, { role: "system", content: "I can add these to your cart — reply 'yes' to confirm." }]);
        } else {
          setMessages((prev) => [
            ...prev,
            { role: "system", content: "🛒 Added items to your cart" },
          ]);
          for (const item of action.variants) {
            await http.post("/cart/add", {
              variant_id: item.variant_id,
              quantity: item.qty || 1,
            });
          }
        }
      }

      if (action.type === "SHOW_PRODUCTS") {
        setMessages((prev) => [
          ...prev,
          { role: "products", products: action.products },
        ]);
      }

      if (action.type === "CLEAR_CART") {
        // respect confirmation flag
        if (action.confirm) {
          setPendingActions((prev) => [...prev, action]);
          setMessages((prev) => [...prev, { role: "system", content: "I can clear your cart — reply 'yes' to confirm." }]);
        } else {
          await http.post("/cart/clear");
          setMessages((prev) => [...prev, { role: "system", content: "✅ Cart cleared." }]);
        }
      }

      if (action.type === "SHOW_ORDERS") {
        setMessages((prev) => [...prev, { role: "orders", orders: action.orders }]);
      }

      if (action.type === "DOWNLOAD_QUOTE") {
        // Ask backend to create a quotation snapshot, then download the generated PDF
        try {
          const create = await http.post("/cart/quotation");
          const data = create.data;
          const quoteId = (data && data[0] && data[0].id) || (data && data.id);
          if (quoteId) {
            const res = await http.get(`/ cart / quotation / ${quoteId}/pdf`, { responseType: "blob" });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `quotation_${quoteId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
          } else {
            setMessages((prev) => [...prev, { role: "assistant", content: "Couldn't generate quotation." }]);
          }
        } catch (err) {
          console.error(err);
          setMessages((prev) => [...prev, { role: "assistant", content: "Failed to create/download quotation." }]);
        }
      }

      if (action.type === "DOWNLOAD_ORDER_INVOICE") {
        const res = await http.get(`/cart/order/${action.order_id}/invoice`, { responseType: "blob" });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `invoice_${action.order_id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      }

      if (action.type === "SUGGEST_CHIPS") {
        setMessages((prev) => [...prev, { role: "chips", chips: action.chips }]);
      }
    }
  }

  // VOICE INPUT
  function startVoice() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Voice not supported");

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();
    setListening(true);

    recognition.onresult = (e) => {
      setInput(e.results[0][0].transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating AI Orb */}
      {!open && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen(true)}
          className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 shadow-xl flex items-center justify-center"
        >
          <Bot className="text-white w-7 h-7" />
          <span className="absolute inset-0 rounded-full animate-ping bg-blue-400 opacity-20" />
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`fixed z-[9999] shadow-2xl overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col ${fullScreen
              ? "inset-0 m-0 w-screen h-screen rounded-none"
              : "bottom-10 right-10 w-[420px] h-[650px] rounded-[32px] border border-white/20 shadow-blue-200/50"
              }`}
            style={{
              background: "linear-gradient(135deg, #f8faff 0%, #ffffff 100%)",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Header */}
            <div className={`p-6 flex items-center justify-between bg-white/40 backdrop-blur-md border-b border-white/40 ${fullScreen ? "px-16 py-8" : ""}`}>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center text-white shadow-lg overflow-hidden">
                    <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
                      <Bot className="w-6 h-6" />
                    </motion.div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-white rounded-full" />
                </div>
                <div>
                  <h3 className={`font-black text-gray-800 leading-none ${fullScreen ? "text-2xl" : "text-lg"}`}>Medi-Match AI</h3>
                  <p className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest mt-1">Advanced Medical Logic 2.0</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFullScreen(!fullScreen)}
                  className="p-3 hover:bg-white/60 rounded-xl transition-colors text-gray-500 group"
                >
                  {fullScreen ? <Minimize2 className="w-5 h-5 group-hover:scale-110 transition-transform" /> : <Maximize2 className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-3 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-xl transition-colors group"
                >
                  <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                </button>
              </div>
            </div>

            {/* Scrollable Chat Area */}
            <div className={`flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/20 custom-scrollbar ${fullScreen ? "px-48 py-12" : ""}`}>
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-8 max-w-2xl mx-auto">
                  <div className="w-24 h-24 bg-blue-50 rounded-[40px] flex items-center justify-center shadow-inner relative">
                    <Layout className="w-10 h-10 text-blue-100 absolute scale-150 rotate-12" />
                    <Bot className="w-10 h-10 text-blue-600 relative z-10" />
                  </div>
                  <div>
                    <h4 className="text-3xl font-black text-gray-800 tracking-tight italic">"Helping you procure better."</h4>
                    <p className="text-sm text-gray-500 mt-4 font-medium max-w-sm mx-auto uppercase tracking-wide">AI-Powered Procurement Intelligence for Healthcare</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3">
                    {["Show ICU Products", "Suggest for Clinic", "My Orders", "Contact Support"].map(chip => (
                      <button
                        key={chip}
                        onClick={() => { setInput(chip); sendMessage(); }}
                        className="px-6 py-3 bg-white border border-gray-100 rounded-2xl text-[13px] font-bold text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm hover:shadow-md"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => {
                if (m.role === "system") {
                  return (
                    <div
                      key={i}
                      className="bg-white shadow-sm rounded-xl p-3 text-sm text-gray-700"
                    >
                      {m.content}
                    </div>
                  );
                }

                if (m.role === "orders") {
                  return (
                    <div key={i} className="space-y-2">
                      {m.orders.map((o) => (
                        <div key={o.id} className="bg-white p-3 rounded-lg shadow-sm flex justify-between items-center">
                          <div>
                            <div className="text-sm font-medium">{o.order_number}</div>
                            <div className="text-xs text-gray-500">{new Date(o.created_at).toLocaleString()} • ₹{o.total}</div>
                          </div>
                          <div>
                            <button
                              onClick={async () => {
                                const res = await http.get(`/cart/order/${o.id}/invoice`, { responseType: "blob" });
                                const url = window.URL.createObjectURL(new Blob([res.data]));
                                const link = document.createElement("a");
                                link.href = url;
                                link.setAttribute("download", `invoice_${o.order_number}.pdf`);
                                document.body.appendChild(link);
                                link.click();
                                link.parentNode.removeChild(link);
                              }}
                              className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
                            >
                              Download
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                }

                if (m.role === "comparison") {
                  return (
                    <div key={i} className="w-full bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-blue-100 shadow-xl my-4 overflow-x-auto">
                      <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="p-2 bg-blue-100 rounded-lg"><Layout className="w-5 h-5 text-blue-600" /></span>
                        Product Face-Off
                      </h4>
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-blue-50">
                            <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Feature</th>
                            {m.data.products.map((p, pi) => (
                              <th key={pi} className="py-3 px-4 text-sm font-bold text-blue-600">{p.name}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-blue-50 hover:bg-white/80 transition-colors">
                            <td className="py-4 px-4 text-sm font-bold text-gray-500">Price</td>
                            {m.data.products.map((p, pi) => (
                              <td key={pi} className="py-4 px-4 text-sm font-extrabold text-blue-600">₹{p.price?.toLocaleString()}</td>
                            ))}
                          </tr>
                          {m.data.features.map((feat, fi) => (
                            <tr key={fi} className="border-b border-blue-50 hover:bg-white/80 transition-colors">
                              <td className="py-4 px-4 text-sm font-semibold text-gray-600 capitalize">{feat}</td>
                              {m.data.products.map((p, pi) => (
                                <td key={pi} className="py-4 px-4 text-sm text-gray-700">{p[feat] || "N/A"}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }

                if (m.role === "products") {
                  const cols = fullScreen ? "grid-cols-4 lg:grid-cols-5" : "grid-cols-2";
                  return (
                    <div key={i} className={`grid ${cols} gap-4 w-full my-4`}>
                      {m.products.map((p) => (
                        <motion.div
                          key={p.id}
                          layout
                          whileHover={{ y: -8, scale: 1.02 }}
                          onClick={() => navigate(`/products/${p.id}`)}
                          className={`bg-white rounded-3xl p-3 border border-gray-100 shadow-sm cursor-pointer transition-all flex flex-col group ${fullScreen ? "shadow-md ring-1 ring-black/5" : ""}`}
                        >
                          <div className="relative overflow-hidden rounded-2xl aspect-square">
                            <img
                              src={p.image || "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=400"}
                              alt={p.title}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute bottom-2 right-2 p-2 bg-white/90 backdrop-blur-md rounded-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                              <ArrowRight className="w-4 h-4 text-blue-600" />
                            </div>
                          </div>

                          <div className="mt-3 px-1 flex-1">
                            <div className="text-[12px] font-black text-gray-400 uppercase tracking-[0.1em] mb-1">Authentic Gear</div>
                            <div className="text-[14px] font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">{p.title}</div>
                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
                              <span className="text-blue-600 font-black text-base">₹{p.price?.toLocaleString()}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-500 rounded-md">VIEW</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  );
                }

                if (m.role === "chips") {
                  return (
                    <div key={i} className="flex flex-wrap gap-2 py-1">
                      {m.chips.map((chip, ci) => (
                        <button
                          key={ci}
                          onClick={() => {
                            setInput(chip);
                            sendMessage();
                          }}
                          className="px-3 py-1.5 bg-white border border-blue-200 text-blue-600 text-xs font-semibold rounded-full hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  );
                }

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: m.role === "user" ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`max-w-[85%] p-3.5 rounded-2xl text-[13.5px] leading-relaxed relative ${m.role === "user"
                      ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white ml-auto rounded-tr-none shadow-md"
                      : "bg-white border border-gray-100 text-gray-800 mr-auto rounded-tl-none shadow-sm"
                      }`}
                  >
                    {m.content}
                    <div className={`absolute top-0 ${m.role === 'user' ? 'right-[-8px] border-l-blue-600' : 'left-[-8px] border-r-white'} border-4 border-transparent`} />
                  </motion.div>
                );
              })}

              {/* Typing indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-2 bg-white/80 backdrop-blur-sm p-3 rounded-2xl w-fit shadow-sm border border-blue-50"
                >
                  <div className="flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
                  </div>
                  <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{statusText}</span>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t flex gap-2 bg-white">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your AI assistant..."
                className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />

              {/* Voice input button */}
              <div className="relative flex items-center justify-center w-16 h-16 mx-auto">
                {listening && (
                  <motion.div
                    className="absolute w-20 h-20 rounded-full border-4 border-blue-400 border-opacity-50"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.6, 0.2, 0.6],
                    }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                  />
                )}

                {listening && (
                  <motion.div
                    className="absolute w-24 h-24 rounded-full border-2 border-purple-500 border-opacity-30"
                    animate={{
                      scale: [1, 1.7, 1],
                      opacity: [0.4, 0.1, 0.4],
                    }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                )}

                <button
                  onClick={startVoice}
                  className={`relative rounded-full w-16 h-16 flex items-center justify-center ${listening
                    ? "bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 shadow-lg"
                    : "bg-gray-200"
                    }`}
                >
                  <Mic
                    className={`w-6 h-6 ${listening ? "text-white" : "text-gray-700"
                      }`}
                  />
                </button>
              </div>

              {/* Send button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={sendMessage}
                className="bg-blue-600 text-white rounded-full w-15 h-15 flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
