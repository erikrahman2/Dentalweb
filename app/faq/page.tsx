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
    <section>
      <h1 className="text-[1.2rem]  mb-4">
        Temukan jawaban atas pertanyaan umum tentang layanan gigi kami,
        persiapan sebelum perawatan, pembayaran, serta kebijakan klinik. Jika
        membutuhkan info lebih lanjut, hubungi tim kami yang siap membantu.
      </h1>
      <div className="space-y-0.5">
        {faqs.map((f: { q: string; a: string }, i: number) => (
          <details key={i} className="group border rounded-md p-4">
            <summary className="cursor-pointer font-medium text-gray-800">
              {f.q}
            </summary>
            <p className="mt-2 text-gray-600">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
