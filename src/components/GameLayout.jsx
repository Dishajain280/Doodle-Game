import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import DrawingCanvas from "./DrawingCanvas";
import ChatBox from "./ChatBox";
import Leaderboard from "./Leaderboard";

const GameLayout = () => {
  const location = useLocation();
  const { socket } = useSocket();
  const [currentRoom, setCurrentRoom] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [roomData, setRoomData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [messages, setMessages] = useState([]);
  const [roomChecked, setRoomChecked] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.roomId && !currentRoom) {
      setCurrentRoom(location.state.roomId);
      setPlayerName(location.state.playerName || "");
    }
  }, [location.state, currentRoom]);

  useEffect(() => {
    if (!currentRoom && typeof window !== "undefined") {
      const stored = window.localStorage.getItem("doodle-room");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed?.roomId && parsed?.playerName) {
            setCurrentRoom(parsed.roomId);
            setPlayerName(parsed.playerName);
          }
        } catch (error) {
          console.warn("Failed to parse saved room data", error);
        }
      }
    }
    setRoomChecked(true);
  }, [currentRoom]);

  useEffect(() => {
    if (roomChecked && !currentRoom && !location.state?.roomId) {
      navigate("/lobby", { replace: true });
    }
  }, [roomChecked, currentRoom, location.state, navigate]);

  useEffect(() => {
    if (currentRoom && playerName && typeof window !== "undefined") {
      window.localStorage.setItem(
        "doodle-room",
        JSON.stringify({ roomId: currentRoom, playerName }),
      );
    }
  }, [currentRoom, playerName]);

  useEffect(() => {
    if (!socket || !currentRoom || !playerName || roomData) return;

    socket.emit("join-room", {
      roomId: currentRoom,
      playerName: playerName,
    });
  }, [socket, currentRoom, playerName, roomData]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("room-update", (data) => {
      setRoomData(data);
    });

    socket.on("game-started", (data) => {
      setRoomData(data);
      setTimeLeft(data.timeLeft);
      setMessages([
        {
          id: 1,
          sender: "System",
          text: `🎮 Game started! ${data.players.find((p) => p.isDrawer)?.name} is drawing...`,
          type: "system",
        },
      ]);
    });

    socket.on("timer-update", (time) => {
      setTimeLeft(time);
    });

    socket.on("correct-guess", (data) => {
      if (data.scores) {
        setRoomData((prev) => {
          if (!prev) return prev;
          const updatedPlayers = prev.players.map((p) => {
            const newScore = data.scores.find((s) => s.id === p.id);
            return newScore ? { ...p, score: newScore.score } : p;
          });
          return { ...prev, players: updatedPlayers };
        });
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: "System",
          text: `🎉 ${data.player} guessed correctly! The word was ${data.word}`,
          type: "system",
        },
      ]);
    });

    socket.on("wrong-guess", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: data.player,
          text: data.guess,
          type: "guess",
        },
      ]);
    });

    socket.on("next-round", (data) => {
      setRoomData(data);
      setTimeLeft(data.timeLeft);
      // Clear the canvas for the next round
      window.dispatchEvent(new CustomEvent("clear-canvas"));

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: "System",
          text: `⏭️ Next round! ${data.players.find((p) => p.isDrawer)?.name} is drawing...`,
          type: "system",
        },
      ]);
    });

    socket.on("game-ended", (data) => {
      setGameEnded(true);
      setGameResult(data);
      setRoomData((prev) => {
        if (!prev) return prev;
        return { ...prev, gameStarted: false };
      });
    });

    return () => {
      socket.off("room-update");
      socket.off("game-started");
      socket.off("timer-update");
      socket.off("correct-guess");
      socket.off("wrong-guess");
      socket.off("next-round");
      socket.off("game-ended");
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !roomData || roomData.gameStarted || !currentRoom) return;

    const isHost = roomData.players[0]?.id === socket.id;
    if (roomData.players.length >= 2 && isHost) {
      const delay = setTimeout(() => {
        socket.emit("start-game", currentRoom);
      }, 2000);

      return () => clearTimeout(delay);
    }
  }, [socket, roomData, currentRoom]);

  const handleJoinRoom = (roomId, name) => {
    setCurrentRoom(roomId);
    setPlayerName(name);
  };

  const handleStartGame = () => {
    if (socket && currentRoom) {
      socket.emit("start-game", currentRoom);
    }
  };

  const handleReturnToLobby = () => {
    setGameEnded(false);
    setGameResult(null);
    navigate("/lobby", { replace: true });
  };

  const handleDrawing = useCallback(
    (drawingData) => {
      if (socket && currentRoom) {
        socket.emit("drawing", { roomId: currentRoom, drawingData });
      }
    },
    [socket, currentRoom],
  );

  const handleGuess = useCallback(
    (guess) => {
      if (socket && currentRoom) {
        socket.emit("guess", { roomId: currentRoom, guess });
      }
    },
    [socket, currentRoom],
  );

  if (!currentRoom) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center">
        <p className="text-slate-600 text-lg">Redirecting to lobby...</p>
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center">
        <div className="text-center animate-in fade-in duration-700">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-brand-primary/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-brand-primary rounded-full border-t-transparent animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-slate-600">
            Setting up your room...
          </h2>
          <p className="text-slate-400 mt-2">Just a moment!</p>
        </div>
      </div>
    );
  }

  const currentPlayer = roomData.players.find((p) => p.id === socket?.id);
  const isDrawer = currentPlayer?.isDrawer;
  const currentWord = roomData.currentWord;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-brand-background py-6 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Game Stats Header */}
        <div className="card glass py-4! flex flex-wrap items-center justify-between gap-6 px-8 sticky top-24 z-40">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-2xl">
              🏠
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Room ID
              </p>
              <p className="font-mono font-black text-brand-primary">
                {currentRoom}
              </p>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              {isDrawer ? "Drawing Word" : "Guessing..."}
            </p>
            <div className="flex gap-2">
              {isDrawer ? (
                <span className="text-3xl font-black text-slate-800 tracking-tighter">
                  {currentWord}
                </span>
              ) : (
                <div className="flex gap-2">
                  {currentWord.split("").map((_, i) => (
                    <div
                      key={i}
                      className="w-6 h-1 bg-slate-300 rounded-full mt-6"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Time Left
              </p>
              <div
                className={`text-3xl font-mono font-black tabular-nums transition-colors ${timeLeft <= 10 ? "text-brand-danger animate-pulse" : "text-slate-700"}`}
              >
                {timeLeft.toString().padStart(2, "0")}s
              </div>
            </div>

            <div
              className={`px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-3 shadow-sm border ${
                isDrawer
                  ? "bg-brand-success/10 border-brand-success/20 text-brand-success"
                  : "bg-brand-accent/10 border-brand-accent/20 text-brand-accent"
              }`}
            >
              <span className="text-xl">{isDrawer ? "🎨" : "👀"}</span>
              {isDrawer ? "YOUR TURN" : "GUESS IT"}
            </div>
          </div>
        </div>

        {/* Main game area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Canvas */}
          <div className="lg:col-span-8 animate-in slide-in-from-left duration-500">
            <DrawingCanvas
              role={isDrawer ? "drawer" : "guesser"}
              onDrawing={handleDrawing}
              isMultiplayer={true}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6 flex flex-col animate-in slide-in-from-right duration-500">
            <ChatBox
              currentWord={currentWord}
              role={isDrawer ? "drawer" : "guesser"}
              messages={messages}
              onGuess={handleGuess}
            />
            <Leaderboard players={roomData.players} />
          </div>
        </div>

        {/* Game End Screen */}
        {gameEnded && gameResult && (
          <div className="fixed inset-0 z-50 bg-brand-background/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="card max-w-2xl w-full text-center space-y-8 animate-in zoom-in duration-300 shadow-2xl">
              <div className="text-6xl">🏆</div>

              <div>
                <h2 className="text-4xl font-black mb-2 text-brand-primary">
                  Game Complete!
                </h2>
                <p className="text-slate-500 font-medium mb-1">
                  All 3 rounds have been played
                </p>
              </div>

              {gameResult.winner && (
                <div className="p-6 bg-linear-to-br from-brand-warning/10 to-brand-warning/5 rounded-2xl border-2 border-brand-warning/20">
                  <p className="text-xs font-black text-brand-warning uppercase tracking-widest mb-2">
                    🎉 Winner
                  </p>
                  <p className="text-3xl font-black text-slate-800 mb-1">
                    {gameResult.winner.name}
                  </p>
                  <p className="text-xl font-black text-brand-warning">
                    {gameResult.winner.score} Points
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                  Final Scores
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {gameResult.players
                    .sort((a, b) => b.score - a.score)
                    .map((player, index) => {
                      const medals = ["🥇", "🥈", "🥉"];
                      return (
                        <div
                          key={player.id}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">
                              {index < 3 ? medals[index] : `#${index + 1}`}
                            </span>
                            <span className="font-bold text-slate-700">
                              {player.name}
                            </span>
                          </div>
                          <span className="font-black text-lg text-slate-800">
                            {player.score}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>

              <button
                onClick={handleReturnToLobby}
                className="btn-primary w-full py-5 text-lg"
              >
                Back to Lobby
              </button>
            </div>
          </div>
        )}

        {/* Start Game Button Overlay */}
        {!roomData.gameStarted && !gameEnded && (
          <div className="fixed inset-0 z-50 bg-brand-background/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="card max-w-sm w-full text-center space-y-8 animate-in zoom-in duration-300 shadow-2xl">
              <div className="text-6xl">🎮</div>
              <div>
                <h2 className="text-3xl mb-2">Ready to Play?</h2>
                <p className="text-slate-500 font-medium">
                  Waiting for the host to start the game.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-widest">
                  Players Joined
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {roomData.players.map((p) => (
                    <span
                      key={p.id}
                      className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 shadow-sm"
                    >
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>

              {roomData.players.length >= 2 ? (
                <button
                  onClick={handleStartGame}
                  className="btn-primary w-full py-5 text-xl"
                >
                  Start Game Now
                </button>
              ) : (
                <div className="p-4 bg-brand-warning/10 border border-brand-warning/20 rounded-2xl text-brand-warning font-bold text-sm">
                  Need at least 2 players to start!
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameLayout;
