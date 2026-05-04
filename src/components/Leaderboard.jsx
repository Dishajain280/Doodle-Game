const Leaderboard = ({ players = [] }) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="card !p-0 overflow-hidden shadow-playful border-2 border-brand-primary/10">
      <div className="px-6 py-4 bg-brand-primary/5 border-b border-brand-primary/10 flex items-center justify-between">
        <h3 className="font-display font-black text-brand-primary flex items-center gap-2 uppercase tracking-tight">
          <span className="text-xl">🏆</span>
          Leaderboard
        </h3>
        <span className="bg-brand-primary text-white text-[10px] font-black px-2 py-0.5 rounded-full">
          {players.length} Players
        </span>
      </div>
      
      <div className="divide-y divide-slate-50">
        {sortedPlayers.length > 0 ? (
          sortedPlayers.map((player, index) => {
            const isTop3 = index < 3;
            const medals = ["🥇", "🥈", "🥉"];
            
            return (
              <div
                key={player.id || player.name}
                className={`flex items-center justify-between p-4 px-6 transition-colors hover:bg-slate-50/50 ${
                  isTop3 ? "bg-slate-50/30" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-8 h-8 flex items-center justify-center font-black text-sm rounded-lg ${
                    index === 0 ? "bg-brand-warning/20 text-brand-warning" : 
                    index === 1 ? "bg-slate-200 text-slate-500" :
                    index === 2 ? "bg-brand-secondary/10 text-brand-secondary" :
                    "bg-slate-100 text-slate-400"
                  }`}>
                    {isTop3 ? medals[index] : index + 1}
                  </span>
                  <div>
                    <p className="font-bold text-slate-700 leading-none mb-1">
                      {player.name}
                    </p>
                    {player.isDrawer && (
                      <span className="text-[9px] font-black uppercase text-brand-primary bg-brand-primary/10 px-1.5 py-0.5 rounded">
                        Drawing...
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display font-black text-slate-800 text-lg">
                    {player.score}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    Points
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-slate-400 font-medium italic text-sm">
            Waiting for players...
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
