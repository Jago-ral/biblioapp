import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ChallengesClient from "@/components/ChallengesClient";

export default async function ChallengesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Challenges & Badges</h1>
            <p className="text-gray-600 mt-2">Débloquez des trophées en lisant !</p>
        </div>

        <ChallengesClient />
    </div>
  );
}
