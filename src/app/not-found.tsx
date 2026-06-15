import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080706] px-5 text-[#e7e3e0]">
      <div className="max-w-xl text-center">
        <p className="text-xs uppercase tracking-[0.28em] text-[#a69c96]">404</p>
        <h1 className="serif mt-5 text-6xl leading-none">Страница не найдена</h1>
        <p className="mt-6 leading-7 text-[#cbc9c8]">
          Вернитесь на главную презентацию интерьера.
        </p>
        <Link
          className="mt-8 inline-flex min-h-11 items-center justify-center border border-[#e7e3e0]/40 bg-[#e7e3e0] px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#080706]"
          href="/"
        >
          На главную
        </Link>
      </div>
    </main>
  );
}
