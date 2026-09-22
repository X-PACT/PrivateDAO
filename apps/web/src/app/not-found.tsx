import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-white px-6 py-20 text-[#10233f]">
      <section className="max-w-xl text-center">
        <div className="text-sm font-bold uppercase tracking-[0.22em] text-[#175cd3]">404 · PrivateDAO</div>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">This page is not available.</h1>
        <p className="mt-5 text-base leading-8 text-[#5d6d82]">The link may be old, private, or mistyped. Return to the commercial entry point and choose a current workflow.</p>
        <Link href="/" className="mt-8 inline-flex rounded-full bg-[#175cd3] px-5 py-3 text-sm font-semibold text-white">Return to PrivateDAO</Link>
      </section>
    </main>
  );
}
