export default function FaqPage() {
  const faqs = [
    {
      q: "Apakah perlu janji temu terlebih dahulu?",
      a: "Disarankan untuk membuat janji agar kami dapat menyiapkan slot waktu yang sesuai.",
    },
    {
      q: "Metode pembayaran apa yang tersedia?",
      a: "Tunai, transfer, dan beberapa dompet digital (tanyakan ke resepsionis).",
    },
    {
      q: "Apakah ada konsultasi awal?",
      a: "Ya, tersedia konsultasi untuk menentukan rencana perawatan terbaik.",
    },
  ];

  return (
    <section>
      <h1 className="text-2xl font-bold mb-4">FAQ</h1>
      <div className="space-y-4">
        {faqs.map((f, i) => (
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
