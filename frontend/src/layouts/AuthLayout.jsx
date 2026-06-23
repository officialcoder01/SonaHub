export default function AuthLayout({ children }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
