import { useEffect, useState } from "react";
import { listTickets, patchTicket } from "../api";
import { CATEGORIES, PRIORITIES, STATUSES } from "../constants";

function truncate(text, maxLength = 160) {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength)}...`;
}

export default function TicketList({ refreshToken }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    priority: "",
    status: "",
    search: "",
  });

  const loadTickets = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listTickets(filters);
      setTickets(data);
    } catch (e) {
      setError(e.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [refreshToken, filters.category, filters.priority, filters.status, filters.search]);

  const onStatusChange = async (ticketId, status) => {
    try {
      await patchTicket(ticketId, { status });
      await loadTickets();
    } catch (e) {
      setError(e.message || "Failed to update status");
    }
  };

  return (
    <section className="panel">
      <h2>Tickets</h2>
      <div className="filters">
        <input
          placeholder="Search title or description"
          value={filters.search}
          onChange={(event) =>
            setFilters((prev) => ({ ...prev, search: event.target.value }))
          }
        />

        <select
          value={filters.category}
          onChange={(event) =>
            setFilters((prev) => ({ ...prev, category: event.target.value }))
          }
        >
          <option value="">All categories</option>
          {CATEGORIES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={filters.priority}
          onChange={(event) =>
            setFilters((prev) => ({ ...prev, priority: event.target.value }))
          }
        >
          <option value="">All priorities</option>
          {PRIORITIES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(event) =>
            setFilters((prev) => ({ ...prev, status: event.target.value }))
          }
        >
          <option value="">All statuses</option>
          {STATUSES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="info-text">Loading tickets...</p>}
      {error && <p className="error-text">{error}</p>}

      <div className="ticket-list">
        {tickets.map((ticket) => (
          <article key={ticket.id} className="ticket-card">
            <div className="ticket-header">
              <h3>{ticket.title}</h3>
              <small>{new Date(ticket.created_at).toLocaleString()}</small>
            </div>
            <p>{truncate(ticket.description)}</p>
            <p className="meta">
              Category: <strong>{ticket.category}</strong> | Priority:{" "}
              <strong>{ticket.priority}</strong>
            </p>
            <label className="status-control">
              Status
              <select
                value={ticket.status}
                onChange={(event) => onStatusChange(ticket.id, event.target.value)}
              >
                {STATUSES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </article>
        ))}
      </div>
    </section>
  );
}
