"use client";

import Script from "next/script";
import { useEffect, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackMetaPageView, DEFAULT_META_PIXEL_ID } from "@/lib/meta-pixel";

interface PixelScriptsProps {
  metaPixelId?: string;
  tiktokPixelId?: string;
}

/**
 * Tracks PageView on client-side route changes in Next.js App Router.
 * Skips the very first mount because the inline script already sends the initial PageView.
 */
function RouteChangeListener() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    trackMetaPageView();
  }, [pathname, searchParams]);

  return null;
}

export const DEFAULT_TIKTOK_PIXEL_ID = "DARU5VRC77U5PB60B3AG";

export default function PixelScripts({
  metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || DEFAULT_META_PIXEL_ID,
  tiktokPixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || DEFAULT_TIKTOK_PIXEL_ID,
}: PixelScriptsProps) {
  return (
    <>
      {/* Route Change Tracker for SPA navigation */}
      <Suspense fallback={null}>
        <RouteChangeListener />
      </Suspense>

      {/* TikTok Pixel */}
      {tiktokPixelId && (
        <Script
          id="tiktok-pixel-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
                var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
                ;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};

                ttq.load('${tiktokPixelId}');
                ttq.page();
              }(window, document, 'ttq');
            `,
          }}
        />
      )}
    </>
  );
}
