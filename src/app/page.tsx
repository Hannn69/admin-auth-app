import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-black px-6">
      <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-10 text-white shadow-2xl">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
          Secure Admin Portal
        </p>
        <h1 className="mt-4 text-4xl font-semibold">
          Authentication with JWT + Refresh Tokens
        </h1>
        <p className="mt-4 max-w-xl text-sm text-zinc-300">
          Register, sign in, and access the protected admin dashboard. Sessions
          are protected with short-lived access tokens and rotating refresh
          tokens stored server-side.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900"
            href="/login"
          >
            Sign in
          </Link>
          <Link
            className="rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white"
            href="/register"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
