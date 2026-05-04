import { useState, useEffect, useRef } from "react";

const ChatBox = ({ currentWord, role, messages = [], onGuess }) => {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    const trimmed = message.trim();
    if (trimmed) {
      if (role === "guesser" && onGuess) {
        // Send guess via socket
        onGuess(trimmed);
      }
      setMessage("");
    }
  };

  return (
    <div className="w-full max-w-md h-[450px] flex flex-col bg-white rounded-[2rem] shadow-2xl border-4 border-white overflow-hidden ring-1 ring-gray-100">
      <div className="p-5 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-xl shadow-md">
        💬 Guesses & Chat ({messages.length - 1} messages)
      </div>
      <div className="flex-1 p-4 overflow-y-auto bg-indigo-50/30 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={msg.id || index}
            className={`p-3 px-4 rounded-2xl shadow-sm max-w-[85%] transform transition-all hover:scale-[1.02] ${
              msg.sender === "You"
                ? "bg-indigo-500 text-white ml-auto rounded-tr-none"
                : msg.type === "system"
                  ? "bg-yellow-100 text-yellow-800 mx-auto text-center w-[95%] border-2 border-yellow-200 font-bold"
                  : msg.type === "guess"
                    ? "bg-emerald-100 text-emerald-800 border-2 border-emerald-200 rounded-tl-none"
                    : "bg-white border-2 border-gray-100 text-gray-700 rounded-tl-none"
            }`}
          >
            <span
              className={`font-black block text-[10px] uppercase tracking-wider mb-1 ${msg.sender === "You" ? "text-indigo-200" : "text-gray-400"}`}
            >
              {msg.sender}
            </span>
            <p className="font-medium">{msg.text}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-white border-t-2 border-gray-50">
        <div className="flex gap-3">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your guess here!"
            className="flex-1 px-5 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all font-bold placeholder:text-gray-400"
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="px-6 py-3 bg-indigo-600 text-white font-black rounded-2xl shadow-lg hover:bg-indigo-700 transition-all active:scale-90"
          >
            OK!
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
