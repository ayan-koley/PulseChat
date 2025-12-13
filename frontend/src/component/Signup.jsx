import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signupUser } from "../../../fontend/src/store/authActions.js";
import { DATABASE_URL } from "../../../fontend/src/constant.js";

const Signup = ({ onToggleLogin }) => {
  const dispatch = useDispatch();
  const { loading, error: reduxError } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.username ||
      !formData.password
    ) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    const result = await dispatch(
      signupUser({
        fullName: formData.fullName,
        email: formData.email,
        username: formData.username,
        password: formData.password,
      })
    );

    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 rounded-2xl shadow-2xl shadow-black/40 border border-neutral-800 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-100 mb-2">
            PulseChat
          </h1>
          <p className="text-neutral-400">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(error || reduxError) && (
            <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-200 text-sm">
              {error || reduxError}
            </div>
          )}

          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-neutral-200 mb-2"
            >
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              disabled={loading}
            />
          </div>

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
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-neutral-200 mb-2"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="johndoe"
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
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-neutral-200 mb-2"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
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
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-neutral-400">
          Already have an account?{" "}
          <button
            onClick={onToggleLogin}
            className="text-blue-400 hover:text-blue-300 font-medium transition"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
