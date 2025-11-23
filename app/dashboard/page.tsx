import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/DashboardClient";
import ExportButtons from "@/components/ExportButtons";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Ma Bibliothèque</h1>
            <p className="text-gray-600 mt-1">Suivez vos lectures et votre progression.</p>
        </div>

        {/* Export Controls */}
        <div className="flex flex-col items-end">
             <p className="text-xs text-gray-500 mb-1">Exporter mes données</p>
             <ExportButtons />
        </div>
      </div>

      <DashboardClient />
    </div>
  );
}
