import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import DrawingCanvas from "./DrawingCanvas";
import ChatBox from "./ChatBox";
import Leaderboard from "./Leaderboard";
import Lobby from "./Lobby";

const GameLayout = () => {
  const location = useLocation();
  const { socket } = useSocket();
  const [currentRoom, setCurrentRoom] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [roomData, setRoomData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [messages, setMessages] = useState([]);

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
  }, [currentRoom]);

  useEffect(() => {
    if (currentRoom && playerName && typeof window !== "undefined") {
      window.localStorage.setItem(
        "doodle-room",
        JSON.stringify({ roomId: currentRoom, playerName }),
      );
    }
  }, [currentRoom, playerName]);

  useEffect(() => {
    if (
      !socket ||
      !currentRoom ||
      !playerName ||
      roomData ||
      location.state?.skipAutoJoin
    )
      return;

    socket.emit("join-room", {
      roomId: currentRoom,
      playerName: playerName,
    });
  }, [socket, currentRoom, playerName, roomData, location.state]);

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
          text: `Game started! ${data.players.find((p) => p.isDrawer)?.name} is drawing...`,
          type: "system",
        },
      ]);
    });

    socket.on("timer-update", (time) => {
      setTimeLeft(time);
    });

    socket.on("drawing-update", (drawingData) => {
      // This will be handled by DrawingCanvas
    });

    socket.on("correct-guess", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: "System",
          text: `✅ ${data.player} guessed correctly! The word was ${data.word}`,
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
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: "System",
          text: `Next round! ${data.players.find((p) => p.isDrawer)?.name} is drawing...`,
          type: "system",
        },
      ]);
    });

    return () => {
      socket.off("room-update");
      socket.off("game-started");
      socket.off("timer-update");
      socket.off("drawing-update");
      socket.off("correct-guess");
      socket.off("wrong-guess");
      socket.off("next-round");
    };
  }, [socket]);

  const handleJoinRoom = (roomId, name) => {
    setCurrentRoom(roomId);
    setPlayerName(name);
  };

  const handleStartGame = () => {
    if (socket && currentRoom) {
      socket.emit("start-game", currentRoom);
    }
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
    return <Lobby onJoinRoom={handleJoinRoom} />;
  }

  if (!roomData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Waiting for room data...</p>
        </div>
      </div>
    );
  }

  const currentPlayer = roomData.players.find((p) => p.id === socket?.id);
  const isDrawer = currentPlayer?.isDrawer;
  const currentWord = roomData.currentWord;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            DoodleGuess
          </h1>
          <div className="flex justify-center items-center gap-4 text-xl font-semibold text-gray-700 flex-wrap">
            <span>
              Room:{" "}
              <span className="text-indigo-600 font-bold">{currentRoom}</span>
            </span>
            <span>
              Word:{" "}
              <span className="text-3xl font-black text-indigo-600">
                {isDrawer
                  ? currentWord
                  : currentWord
                      .split("")
                      .map(() => "_ ")
                      .join("")}
              </span>
            </span>
            {isDrawer ? (
              <span className="px-6 py-2 bg-green-500 text-white rounded-full font-bold text-lg shadow-lg">
                🎨 You are drawing
              </span>
            ) : (
              <span className="px-8 py-4 bg-blue-500 text-white rounded-[2rem] font-black text-lg shadow-xl">
                👀 Guess the drawing
              </span>
            )}
            <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-3xl shadow-lg border-2 border-rose-100">
              {timeLeft === 0 ? (
                <span className="font-black text-2xl text-rose-600">
                  Time's Up!
                </span>
              ) : (
                <>
                  <div className="w-4 h-4 bg-rose-500 rounded-full animate-ping"></div>
                  <span className="font-mono text-3xl font-black text-gray-800">
                    {timeLeft.toString().padStart(2, "0")}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main game area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Canvas */}
          <div className="lg:col-span-2">
            <DrawingCanvas
              role={isDrawer ? "drawer" : "guesser"}
              onDrawing={handleDrawing}
              isMultiplayer={true}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6 flex flex-col h-fit">
            <ChatBox
              currentWord={currentWord}
              role={isDrawer ? "drawer" : "guesser"}
              messages={messages}
              onGuess={handleGuess}
            />
            <Leaderboard players={roomData.players} />
          </div>
        </div>

        {/* Controls */}
        <div className="text-center space-y-4">
          {!roomData.gameStarted && roomData.players.length >= 2 && (
            <button
              onClick={handleStartGame}
              className="px-12 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl hover:from-green-600 hover:to-emerald-700 transition-all transform hover:-translate-y-1"
            >
              Start Game ({roomData.players.length} players)
            </button>
          )}
          {roomData.gameStarted && timeLeft === 0 && (
            <div className="text-gray-600">Waiting for next round...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameLayout;
