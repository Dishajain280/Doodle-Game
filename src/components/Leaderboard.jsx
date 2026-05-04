const Leaderboard = ({ players = [] }) => {
  return (
    <div className="w-full max-w-sm bg-gradient-to-b from-purple-500 to-blue-600 rounded-2xl shadow-2xl p-6 text-white">
      <h2 className="text-2xl font-bold mb-6 text-center tracking-wide">
        🏆 Leaderboard
      </h2>
      <div className="space-y-3">
        {players.map((player) => (
          <div
            key={player.name}
            className="flex items-center justify-between p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg border border-white/30"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black">
                {player.position === 1
                  ? "🥇"
                  : player.position === 2
                    ? "🥈"
                    : player.position === 3
                      ? "🥉"
                      : "🏅"}
              </span>
              <span className="font-semibold text-lg">{player.name}</span>
            </div>
            <span className="text-2xl font-bold bg-white/30 px-4 py-2 rounded-full">
              {player.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
