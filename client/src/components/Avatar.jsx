// Reusable Avatar component — shows image or colored initials
const COLORS = ['#2563eb','#1d4ed8','#3b82f6','#1e40af','#0ea5e9']

function getColor(name = '') {
  return COLORS[name.charCodeAt(0) % COLORS.length]
}

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
}

export default function Avatar({ src, name = '', size = 40, online = false }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <div
          className="w-full h-full rounded-full flex items-center justify-center text-white font-bold select-none"
          style={{ background: getColor(name), fontSize: Math.round(size * 0.36) }}
        >
          {getInitials(name)}
        </div>
      )}
      {online && (
        <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
      )}
    </div>
  )
}