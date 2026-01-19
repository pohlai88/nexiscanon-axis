import { submitMessage } from "../actions";
import Link from "next/link";

export default function DemoPage() {
  return (
    <div style={{ maxWidth: "40ch", margin: "2rem auto", padding: "1rem" }}>
      <h1>Server Action demo</h1>
      <form
        action={submitMessage}
        style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
      >
        <label htmlFor="message">Message</label>
        <input id="message" name="message" type="text" required />
        <button type="submit">Submit</button>
      </form>
      <p style={{ marginTop: "1rem" }}>
        <Link href="/">← Home</Link>
      </p>
    </div>
  );
}
