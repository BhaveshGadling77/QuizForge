/**
 * Format seconds into mm:ss display string
 */
export const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

/**
 * Calculate percentage score
 */
export const calcScore = (correct, total) => {
  if (!total) return 0;
  return Math.round((correct / total) * 100);
};

/**
 * Return a Tailwind color class based on score
 */
export const scoreColor = (score) => {
  if (score >= 80) return "text-forge-green";
  if (score >= 50) return "text-forge-yellow";
  return "text-forge-red";
};

/**
 * Truncate a string to maxLen characters
 */
export const truncate = (str, maxLen = 80) =>
  str?.length > maxLen ? str.slice(0, maxLen) + "…" : str;

/**
 * Format a Firestore/ISO timestamp for display
 */
export const formatDate = (timestamp) => {
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/**
 * Shuffle an array (Fisher-Yates)
 */
export const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};