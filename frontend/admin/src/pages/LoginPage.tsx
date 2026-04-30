import { FormEvent, useState } from "react";
import { authApi } from "../lib/api";
import type { User } from "../types";

export function LoginPage({ onAuthed }: { onAuthed: (user: User) => Promise<void> }) {
  const [phone, setPhone] = useState("9999900000");
  const [password, setPassword] = useState("admin12345");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const nextUser = await authApi.login(phone.trim(), password);
      if (nextUser.role !== "admin") throw new Error("Platform admin login required");
      await onAuthed(nextUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-copy">
          <div className="brand large">
            <div className="brand-mark">G</div>
            <div>
              <strong>Gymaxo</strong>
              <span>Platform Admin</span>
            </div>
          </div>
          <h1>All India gyms, owners, members, payments.</h1>
          <p>Private platform dashboard for seeing every membership and business signal.</p>
        </div>
        <form className="auth-form" onSubmit={submit}>
          <div className="login-heading">
            <p className="eyebrow">Platform Login</p>
            <h2>Sign in to super admin</h2>
            <span>This login is separate from owner accounts.</span>
          </div>
          <label>
            Admin ID
            <input value={phone} onChange={(event) => setPhone(event.target.value)} minLength={6} required />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required />
          </label>
          <div className="demo-login">
            <span>Admin login</span>
            <strong>ID: 9999900000</strong>
            <strong>Password: admin12345</strong>
          </div>
          {error ? <div className="notice error">{error}</div> : null}
          <button className="primary" disabled={busy}>
            {busy ? "Please wait..." : "Login to platform"}
          </button>
        </form>
      </section>
    </main>
  );
}
