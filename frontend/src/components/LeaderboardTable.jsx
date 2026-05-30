import { scoreColor } from "@/utils/helpers";

const medals = ["🥇", "🥈", "🥉"];

/**
 * Props:
 *   entries – [{ rank, name, score, timeTaken }]
 *   currentUserId – string (highlight the current user's row)
 */
export default function LeaderboardTable({ entries = [], currentUserId }) {
  return (
    <div className="overflow-hidden rounded-xl border border-forge-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-forge-border bg-forge-surface">
            <th className="px-4 py-3 text-left font-mono text-xs text-forge-muted uppercase tracking-wider w-12">
              Rank
            </th>
            <th className="px-4 py-3 text-left font-mono text-xs text-forge-muted uppercase tracking-wider">
              Name
            </th>
            <th className="px-4 py-3 text-right font-mono text-xs text-forge-muted uppercase tracking-wider">
              Score
            </th>
            <th className="px-4 py-3 text-right font-mono text-xs text-forge-muted uppercase tracking-wider">
              Time
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => {
            const isSelf = entry.userId === currentUserId;
            return (
              <tr
                key={i}
                className={`border-b border-forge-border last:border-0 transition-colors ${
                  isSelf
                    ? "bg-forge-accent/5 border-l-2 border-l-forge-accent"
                    : "hover:bg-forge-surface/60"
                }`}
              >
                <td className="px-4 py-3 font-mono text-forge-muted">
                  {medals[i] ?? `#${entry.rank}`}
                </td>
                <td className="px-4 py-3 text-forge-text font-medium">
                  {entry.studentName || entry.userId.substring(0, 8)}
                  {isSelf && (
                    <span className="ml-2 badge bg-forge-accent/10 text-forge-accent text-[10px]">
                      you
                    </span>
                  )}
                </td>
                <td className={`px-4 py-3 text-right font-mono font-medium ${scoreColor(entry.percentage)}`}>
                  {Math.round(entry.percentage || 0)}%
                </td>
                <td className="px-4 py-3 text-right font-mono text-forge-muted">
                  {entry.timeTakenSeconds || 0}s
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}