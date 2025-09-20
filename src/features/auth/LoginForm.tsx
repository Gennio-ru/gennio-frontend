import { FormEvent, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { loginThunk, meThunk } from "./authSlice";
import Input from "@/shared/Input";
import Button from "@/shared/Button";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const status = useAppSelector((s) => s.auth.status);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await dispatch(loginThunk({ email, password })).unwrap();
      await dispatch(meThunk());
      navigate("/");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError(e?.message ?? "Login failed");
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-sm space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
    >
      <h1 className="text-lg font-semibold">Sign in</h1>
      {error && (
        <div className="rounded-lg bg-red-50 p-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <Input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button disabled={status === "loading"}>
        {status === "loading" ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
