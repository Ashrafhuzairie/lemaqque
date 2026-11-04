import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, ArrowLeft, LockKeyhole } from "lucide-react";
import { z } from "zod";
import { Brand } from "../components/Shell";
import { Button } from "../components/ui/button";
import { Field, Notice } from "../components/common";
import { supabase } from "../lib/repository";
import { useStore } from "../lib/store";
import { accountPath } from "../lib/auth-navigation";
export default function Auth() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState(
    params.get("mode") === "signup"
      ? "signup"
      : params.get("mode") === "recovery"
        ? "update"
        : "login",
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { enterCloud, accountId } = useStore();
  const destination = accountPath(params.get("next"));
  const navigate = useNavigate();
  useEffect(() => {
    if (accountId && mode !== "update")
      navigate(destination, { replace: true });
  }, [accountId, destination, mode, navigate]);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!supabase) {
      setError("Sign-in is unavailable right now. Please try again later.");
      return;
    }
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    try {
      if (mode !== "update") z.email().parse(email);
      if (mode !== "reset")
        z.string()
          .min(10, "Use at least 10 characters.")
          .max(128)
          .parse(password);
      setBusy(true);
      if (mode === "update") {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setMessage("Password updated. You can continue to your dashboard.");
      } else if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: location.origin + "/auth?mode=recovery",
        });
        if (error) throw error;
        setMessage(
          "If that account exists, a recovery email will arrive shortly.",
        );
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: location.origin + "/app" },
        });
        if (error) throw error;
        if (data.session) {
          enterCloud();
          navigate(destination === "/app" ? "/app/settings" : destination);
        } else
          setMessage("Check your email to confirm your account, then sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        enterCloud();
        navigate(destination);
      }
    } catch (e) {
      setError(
        e instanceof z.ZodError ? e.issues[0].message : (e as Error).message,
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-page">
      <div className="auth-story">
        <Brand />
        <div>
          <h1>
            A stronger you.
            <br />
            <em>A daily practice.</em>
          </h1>
          <p>Your training, nutrition, and progress. One considered space.</p>
        </div>
        <span>TRAIN. FUEL. EVOLVE.</span>
      </div>
      <main className="auth-form">
        <Link to="/" className="text-link">
          <ArrowLeft size={16} />
          Back to LÉMAQQUE
        </Link>
        <div className="auth-heading">
          <LockKeyhole size={28} />
          <h2>
            {mode === "signup"
              ? "Start your journey."
              : mode === "reset"
                ? "Reset your password."
                : mode === "update"
                  ? "Choose a new password."
                  : "Welcome back."}
          </h2>
          <p>
            {mode === "signup"
              ? "Build your strongest self, one session at a time."
              : "Pick up where you left off."}
          </p>
        </div>
        {!supabase && (
          <Notice>
            Sign-in is unavailable right now. Please try again later.
          </Notice>
        )}
        <form onSubmit={submit}>
          {mode !== "update" && (
            <Field label="Email">
              <input type="email" name="email" autoComplete="email" required />
            </Field>
          )}
          {mode !== "reset" && (
            <Field label="Password" hint="At least 10 characters.">
              <input
                name="password"
                type="password"
                minLength={10}
                maxLength={128}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                required
              />
            </Field>
          )}
          {error && <Notice error>{error}</Notice>}
          {message && <Notice>{message}</Notice>}
          <Button type="submit" disabled={busy}>
            {busy
              ? "Please wait…"
              : mode === "signup"
                ? "Create account"
                : mode === "reset"
                  ? "Send recovery email"
                  : mode === "update"
                    ? "Update password"
                    : "Sign in"}
            <ArrowRight size={17} />
          </Button>
        </form>
        <div className="auth-options">
          <button
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setMessage("");
              setError("");
            }}
          >
            {mode === "login"
              ? "New here? Create an account"
              : "Already have an account? Sign in"}
          </button>
          <button
            onClick={() => {
              setMode("reset");
              setError("");
            }}
          >
            Forgot password?
          </button>
        </div>
        {mode === "update" && (
          <Button asChild variant="outline">
            <Link to={destination}>Continue to dashboard</Link>
          </Button>
        )}
      </main>
    </div>
  );
}
