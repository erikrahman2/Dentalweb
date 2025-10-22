import Link from "next/link";

export default function ClinicAdminPage() {
  const sections = [
    {
      title: "Homepage",
      description:
        "Manage hero section, about content, and call-to-action on the homepage",
      href: "/admin/clinic/homepage",
    },
    {
      title: "Services Management",
      description: "Add, edit, and manage dental services and pricing",
      href: "/admin/services",
    },
    {
      title: "About Us",
      description: "Configure  values, and company description",
      href: "/admin/clinic/about",
    },
    {
      title: "Dentists",
      description: "Manage doctor profiles and information",
      href: "/admin/clinic/doctors",
    },
    {
      title: "FAQs",
      description: "Add, edit, and remove frequently asked questions",
      href: "/admin/clinic/faqs",
    },
    {
      title: "Gallery",
      description: "Upload and organize before/after treatment images",
      href: "/admin/clinic/gallery",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 bg-white">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-black">
          Clinic Information Management
        </h1>
      </div>

      <div className="border border-black">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {sections.map((section, index) => (
            <Link
              key={section.href}
              href={section.href}
              className={`block hover:bg-gray-50 lg:hover:bg-gray-200 transition-colors p-8 ${
                index < 4 ? "border-b border-black" : ""
              } ${index % 2 === 0 ? "border-r border-black" : ""}`}
            >
              <h2 className="text-2xl font-bold text-black mb-3">
                {section.title}
              </h2>
              <div className="flex items-start gap-2 text-sm text-black">
                <span className="font-semibold">Desc: </span>
                <span>{section.description}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
