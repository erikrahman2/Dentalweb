import Link from "next/link";
import { getSession } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
import { redirect } from "next/navigation";

export default async function DentistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  
  if (!session || session.role !== "DOCTOR") {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Fixed Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Noerdental</h1>
        </div>

        {/* Sidebar Content - Using CSS Grid for better layout control */}
        <div className="grid grid-rows-[1fr,auto] h-[calc(100%-4rem)]">
          {/* Navigation Section */}
          <nav className="p-4">
            <div className="space-y-1">
              <Link
                href="/dentist/patients"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-900 rounded-md bg-gray-50"
              >
                <svg
                  className="w-4 h-4 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Patient Records
              </Link>
            </div>
          </nav>

          {/* Footer Section */}
          <div className="border-t border-gray-200">
            <div className="p-4">
              <div className="mb-4">
                <div className="font-medium text-sm text-gray-900">{session.name}</div>
                <div className="mt-1">
                  <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                    {session.role}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Link
                  href="/"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50"
                >
                  <svg
                    className="w-4 h-4 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Back to Website
                </Link>
                <LogoutButton className="flex w-full items-center px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50">
                  <svg
                    className="w-4 h-4 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </LogoutButton>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}