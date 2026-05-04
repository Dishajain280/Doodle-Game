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
    <div className="w-full max-w-md h-96 flex flex-col bg-white border-2 border-gray-200 rounded-2xl shadow-xl overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg shadow-lg">
        💬 Guesses & Chat ({messages.length - 1} messages)
      </div>
      <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-white space-y-3">
        {messages.map((msg, index) => (
          <div
            key={msg.id || index}
            className={`p-3 rounded-xl shadow-sm max-w-xs ${
              msg.sender === "You"
                ? "bg-blue-500 text-white ml-auto"
                : msg.type === "system"
                  ? "bg-green-100 text-green-800 mx-auto text-center w-full"
                  : "bg-white border border-gray-200"
            }`}
          >
            <span className="font-bold block text-xs opacity-75">
              {msg.sender}
            </span>
            <p>{msg.text}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Guess the word or chat..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-600 hover:to-purple-700 transition-all transform hover:-translate-y-0.5"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
