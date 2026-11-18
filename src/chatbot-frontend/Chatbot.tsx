import { useState, useRef, useEffect } from "react";
import { X, Send, User, Cpu, ShieldCheck, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import botAvatar from "../assets/bot-avatar.jpg";

interface Product {
  id: string;
  name: string;
  summary?: string;
  price?: number;
  stock?: number;
  image_url?: string;
  product_url?: string;
}

interface Message {
  id: string;
  text: string;
  sender: "bot" | "user";
  products?: Product[];
  quickReplies?: string[];
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "¡Qué tal gamer! 🦅 Soy A.E.G.I.S., especialista de hardware de Eagle Gaming.\n\n¿Estás buscando armar una PC, cotizar una laptop, tarjeta gráfica u otro componente? ¡Dime qué necesitas y te ayudo al toque!",
      sender: "bot",
      quickReplies: ["🔥 Laptops Gamer", "🛠️ Arma tu PC", "⚡ Tarjetas Gráficas", "📦 Envíos y Garantía"],
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => "session-" + Math.random().toString(36).substring(2, 9));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessageWithText = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: "user",
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: textToSend,
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error en el servidor: ${response.status}`);
      }

      const data = await response.json();

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data.message,
        sender: "bot",
        products: data.products || [],
        quickReplies: data.quick_replies || [],
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Error conectando con A.E.G.I.S.:", error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Hubo una interrupción en la señal con el servidor. Verifica que el backend de Python esté encendido en http://localhost:8000.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessageWithText(inputValue);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, y: 25, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.92 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute bottom-0 right-0 w-[350px] sm:w-[410px] bg-gradient-to-b from-zinc-950 via-zinc-900 to-black border border-red-600/40 rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.35)] overflow-hidden flex flex-col origin-bottom-right backdrop-blur-xl"
            style={{ height: "580px", maxHeight: "calc(100vh - 48px)" }}
          >
            {/* Cabecera Táctica Gamer */}
            <div className="bg-gradient-to-r from-red-950/90 via-zinc-950 to-zinc-950 px-4 py-3.5 flex items-center justify-between border-b border-red-600/40 relative">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-red-600 via-red-500 to-amber-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]">
                    <img
                      src={botAvatar}
                      alt="A.E.G.I.S."
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-zinc-950 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-white tracking-wider text-[15px] flex items-center gap-1.5 font-mono">
                      A.E.G.I.S.
                      <span className="text-[10px] bg-red-600/30 text-red-400 border border-red-600/50 px-1.5 py-0.2 rounded font-sans tracking-normal font-semibold">
                        PRO
                      </span>
                    </h3>
                  </div>
                  <p className="text-[11px] text-zinc-400 flex items-center gap-1 font-medium">
                    <ShieldCheck size={12} className="text-red-500" />
                    Hardware Specialist · Eagle Gaming
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors bg-white/5 hover:bg-red-600/20 p-2 rounded-xl border border-white/5 hover:border-red-600/30 cursor-pointer"
                title="Cerrar chat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Área de Mensajes */}
            <div className="flex-1 p-4 overflow-y-auto bg-zinc-950/60 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-red-600/40 scrollbar-track-transparent">
              {messages.map((msg) => (
                <motion.div
                  initial={{ opacity: 0, x: msg.sender === "user" ? 15 : -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={msg.id}
                  className={`flex gap-2.5 max-w-[90%] ${
                    msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
                >
                  <div className="flex-shrink-0 mt-auto mb-1">
                    {msg.sender === "bot" ? (
                      <div className="w-7 h-7 rounded-full border border-red-500/60 p-0.5 bg-zinc-900 flex items-center justify-center shadow-[0_0_8px_rgba(239,68,68,0.4)]">
                        <Cpu size={14} className="text-red-400" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center shadow-[0_0_8px_rgba(220,38,38,0.5)]">
                        <User size={14} className="text-white" />
                      </div>
                    )}
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl text-[13.5px] leading-relaxed shadow-lg flex flex-col gap-2.5 ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-red-600 to-red-700 text-white rounded-br-none shadow-red-900/30 font-medium"
                        : "bg-zinc-900/90 text-zinc-100 border border-zinc-800/80 hover:border-red-950/80 rounded-bl-none backdrop-blur-sm"
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* Tarjetas de Producto estilo Inventario Gamer */}
                    {msg.products && msg.products.length > 0 && (
                      <div className="mt-1 flex flex-col gap-2 pt-1 border-t border-zinc-800/70">
                        {msg.products.map((prod) => (
                          <div
                            key={prod.id}
                            className="bg-black/60 border border-zinc-800 hover:border-red-600/50 rounded-xl p-3 flex flex-col gap-1.5 transition-all duration-200 group hover:shadow-[0_0_15px_rgba(220,38,38,0.2)]"
                          >
                            <span className="font-bold text-white text-[13px] line-clamp-2 group-hover:text-red-400 transition-colors">
                              {prod.name}
                            </span>
                            {prod.summary && (
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                <span className="bg-zinc-800/80 text-zinc-300 px-2 py-0.5 rounded text-[10.5px] border border-zinc-700/50">
                                  {prod.summary}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-zinc-800/60">
                              <span className="font-extrabold text-red-400 text-sm font-mono tracking-tight">
                                {prod.price ? `S/ ${prod.price.toLocaleString("es-PE", { minimumFractionDigits: 2 })}` : "Precio a consultar"}
                              </span>
                              {prod.stock !== null && prod.stock !== undefined && (
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                                    prod.stock > 0
                                      ? "bg-emerald-950/70 text-emerald-400 border border-emerald-700/50"
                                      : "bg-red-950/70 text-red-400 border border-red-700/50"
                                  }`}
                                >
                                  {prod.stock > 0 ? `✓ Stock: ${prod.stock}` : "Agotado"}
                                </span>
                              )}
                            </div>

                            {prod.product_url && (
                              <a
                                href={prod.product_url}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-1.5 flex items-center justify-center gap-1.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white py-1.5 px-3 rounded-lg font-bold transition-all text-[11.5px] shadow-[0_0_10px_rgba(220,38,38,0.3)]"
                              >
                                <span>Ver Ficha Técnica</span>
                                <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Chips Tácticos de Respuesta Rápida */}
                    {msg.quickReplies && msg.quickReplies.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1.5 pt-1 border-t border-zinc-800/50">
                        {msg.quickReplies.map((reply, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => sendMessageWithText(reply)}
                            className="bg-zinc-950 hover:bg-red-950/80 border border-red-800/40 hover:border-red-500/80 text-zinc-300 hover:text-white px-3 py-1 rounded-full text-[11.5px] font-medium transition-all duration-150 cursor-pointer shadow-sm active:scale-95 text-left"
                          >
                            {reply}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-2.5 max-w-[85%] mr-auto"
                >
                  <div className="w-7 h-7 rounded-full border border-red-500/60 p-0.5 bg-zinc-900 flex items-center justify-center">
                    <Cpu size={14} className="text-red-400" />
                  </div>
                  <div className="bg-zinc-900/90 border border-zinc-800 px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-1.5 h-[38px]">
                    <motion.div
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      className="w-1.5 h-1.5 bg-red-500 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      className="w-1.5 h-1.5 bg-red-500 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      className="w-1.5 h-1.5 bg-red-500 rounded-full"
                    />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Barra de Entrada de Comandos */}
            <div className="p-3 bg-zinc-950 border-t border-zinc-800/80">
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Pregunta por una PC, laptop, tarjeta o presupuesto..."
                  className="flex-1 bg-zinc-900/90 text-zinc-100 placeholder:text-zinc-500 border border-zinc-800 focus:border-red-500 rounded-xl px-3.5 py-2.5 text-[13.5px] focus:outline-none focus:ring-1 focus:ring-red-500 transition-all font-sans"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="w-10 h-10 flex-shrink-0 rounded-xl bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center text-white hover:from-red-500 hover:to-red-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(220,38,38,0.4)] cursor-pointer"
                  title="Enviar consulta"
                >
                  <Send size={16} className="-ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip Flotante */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            key="tooltip"
            initial={{ opacity: 0, x: 20, scale: 0.85 }}
            animate={{ opacity: 1, x: 0, scale: 1, transition: { delay: 0.6, duration: 0.35, type: "spring" } }}
            exit={{ opacity: 0, scale: 0.85, x: 10, transition: { duration: 0.15 } }}
            className="absolute bottom-2.5 right-[74px] bg-zinc-950 border border-red-600/50 text-white px-3.5 py-2 rounded-xl rounded-br-sm shadow-[0_0_25px_rgba(220,38,38,0.3)] whitespace-nowrap pointer-events-none origin-bottom-right z-0 backdrop-blur-md"
          >
            <p className="font-bold text-[13px] text-white flex items-center gap-1.5">
              <span>¿Dudas con tu setup o compra?</span>
            </p>
            <p className="text-red-400 font-extrabold text-[11.5px] tracking-wide mt-0.5 flex items-center gap-1">
              <span>Consulta a A.E.G.I.S.</span>
              <span className="text-[10px] bg-red-600/30 px-1 rounded text-red-300 font-mono">ONLINE</span>
            </p>
            
            <div className="absolute bottom-3 -right-[6px] w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-red-600/50"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón Flotante Principal */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="aegis-button"
            initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
            transition={{ duration: 0.35, type: "spring", stiffness: 220, damping: 20 }}
            onClick={() => setIsOpen(true)}
            whileHover={{ scale: 1.08, boxShadow: "0px 0px 30px rgba(220,38,38,0.9)" }}
            whileTap={{ scale: 0.92 }}
            className="absolute bottom-0 right-0 w-16 h-16 rounded-2xl border-2 border-red-600 cursor-pointer flex items-center justify-center bg-zinc-950 shadow-[0_0_20px_rgba(220,38,38,0.5)] z-10 p-1 group"
          >
            <img 
              src={botAvatar} 
              alt="Abrir A.E.G.I.S." 
              className="w-full h-full object-cover rounded-xl"
            />
            
            {/* Punto pulsante de estado */}
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-[3px] border-zinc-950 rounded-full z-20 shadow-[0_0_10px_rgba(16,185,129,0.9)]"></span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
