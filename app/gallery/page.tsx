import Image from "next/image";

const items = [
  // Replace with actual before-after image pairs in /public/uploads
  {
    before: "/uploads/service-1758708594360.jpg",
    after: "/uploads/service-1758728297205.jpg",
    label: "Whitening",
  },
];

export default function GalleryPage() {
  return (
    <section>
      <h1 className="text-2xl font-bold mb-4">Noerdental Gallery</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((it, idx) => (
          <div key={idx} className="border rounded-lg p-3 bg-white shadow-sm">
            <div className="text-sm font-medium mb-2">{it.label}</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative w-full aspect-[4/3]">
                <Image
                  src={it.before}
                  alt={`${it.label} before`}
                  fill
                  className="object-cover rounded"
                />
                <div className="absolute bottom-1 left-1 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded">
                  Before
                </div>
              </div>
              <div className="relative w-full aspect-[4/3]">
                <Image
                  src={it.after}
                  alt={`${it.label} after`}
                  fill
                  className="object-cover rounded"
                />
                <div className="absolute bottom-1 left-1 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded">
                  After
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
