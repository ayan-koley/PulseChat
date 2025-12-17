export function timeFormater(inputTime) {
  const date = new Date(inputTime);
  const now = new Date();

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const diffInMs = startOfToday - new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  // 🟢 TODAY → show time
  if (diffInDays === 0) {
    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  // 🟡 YESTERDAY
  if (diffInDays === 1) {
    return "Yesterday";
  }

  // 🟡 WITHIN 2 DAYS → show day name
  if (diffInDays <= 2) {
    return date.toLocaleDateString("en-IN", { weekday: "long" });
  }

  // 🔴 MORE THAN 2 DAYS → show date
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
