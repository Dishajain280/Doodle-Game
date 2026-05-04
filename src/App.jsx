import { SocketProvider } from "./contexts/SocketContext";
import GameLayout from "./components/GameLayout";

function App() {
  return (
    <SocketProvider>
      <GameLayout />
    </SocketProvider>
  );
}

export default App;
