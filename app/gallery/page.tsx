import Image from "next/image";

async function getGalleryItems() {
  try {
    const fs = require("fs/promises");
    const path = require("path");
    const dataFile = path.join(process.cwd(), "data", "clinic-info.json");
    const data = await fs.readFile(dataFile, "utf-8");
    const parsed = JSON.parse(data);
    return parsed.gallery || [];
  } catch (error) {
    console.error("Error loading gallery:", error);
    return [];
  }
}

export default async function GalleryPage() {
  const items = await getGalleryItems();

  return (
    <section>
      <h1 className="text-2xl font-bold mb-4">Noerdental Gallery</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(
          (
            it: { before: string; after: string; label: string },
            idx: number
          ) => (
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
          )
        )}
      </div>
    </section>
  );
}
