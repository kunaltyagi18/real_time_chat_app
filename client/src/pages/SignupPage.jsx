import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    bio: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // prevent double click

    const fullName = form.fullName.trim();
    const email = form.email.trim();
    const password = form.password.trim();
    const bio = form.bio.trim();

    if (!fullName || !email || !password || !bio) {
      return toast.error("Please fill in all fields");
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return toast.error("Invalid email format");
    }

    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    try {
      setLoading(true);

      const data = await signup({
        fullName,
        email,
        password,
        bio,
      });

      if (data?.success) {
        toast.success("Account created successfully");
        navigate("/", { replace: true });
      } else {
        toast.error(data?.message || "Signup failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white items-center justify-center px-6">
      <div className="w-full max-w-md">
        <h2 className="text-3xl font-bold text-slate-900 mb-1">
          Create account
        </h2>
        <p className="text-sm text-slate-500 mb-8">
          Join ChatFlow today — it's free
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Full Name */}
          <input
            type="text"
            placeholder="Full Name"
            value={form.fullName}
            onChange={set("fullName")}
            autoComplete="name"
            className="px-4 py-3 border border-slate-200 rounded-xl
                       focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          {/* Email */}
          <input
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={set("email")}
            autoComplete="email"
            className="px-4 py-3 border border-slate-200 rounded-xl
                       focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          {/* Bio */}
          <input
            type="text"
            placeholder="Tell us about yourself"
            value={form.bio}
            onChange={set("bio")}
            className="px-4 py-3 border border-slate-200 rounded-xl
                       focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={set("password")}
              autoComplete="new-password"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl
                         focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-600"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 py-3 rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 text-white font-semibold
                       disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}