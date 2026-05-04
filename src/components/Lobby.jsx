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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8">
        <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent text-center mb-8">
          DoodleGuess
        </h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                placeholder="Enter room code"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              <button
                onClick={handleCreateRoom}
                className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Create
              </button>
            </div>
          </div>

          <button
            onClick={handleJoinRoom}
            disabled={!isConnected || !playerName.trim() || !roomId.trim()}
            className={`w-full py-4 text-lg font-bold rounded-xl shadow-lg transition-all ${
              isConnected && playerName.trim() && roomId.trim()
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-xl hover:from-indigo-600 hover:to-purple-700"
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
