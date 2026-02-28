import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    bio: "",
  });

  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const fileRef = useRef(null);

  // Sync form when user loads
  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const initials =
    user?.fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (f.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fullName.trim()) {
      return toast.error("Name is required");
    }

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("fullName", form.fullName.trim());
      fd.append("bio", form.bio || "");
      if (file) fd.append("profilePic", file);

      const data = await updateProfile(fd);

      if (data?.success) {
        toast.success("Profile updated");
        navigate("/");
      } else {
        toast.error("Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-10">
        {/* Back */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-blue-600 font-semibold text-sm mb-7 hover:gap-3 transition-all"
        >
          ← Back to chat
        </button>

        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          Edit Profile
        </h1>
        <p className="text-sm text-slate-400 mb-7">
          Update your personal information
        </p>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-7">
          <div
            onClick={() => fileRef.current?.click()}
            className="relative w-24 h-24 rounded-full cursor-pointer ring-4 ring-blue-100 group"
          >
            {preview || user?.profilePic ? (
              <img
                src={preview || user.profilePic}
                alt="avatar"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-700 to-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                {initials}
              </div>
            )}

            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center
                            text-white opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold">
              Upload
            </div>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleFile}
          />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={form.fullName}
            onChange={(e) =>
              setForm((p) => ({ ...p, fullName: e.target.value }))
            }
            placeholder="Full Name"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl
                       focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <textarea
            value={form.bio}
            onChange={(e) =>
              setForm((p) => ({ ...p, bio: e.target.value }))
            }
            rows={3}
            placeholder="Your bio"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl resize-none
                       focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
            <p className="text-xs text-slate-400">Email</p>
            <p className="text-sm font-medium">{user?.email}</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 text-white font-semibold
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={logout}
            className="w-full py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-600
                       hover:bg-red-50 hover:text-red-500 transition-all"
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}