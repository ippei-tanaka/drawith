import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { getUser } from "@/lib/auth/actions";
import { db } from "@/lib/db/db";
import { userProfile } from "@/lib/db/schema";
import ProfileForm from "./ProfileForm";
import "../../../styles/profile.css";

export default async function UserProfilePage() {

  const user = await getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const [existingProfile] = await db
    .select()
    .from(userProfile)
    .where(eq(userProfile.user_id, user.id));

  // Every user gets a profile the first time they visit this page.
  const profile =
    existingProfile ??
    (
      await db
        .insert(userProfile)
        .values({
          id: randomUUID(),
          username: user.id,
          user_id: user.id,
          first_name: user.name,
          last_name: "",
        })
        .returning()
    )[0];

  return <ProfileForm profile={profile} />;
}
