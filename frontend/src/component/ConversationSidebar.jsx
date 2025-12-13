import { useMemo, useState } from "react";
import avatar from "../../public/avatar.png";

const formatTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const getDisplayMeta = (conversation, loggedInUserId) => {
  if (conversation.isGroup) {
    return {
      name: conversation.name || "Group Chat",
      avatar: conversation.avatar || conversation.participants?.[0]?.avatar,
    };
  }

  const other = conversation.participants?.find(
    (p) => p._id !== loggedInUserId
  );
  return {
    name: other?.fullName || "Chat",
    avatar: other?.avatar,
  };
};

const tabConfigs = [
  { id: "all", label: "All" },
  { id: "personal", label: "Personal" },
  { id: "groups", label: "Groups" },
];

const ConversationSidebar = ({
  conversations,
  filter,
  setFilter,
  activeConversationId,
  setActiveConversationId,
  loggedInUser,
  onLogout,
}) => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return conversations
      .filter((c) => {
        if (filter === "personal" && c.isGroup) return false;
        if (filter === "groups" && !c.isGroup) return false;
        return true;
      })
      .filter((c) => {
        const { name } = getDisplayMeta(c, loggedInUser._id);
        return name.toLowerCase().includes(q);
      });
  }, [conversations, filter, query, loggedInUser._id]);

  return (
    <aside className="h-full border-r border-neutral-800 bg-neutral-900 flex flex-col">
      <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <img
            src={loggedInUser.avatar}
            alt={loggedInUser.fullName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-semibold text-neutral-100">
              {loggedInUser.fullName}
            </p>
            <p className="text-xs text-neutral-400">Online</p>
          </div>
        </div>
        {onLogout && (
          <button
            onClick={onLogout}
            className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition"
            title="Logout"
          >
            🚪
          </button>
        )}
      </div>

      <div className="px-4 pt-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span
            className="absolute right-3 top-2.5 text-neutral-500"
            aria-hidden
          >
            🔍
          </span>
        </div>

        <div className="flex gap-2 mt-3">
          {tabConfigs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              aria-pressed={filter === tab.id}
              className={`flex-1 rounded-full border px-3 py-1 text-sm transition ${
                filter === tab.id
                  ? "border-blue-500 bg-blue-900/40 text-blue-200"
                  : "border-neutral-800 bg-neutral-900 text-neutral-200 hover:bg-neutral-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-4">
        <div className="flex flex-col gap-2">
          {filtered.map((conversation) => {
            const meta = getDisplayMeta(conversation, loggedInUser._id);
            const isActive = conversation._id === activeConversationId;
            return (
              <button
                key={conversation._id}
                type="button"
                onClick={() => setActiveConversationId(conversation._id)}
                className={`w-full text-left rounded-2xl px-3 py-3 transition flex gap-3 items-start ${
                  isActive
                    ? "bg-blue-900/30 border border-blue-700"
                    : "hover:bg-neutral-800"
                }`}
              >
                <img
                  src={avatar}
                  alt={meta.name}
                  className="w-12 h-12 rounded-full object-cover bg-neutral-800"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-neutral-100 truncate">
                        {meta.name}
                      </p>
                      <p className="text-xs text-neutral-400 truncate">
                        {conversation.lastMessage?.text || "No messages yet"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[11px] text-neutral-500">
                        {conversation.lastMessageAt
                          ? formatTime(conversation.lastMessageAt)
                          : ""}
                      </span>
                      {conversation.unreadCount > 0 && (
                        <span className="min-w-[22px] h-5 px-1.5 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <p className="text-center text-sm text-neutral-400 py-6">
              No conversations
            </p>
          )}
        </div>
      </div>
    </aside>
  );
};

export default ConversationSidebar;
