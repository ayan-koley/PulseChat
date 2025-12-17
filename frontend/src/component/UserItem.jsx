import { memo } from "react";

/**
 * UserItem Component
 *
 * A reusable user display component for chat sidebars and search modals.
 * Features hover effects, avatar glow, and text truncation.
 *
 * @param {Object} user - User object containing _id, avatar.url, fullName, username
 * @param {Function} onClick - Callback function when user item is clicked
 * @param {boolean} isActive - Optional active state for highlighting
 */
const UserItem = ({ user, onClick, isActive = false }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(user);
    }
  };

  // Fallback avatar if none provided
  const avatarUrl =
    user?.avatar?.url ||
    user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.fullName || "User"
    )}&background=3b82f6&color=fff&size=128`;

  return (
    <button
      onClick={handleClick}
      className={`
        w-full group relative
        flex items-center gap-3 
        px-3 py-2.5 rounded-xl
        transition-all duration-200 ease-out
        ${
          isActive
            ? "bg-blue-900/30 border border-blue-700/50"
            : "border border-transparent hover:bg-neutral-800/60 hover:border-neutral-700/40"
        }
        focus:outline-none focus:ring-2 focus:ring-blue-500/50
        active:scale-[0.98]
      `}
    >
      {/* Avatar Container with Hover Glow */}
      <div className="relative flex-shrink-0">
        <div
          className={`
          absolute inset-0 rounded-full 
          bg-blue-500/20 blur-md 
          transition-opacity duration-300
          ${isActive ? "opacity-60" : "opacity-0 group-hover:opacity-40"}
        `}
        />
        <img
          src={avatarUrl}
          alt={user?.fullName || "User"}
          className={`
            relative w-12 h-12 rounded-full 
            object-cover bg-neutral-800
            ring-2 transition-all duration-300
            ${
              isActive
                ? "ring-blue-500/60"
                : "ring-neutral-700/50 group-hover:ring-blue-400/40"
            }
          `}
        />

        {/* Optional: Online Indicator */}
        {/* Uncomment when implementing online status */}
        {/* {user?.isOnline && (
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-neutral-900 rounded-full" />
        )} */}
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0 text-left">
        {/* Full Name */}
        <p
          className={`
          text-sm font-semibold truncate
          transition-colors duration-200
          ${
            isActive
              ? "text-blue-100"
              : "text-neutral-100 group-hover:text-white"
          }
        `}
        >
          {user?.fullName || "Unknown User"}
        </p>

        {/* Username */}
        <p
          className={`
          text-xs truncate
          transition-colors duration-200
          ${
            isActive
              ? "text-blue-300/80"
              : "text-neutral-400 group-hover:text-neutral-300"
          }
        `}
        >
          @{user?.username || "username"}
        </p>
      </div>

      {/* Optional: Action Indicator */}
      {/* Uncomment for additional UI feedback */}
      {/* <div className={`
        flex-shrink-0 opacity-0 group-hover:opacity-100 
        transition-opacity duration-200
        ${isActive ? 'opacity-100' : ''}
      `}>
        <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div> */}
    </button>
  );
};

// Memoize to prevent unnecessary re-renders
export default memo(UserItem);
