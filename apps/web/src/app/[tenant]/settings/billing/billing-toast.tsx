"use client";

/**
 * Billing toast handler.
 *
 * Pattern: Shows toast based on URL query params after Stripe redirect.
 * Handles ?success=true and ?canceled=true from Stripe checkout.
 */

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useNotifications } from "@/components/notifications";

export function BillingToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { notify } = useNotifications();
  const hasShownRef = useRef(false);

  useEffect(() => {
    // Prevent showing multiple times on re-renders
    if (hasShownRef.current) return;

    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    if (success === "true") {
      hasShownRef.current = true;
      notify({
        type: "success",
        title: "Subscription updated",
        message: "Your subscription has been successfully updated.",
      });
      // Clean up URL
      router.replace(window.location.pathname, { scroll: false });
    } else if (canceled === "true") {
      hasShownRef.current = true;
      notify({
        type: "info",
        title: "Checkout canceled",
        message: "You can upgrade anytime from this page.",
      });
      // Clean up URL
      router.replace(window.location.pathname, { scroll: false });
    }
  }, [searchParams, notify, router]);

  return null;
}
