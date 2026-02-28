import React from "react";

// Safe time formatter
function formatTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date)) return "";
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Avatar({ size = 28, senderAvatar, senderName }) {
  const initials =
    senderName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  if (senderAvatar) {
    return (
      <img
        src={senderAvatar}
        alt={senderName || "avatar"}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
}

export default function MessageBubble({
  message = {},
  isMine = false,
  senderAvatar,
  senderName,
}) {
  const { text, image, createdAt, seen } = message;

  const handleImageClick = () => {
    if (image) {
      window.open(image, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      className={`flex items-end gap-2 my-0.5 ${
        isMine ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {!isMine && (
        <Avatar
          size={28}
          senderAvatar={senderAvatar}
          senderName={senderName}
        />
      )}

      <div
        className={`flex flex-col gap-1 max-w-[60%] ${
          isMine ? "items-end" : "items-start"
        }`}
      >
        {/* Image */}
        {image && (
          <img
            src={image}
            alt="attachment"
            className="max-w-[220px] rounded-2xl border-2 border-slate-100 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={handleImageClick}
          />
        )}

        {/* Text */}
        {text && (
          <div
            className={`px-4 py-2.5 rounded-[18px] text-sm leading-relaxed break-words
            ${
              isMine
                ? "bg-gradient-to-br from-blue-700 to-blue-500 text-white rounded-br-[4px] shadow-md shadow-blue-200"
                : "bg-white text-slate-800 rounded-bl-[4px] border border-slate-100 shadow-sm"
            }`}
          >
            {text}
          </div>
        )}

        {/* Meta */}
        <div
          className={`flex items-center gap-1 px-1 ${
            isMine ? "flex-row-reverse" : ""
          }`}
        >
          <span className="text-[11px] text-slate-400">
            {formatTime(createdAt)}
          </span>

          {isMine &&
            (seen ? (
              <svg viewBox="0 0 18 11" fill="none" className="w-4 h-3">
                <path
                  d="M1 5.5L5.5 10L13 2"
                  stroke="#3b82f6"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 5.5L10.5 10L18 2"
                  stroke="#3b82f6"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 13 11" fill="none" className="w-3 h-3">
                <path
                  d="M1 5.5L5.5 10L12 2"
                  stroke="#94a3b8"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ))}
        </div>
      </div>
    </div>
  );
}