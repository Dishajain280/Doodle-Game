import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { SocketProvider } from "./contexts/SocketContext";
import Home from "./pages/Home";
import About from "./pages/About";
import LobbyPage from "./pages/LobbyPage";
import GameLayout from "./components/GameLayout";

function App() {
  return (
    <SocketProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 text-slate-900">
          <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
              <Link to="/" className="text-2xl font-black text-indigo-600">
                DoodleGuess
              </Link>
              <nav className="flex flex-wrap items-center gap-2">
                <Link
                  to="/"
                  className="px-4 py-2 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  Home
                </Link>
                <Link
                  to="/lobby"
                  className="px-4 py-2 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  Lobby
                </Link>
                <Link
                  to="/game"
                  className="px-4 py-2 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  Game
                </Link>
                <Link
                  to="/about"
                  className="px-4 py-2 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  How to Play
                </Link>
              </nav>
            </div>
          </header>

          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/lobby" element={<LobbyPage />} />
              <Route path="/game" element={<GameLayout />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </SocketProvider>
  );
}

export default App;
