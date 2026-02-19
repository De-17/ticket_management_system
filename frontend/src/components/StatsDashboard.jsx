import { useEffect, useState } from "react";
import { fetchStats } from "../api";

export default function StatsDashboard({ refreshToken }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchStats();
        setStats(data);
      } catch (e) {
        setError(e.message || "Failed to load stats");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [refreshToken]);

  if (loading && !stats) {
    return (
      <section className="panel">
        <h2>Stats Dashboard</h2>
        <p className="info-text">Loading stats...</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>Stats Dashboard</h2>
      {error && <p className="error-text">{error}</p>}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <p>Total Tickets</p>
            <h3>{stats.total_tickets}</h3>
          </div>
          <div className="stat-card">
            <p>Open Tickets</p>
            <h3>{stats.open_tickets}</h3>
          </div>
          <div className="stat-card">
            <p>Avg Tickets / Day</p>
            <h3>{stats.avg_tickets_per_day}</h3>
          </div>

          <div className="stat-breakdown">
            <h4>Priority Breakdown</h4>
            <ul>
              {Object.entries(stats.priority_breakdown).map(([label, count]) => (
                <li key={label}>
                  <span>{label}</span>
                  <strong>{count}</strong>
                </li>
              ))}
            </ul>
          </div>

          <div className="stat-breakdown">
            <h4>Category Breakdown</h4>
            <ul>
              {Object.entries(stats.category_breakdown).map(([label, count]) => (
                <li key={label}>
                  <span>{label}</span>
                  <strong>{count}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
