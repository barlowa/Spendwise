import { useAuth0 } from "@auth0/auth0-react";

export function meta() {
  return [
    { title: "Sign in | Spendwise" },
    { name: "description", content: "Sign in to your Spendwise account." },
  ];
}

export default function Login() {
  const { loginWithRedirect, logout, isAuthenticated, user, isLoading } =
    useAuth0();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <header className="mb-8 text-center">
          <p className="text-sm font-bold tracking-widest text-emerald-700">
            SPENDWISE
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {isAuthenticated
              ? "You are signed in to your account."
              : "Sign in to continue to your account."}
          </p>
        </header>

        {isLoading ? (
          <p className="text-center text-sm text-slate-600" role="status">
            Checking your sign-in status...
          </p>
        ) : isAuthenticated ? (
          <div className="space-y-5">
            <p className="text-center text-sm text-slate-700">
              Signed in as{" "}
              <span className="font-semibold">
                {user?.name ?? user?.email ?? "your account"}
              </span>
            </p>
            <button
              type="button"
              onClick={() =>
                logout({ logoutParams: { returnTo: window.location.origin } })
              }
              className="w-full rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => loginWithRedirect()}
              className="w-full rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() =>
                loginWithRedirect({
                  authorizationParams: { screen_hint: "signup" },
                })
              }
              className="w-full rounded-lg border border-emerald-700 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
            >
              Create an account
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
