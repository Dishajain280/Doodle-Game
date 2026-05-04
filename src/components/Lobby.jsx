import { useState } from "react";
import { useSocket } from "../contexts/SocketContext";

const Lobby = ({ onJoinRoom }) => {
  const [playerName, setPlayerName] = useState("");
  const [roomId, setRoomId] = useState("");
  const { socket, isConnected } = useSocket();

  const handleJoinRoom = () => {
    if (playerName.trim() && roomId.trim() && socket) {
      socket.emit("join-room", {
        roomId: roomId.trim(),
        playerName: playerName.trim(),
      });
      onJoinRoom(roomId.trim(), playerName.trim());
    }
  };

  const handleCreateRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(newRoomId);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-yellow-200 via-pink-200 to-indigo-400 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-lg rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-10 transform transition-all hover:scale-[1.01]">
        <h1 className="text-5xl font-black bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 bg-clip-text text-transparent text-center mb-2 drop-shadow-sm">
          DoodleGuess
        </h1>
        <p className="text-center text-gray-500 font-medium mb-8">
          Draw, Guess, Win! 🎨
        </p>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-2 ml-1">
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-600 mb-2 ml-1">
              Room Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                placeholder="Enter room code"
                className="flex-1 px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all font-mono font-bold"
              />
              <button
                onClick={handleCreateRoom}
                className="px-6 py-4 bg-gradient-to-r from-emerald-400 to-cyan-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-emerald-200 hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                Create
              </button>
            </div>
          </div>

          <button
            onClick={handleJoinRoom}
            disabled={!isConnected || !playerName.trim() || !roomId.trim()}
            className={`w-full py-5 text-xl font-black rounded-2xl shadow-xl transition-all transform active:scale-95 ${
              isConnected && playerName.trim() && roomId.trim()
                ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:shadow-purple-200 hover:-translate-y-1"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isConnected ? "Join Room" : "Connecting..."}
          </button>

          <div className="text-center text-sm text-gray-500">
            <div
              className={`inline-block w-3 h-3 rounded-full mr-2 ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            {isConnected ? "Connected to server" : "Connecting to server..."}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
