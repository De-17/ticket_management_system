import { useEffect, useState } from "react";
import { classifyDescription, createTicket } from "../api";
import { CATEGORIES, PRIORITIES } from "../constants";

const INITIAL_FORM = {
  title: "",
  description: "",
  category: "general",
  priority: "medium",
};

export default function TicketForm({ onTicketCreated }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [error, setError] = useState("");
  const [categoryOverridden, setCategoryOverridden] = useState(false);
  const [priorityOverridden, setPriorityOverridden] = useState(false);

  useEffect(() => {
    const text = form.description.trim();
    if (text.length < 10) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsClassifying(true);
      try {
        const data = await classifyDescription(text);
        setForm((prev) => ({
          ...prev,
          category: categoryOverridden
            ? prev.category
            : data.suggested_category || prev.category,
          priority: priorityOverridden
            ? prev.priority
            : data.suggested_priority || prev.priority,
        }));
      } catch (e) {
        // Keep manual entry flow stable if classify fails.
      } finally {
        setIsClassifying(false);
      }
    }, 650);

    return () => clearTimeout(timeoutId);
  }, [form.description, categoryOverridden, priorityOverridden]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const created = await createTicket(form);
      onTicketCreated(created);
      setForm(INITIAL_FORM);
      setCategoryOverridden(false);
      setPriorityOverridden(false);
    } catch (e) {
      setError(e.message || "Could not submit ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="panel">
      <h2>Submit a Ticket</h2>
      <form onSubmit={onSubmit} className="grid-form">
        <label>
          Title
          <input
            name="title"
            value={form.title}
            onChange={onChange}
            required
            maxLength={200}
            placeholder="Short summary of the issue"
          />
        </label>

        <label>
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            required
            rows={5}
            placeholder="Describe the issue in detail"
          />
        </label>

        <div className="row">
          <label>
            Category
            <select
              name="category"
              value={form.category}
              onChange={(event) => {
                setCategoryOverridden(true);
                onChange(event);
              }}
            >
              {CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            Priority
            <select
              name="priority"
              value={form.priority}
              onChange={(event) => {
                setPriorityOverridden(true);
                onChange(event);
              }}
            >
              {PRIORITIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        {isClassifying && <p className="info-text">Classifying with LLM...</p>}
        {error && <p className="error-text">{error}</p>}

        <button type="submit" disabled={isSubmitting || isClassifying}>
          {isSubmitting ? "Submitting..." : "Submit Ticket"}
        </button>
      </form>
    </section>
  );
}
