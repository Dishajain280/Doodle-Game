import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-[calc(100vh-96px)] bg-gradient-to-br from-violet-50 via-white to-pink-100 px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-slate-200 p-10">
        <h2 className="text-4xl font-black text-slate-900 mb-4">How to play</h2>
        <div className="space-y-4 text-slate-600 text-lg leading-8">
          <p>
            Choose or join a room, then wait for at least two players to
            connect. One player draws a secret word while the others guess the
            drawing in the chat.
          </p>
          <p>
            Correct guesses are announced automatically. When the time runs out,
            the next round begins with a new drawer and a new word.
          </p>
          <p>
            Use the toolbar below the canvas to change brush color, size, or
            erase. The drawer can sketch freely while guessers type their
            answers.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            to="/"
            className="px-6 py-3 rounded-2xl bg-slate-100 text-slate-800 font-semibold hover:bg-slate-200 transition"
          >
            Back to Home
          </Link>
          <Link
            to="/lobby"
            className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
          >
            Go to Lobby
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
