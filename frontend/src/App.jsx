import { useState } from "react";
import StatsDashboard from "./components/StatsDashboard";
import TicketForm from "./components/TicketForm";
import TicketList from "./components/TicketList";

export default function App() {
  const [refreshToken, setRefreshToken] = useState(0);

  const onTicketCreated = () => {
    setRefreshToken((prev) => prev + 1);
  };

  return (
    <main className="app-shell">
      <header>
        <h1>Support Ticket System</h1>
      </header>
      <StatsDashboard refreshToken={refreshToken} />
      <TicketForm onTicketCreated={onTicketCreated} />
      <TicketList refreshToken={refreshToken} />
    </main>
  );
}
