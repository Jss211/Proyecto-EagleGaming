import { useState, useRef, useEffect } from "react";
import { X, Send, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import botAvatar from "../assets/bot-avatar.jpg";

interface Message {
  id: string;
  text: string;
  sender: "bot" | "user";
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "¡Hola! Soy el asistente virtual de EagleGaming. ¿En qué te puedo ayudar hoy?",
      sender: "bot",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      // AQUÍ SE CONECTARÁ TU COMPAÑERO MEDIANTE LA URL (API DEL BOT)
      // const response = await fetch("TU_URL_AQUI", { ... });

      setTimeout(() => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "¡Estoy listo para ayudarte! EagleGaming es la mejor opción.",
          sender: "bot",
        };
        setMessages((prev) => [...prev, botResponse]);
        setIsTyping(false);
      }, 1500);
      
    } catch (error) {
      console.error("Error conectando con el bot", error);
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute bottom-0 right-0 w-[340px] sm:w-[380px] bg-zinc-950 border border-red-600/30 rounded-2xl shadow-[0_0_40px_rgba(220,38,38,0.3)] overflow-hidden flex flex-col origin-bottom-right"
            style={{ height: "550px", maxHeight: "calc(100vh - 48px)" }}
          >
            {/* Cabecera del Chat */}
            <div className="bg-gradient-to-r from-red-800 to-zinc-950 p-4 flex items-center justify-between border-b border-red-600/50">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={botAvatar}
                    alt="EagleBot"
                    className="w-11 h-11 rounded-full border-2 border-red-500 object-cover shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                  />
                  {/* Punto verde en la cabecera */}
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-zinc-950 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.5)]"></span>
                </div>
                <div>
                  <h3 className="font-bold text-white tracking-wide">EagleBot</h3>
                  <p className="text-xs text-red-200">En línea</p>
                </div>
              </div>
              {/* Única X para cerrar el chat */}
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            {/* Área de Mensajes */}
            <div className="flex-1 p-5 overflow-y-auto bg-zinc-900/80 flex flex-col gap-5 scrollbar-thin scrollbar-thumb-red-600/50 scrollbar-track-transparent">
              {messages.map((msg) => (
                <motion.div
                  initial={{ opacity: 0, x: msg.sender === "user" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] ${
                    msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
                >
                  <div className="flex-shrink-0 mt-auto mb-1">
                    {msg.sender === "bot" ? (
                      <img
                        src={botAvatar}
                        alt="Bot"
                        className="w-8 h-8 rounded-full border border-red-500/50 object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                        <User size={16} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div
                    className={`p-3 rounded-2xl text-[15px] leading-relaxed shadow-md ${
                      msg.sender === "user"
                        ? "bg-red-600 text-white rounded-br-none"
                        : "bg-zinc-800 text-zinc-100 border border-red-900/30 rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-3 max-w-[85%] mr-auto"
                >
                  <div className="flex-shrink-0 mt-auto mb-1">
                    <img
                      src={botAvatar}
                      alt="Bot"
                      className="w-8 h-8 rounded-full border border-red-500/50 object-cover"
                    />
                  </div>
                  <div className="bg-zinc-800 border border-red-900/30 px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-1.5 h-[42px]">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 bg-red-500 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 bg-red-500 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 bg-red-500 rounded-full"
                    />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Área de Input */}
            <div className="p-3 bg-zinc-950 border-t border-red-900/50">
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Escribe aquí tu duda..."
                  className="flex-1 bg-zinc-900 text-zinc-100 placeholder:text-zinc-500 border border-red-900/50 rounded-full px-4 py-2.5 text-[15px] focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="w-11 h-11 flex-shrink-0 rounded-full bg-red-600 flex items-center justify-center text-white hover:bg-red-500 transition-colors disabled:opacity-50 disabled:hover:bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                >
                  {/* Centrado correcto del ícono sin margen forzado */}
                  <Send size={18} className="-ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isOpen && (
          <motion.div
            key="tooltip"
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            // El delay solo se aplica al ENTRAR
            animate={{ opacity: 1, x: 0, scale: 1, transition: { delay: 0.8, duration: 0.4, type: "spring" } }}
            // Al SALIR (exit), desaparece instantáneamente sin delay
            exit={{ opacity: 0, scale: 0.8, x: 10, transition: { duration: 0.15 } }}
            className="absolute bottom-2 right-[76px] bg-zinc-900 border border-red-600/50 text-white px-4 py-2.5 rounded-2xl rounded-br-sm shadow-[0_0_20px_rgba(220,38,38,0.2)] whitespace-nowrap pointer-events-none origin-bottom-right z-0"
          >
            <p className="font-medium text-[14px]">¿Dudas con tu PC o compra?</p>
            <p className="text-red-400 font-bold mt-0.5 text-[12px]">¡Haz clic aquí y te ayudo!</p>
            
            {/* Triángulo apuntando al botón */}
            <div className="absolute bottom-3 -right-[6px] w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-red-600/50"></div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="eagle-button"
            initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 200, damping: 20 }}
            onClick={() => setIsOpen(true)}
            whileHover={{ scale: 1.1, boxShadow: "0px 0px 25px rgba(220,38,38,0.8)" }}
            whileTap={{ scale: 0.9 }}
            className="absolute bottom-0 right-0 w-16 h-16 rounded-full border-2 border-red-600 cursor-pointer flex items-center justify-center bg-zinc-950 shadow-[0_0_15px_rgba(220,38,38,0.4)] z-10"
          >
            <img 
              src={botAvatar} 
              alt="Abrir Chat" 
              className="w-full h-full object-cover rounded-full"
            />
            
            {/* Puntito verde de "En línea" brillante y sobresaliendo */}
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-[3px] border-zinc-950 rounded-full z-20 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
