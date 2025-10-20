"use client";
import { createClient } from "@/utils/supabase/client";

export default function SignOutButton() {
  const supabase = createClient();

  return (
    <button
      className="inline-flex items-center rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 transition"
      onClick={async () => {
        await supabase.auth.signOut();
        location.href = "/login";
      }}
    >
      Sign out
    </button>
  );
}
