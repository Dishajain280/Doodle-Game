import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-[calc(100vh-96px)] bg-gradient-to-br from-sky-50 via-white to-violet-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-4xl w-full bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl p-10 border border-slate-200">
        <h1 className="text-5xl font-black text-slate-900 mb-4">DoodleGuess</h1>
        <p className="text-lg text-slate-600 mb-8 leading-8">
          Play a fast-paced drawing and guessing game with friends. Create a
          room, invite others, and take turns drawing while everyone else
          guesses the word.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            to="/lobby"
            className="block text-center px-8 py-5 bg-indigo-600 text-white rounded-3xl font-semibold shadow-lg hover:bg-indigo-700 transition"
          >
            Join or Create Room
          </Link>
          <Link
            to="/about"
            className="block text-center px-8 py-5 bg-white border border-slate-200 text-slate-900 rounded-3xl font-semibold shadow-sm hover:shadow-lg transition"
          >
            How to Play
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
