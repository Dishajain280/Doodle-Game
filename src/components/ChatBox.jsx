import { useState, useEffect, useRef } from "react";

const ChatBox = ({ currentWord, role, messages = [], onGuess }) => {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    const trimmed = message.trim();
    if (trimmed) {
      if (role === "guesser" && onGuess) {
        onGuess(trimmed);
      }
      setMessage("");
    }
  };

  return (
    <div className="w-full flex flex-col h-125 bg-white rounded-3xl shadow-soft border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
        <h3 className="font-display font-bold text-slate-700 flex items-center gap-2">
          <span className="text-xl">💬</span>
          Chat & Guesses
        </h3>
        <span className="px-2 py-1 bg-white rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">
          {messages.length} msgs
        </span>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-white scroll-smooth">
        {messages.map((msg, index) => {
          const isSystem = msg.type === "system";
          const isGuess = msg.type === "guess";
          const isOwn = msg.sender === "You";

          return (
            <div
              key={msg.id || index}
              className={`flex flex-col ${isOwn ? "items-end" : isSystem ? "items-center" : "items-start"}`}
            >
              {!isSystem && (
                <span className="text-[10px] font-bold text-slate-400 mb-1 px-1 uppercase tracking-tighter">
                  {msg.sender}
                </span>
              )}
              <div
                className={`max-w-[90%] px-4 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                  isOwn
                    ? "bg-brand-primary text-white rounded-tr-none shadow-sm"
                    : isSystem
                    ? "bg-brand-warning/10 text-brand-warning border border-brand-warning/20 text-xs font-bold text-center w-full my-2"
                    : isGuess
                    ? "bg-brand-success/10 text-brand-success border border-brand-success/20 rounded-tl-none"
                    : "bg-slate-100 text-slate-600 rounded-tl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-50/50 border-t border-slate-100">
        <div className="flex gap-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm focus-within:border-brand-primary/50 focus-within:ring-4 focus-within:ring-brand-primary/5 transition-all">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder={role === "drawer" ? "Chatting is disabled..." : "Type your guess..."}
            disabled={role === "drawer"}
            className="flex-1 px-4 py-2 bg-transparent outline-none text-sm font-semibold placeholder:text-slate-400 disabled:cursor-not-allowed"
          />
          <button
            onClick={sendMessage}
            disabled={role === "drawer" || !message.trim()}
            className="px-4 py-2 bg-brand-primary text-white font-bold rounded-xl text-sm hover:bg-brand-accent transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
