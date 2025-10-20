"use client";

import { useEffect } from "react";
import Script from "next/script";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const supabase = createClient();

  useEffect(() => {
    (window as any).handleSignInWithGoogle = async (response: any) => {
      await supabase.auth.signInWithIdToken({
        provider: "google",
        token: response.credential,
      });
      location.href = "/";
    };
  }, [supabase]);

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" async />
      <div
        id="g_id_onload"
        data-client_id={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
        data-context="signin"
        data-ux_mode="popup"
        data-callback="handleSignInWithGoogle"
        data-auto_prompt="false"
        data-use_fedcm_for_prompt="true"
      />
      <div
        className="g_id_signin"
        data-type="standard"
        data-shape="rectangular"
        data-theme="outline"
        data-text="signin_with"
        data-size="large"
        data-logo_alignment="left"
      />
    </>
  );
}
