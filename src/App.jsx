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
        <div className="min-h-screen bg-brand-background text-slate-900 font-sans">
          <header className="sticky top-0 z-50 glass border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              <Link
                to="/"
                className="text-3xl font-black bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent hover:scale-105 transition-transform"
              >
                DoodleGuess
              </Link>
              <nav className="hidden md:flex items-center gap-2">
                <Link
                  to="/"
                  className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:text-brand-primary hover:bg-brand-primary/5 transition"
                >
                  Home
                </Link>
                <Link
                  to="/lobby"
                  className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:text-brand-primary hover:bg-brand-primary/5 transition"
                >
                  Lobby
                </Link>
                <Link
                  to="/game"
                  className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:text-brand-primary hover:bg-brand-primary/5 transition"
                >
                  Game
                </Link>
                <Link
                  to="/about"
                  className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:text-brand-primary hover:bg-brand-primary/5 transition"
                >
                  How to Play
                </Link>
              </nav>
              {/* Mobile menu could be added here */}
            </div>
          </header>
          <main className="max-w-7xl mx-auto">
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
