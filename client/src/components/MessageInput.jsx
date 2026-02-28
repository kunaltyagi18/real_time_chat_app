import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

export default function MessageInput({ onSend, recipientName }) {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [sending, setSending] = useState(false);

  const fileRef = useRef(null);
  const textRef = useRef(null);

  // Cleanup preview URL (important)
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    if (preview) URL.revokeObjectURL(preview);
    setImage(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !image) return;

    try {
      setSending(true);

      const fd = new FormData();
      if (text.trim()) fd.append("text", text.trim());
      if (image) fd.append("image", image);

      await onSend(fd);

      setText("");
      clearImage();
      textRef.current?.focus();
    } catch (err) {
      toast.error("Failed to send message");
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-white border-t border-slate-100 px-4 py-3 flex-shrink-0">
      {/* Image preview */}
      {preview && (
        <div className="relative inline-block mb-2">
          <img
            src={preview}
            alt="preview"
            className="h-20 rounded-xl border-2 border-blue-200 object-cover"
          />
          <button
            type="button"
            onClick={clearImage}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-slate-700 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2
                   focus-within:border-blue-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all"
      >
        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/jpg,image/webp"
          hidden
          onChange={handleFile}
        />

        {/* Attach button */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-500 transition-colors"
        >
          📎
        </button>

        {/* Text area */}
        <textarea
          ref={textRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={`Message ${recipientName || ""}…`}
          className="flex-1 bg-transparent border-none resize-none text-sm text-slate-800 placeholder-slate-400
                     focus:outline-none max-h-28 overflow-y-auto py-1.5"
        />

        {/* Send button */}
        <button
          type="submit"
          disabled={sending || (!text.trim() && !image)}
          className="w-9 h-9 flex items-center justify-center rounded-xl
                     bg-gradient-to-br from-blue-700 to-blue-500 text-white
                     hover:scale-105 hover:shadow-lg hover:shadow-blue-200
                     disabled:opacity-40 disabled:cursor-not-allowed
                     transition-all"
        >
          {sending ? (
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            "➤"
          )}
        </button>
      </form>
    </div>
  );
}