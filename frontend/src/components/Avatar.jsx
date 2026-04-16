// src/components/Avatar.jsx

import { useMemo, useState } from "react";

export default function Avatar({ user, size = "w-8 h-8", textSize = "text-sm" }) {
  const [imageError, setImageError] = useState(false);
  const name = user?.name || "User";

  const initials = useMemo(() => {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join("");
  }, [name]);

  const bgColor = useMemo(() => {
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-yellow-500",
      "bg-indigo-500",
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  }, [name]);

  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundType=transparent`;

  if (user?.image) {
    return (
      <img
        src={user.image}
        alt={name}
        className={`${size} rounded-full object-cover`}
      />
    );
  }

  if (!imageError) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${size} rounded-full object-cover`}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div
      className={`${size} rounded-full flex items-center justify-center text-white ${bgColor}`}
    >
      <span className={`${textSize} font-semibold`}>{initials || "U"}</span>
    </div>
  );
}
