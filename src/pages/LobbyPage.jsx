import { useNavigate } from "react-router-dom";
import Lobby from "../components/Lobby";

const LobbyPage = () => {
  const navigate = useNavigate();

  const handleJoinRoom = (roomId, playerName) => {
    navigate("/game", {
      state: { roomId, playerName },
    });
  };

  return <Lobby onJoinRoom={handleJoinRoom} />;
};

export default LobbyPage;
