import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from '../store/authActions.js';


const Login = ({ onToggleSignup }) => {
  const dispatch = useDispatch();
  const { loading, error: reduxError } = useSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async(e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    await dispatch(loginUser({email, password}));
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 rounded-2xl shadow-2xl shadow-black/40 border border-neutral-800 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-100 mb-2">
            PulseChat
          </h1>
          <p className="text-neutral-400">Welcome back</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {(error || reduxError) && (
            <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-200 text-sm">
              {error || reduxError}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-neutral-200 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-neutral-200 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-neutral-400">
          Don't have an account?{" "}
          <button
            onClick={onToggleSignup}
            className="text-blue-400 hover:text-blue-300 font-medium transition"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
