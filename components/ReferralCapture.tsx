"use client";

import { useEffect } from "react";
import { REFERRAL_COOKIE } from "@/lib/referral";

export default function ReferralCapture() {
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) {
      document.cookie = `${REFERRAL_COOKIE}=${encodeURIComponent(ref)}; max-age=${60 * 60 * 24 * 30}; path=/`;
    }
  }, []);

  return null;
}
