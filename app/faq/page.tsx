async function getFaqs() {
  try {
    const fs = require("fs/promises");
    const path = require("path");
    const dataFile = path.join(process.cwd(), "data", "clinic-info.json");
    const data = await fs.readFile(dataFile, "utf-8");
    const parsed = JSON.parse(data);
    return parsed.faqs || [];
  } catch (error) {
    console.error("Error loading FAQs:", error);
    return [];
  }
}

export default async function FaqPage() {
  const faqs = await getFaqs();

  return (
    <section className="min-h-screen">
      <h1 className="text-[1.2rem] mb-4 text-gray-600">
        Temukan jawaban atas pertanyaan umum tentang layanan gigi kami,
        persiapan sebelum perawatan, pembayaran, serta kebijakan klinik. Jika
        membutuhkan info lebih lanjut, hubungi tim kami yang siap membantu.
      </h1>
      <div className="space-y-0.5">
        {faqs.map((f: { q: string; a: string }, i: number) => (
          <details key={i} className="group p-4 border-b border-gray-400">
            <summary className="cursor-pointer font-medium text-gray-800 flex items-start justify-between list-none transition-colors hover:text-gray-600">
              <span className="pr-4">{f.q}</span>
              <span className="text-sm text-gray-500 flex-shrink-0 transition-transform duration-300 group-open:rotate-180">
                {String(i + 1).padStart(2, "0")}
              </span>
            </summary>
            <div className="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-all duration-300 ease-out">
              <p className="mt-2 text-gray-600 overflow-hidden opacity-0 translate-y-[-10px] group-open:opacity-100 group-open:translate-y-0 transition-all duration-300">
                {f.a}
              </p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
