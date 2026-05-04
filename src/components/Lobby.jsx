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
    <div className="min-h-[calc(100vh-80px)] bg-brand-background flex items-center justify-center p-4">
      <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
        <div className="card shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-brand-primary via-brand-accent to-brand-secondary" />
          
          <div className="text-center mb-10">
            <h1 className="text-5xl mb-2 bg-linear-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
              DoodleGuess
            </h1>
            <p className="text-slate-500 font-medium">
              The ultimate drawing & guessing game! 🎨
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 ml-1">
                Your Player Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="e.g. Picasso"
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 ml-1">
                Room Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  placeholder="CODE123"
                  className="flex-1 px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all font-mono font-bold"
                />
                <button
                  onClick={handleCreateRoom}
                  className="px-5 py-4 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
                  title="Generate random code"
                >
                  New
                </button>
              </div>
            </div>

            <button
              onClick={handleJoinRoom}
              disabled={!isConnected || !playerName.trim() || !roomId.trim()}
              className="btn-primary w-full py-5 text-xl"
            >
              {isConnected ? "Join Game" : "Connecting..."}
            </button>

            <div className="flex items-center justify-center gap-2 text-sm font-medium">
              <div
                className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                  isConnected ? "bg-brand-success shadow-[0_0_8px_rgba(16,185,129,0.6)]" : "bg-brand-danger"
                }`}
              />
              <span className={isConnected ? "text-brand-success" : "text-brand-danger"}>
                {isConnected ? "Server Online" : "Server Offline"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
