import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbf9fe] px-4 text-[#1e0a45]">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-[#1e0a45]">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-[#1e0a45]">Page not found</h2>
        <p className="mt-2 text-sm text-slate-600">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-[#240b4a] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#35106b]"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbf9fe] px-4 text-[#1e0a45]">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-[#1e0a45]">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-[#240b4a] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#35106b]"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-purple-200 bg-white px-5 py-2 text-sm font-medium text-[#1e0a45] transition-colors hover:bg-purple-50"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Talk'n'Bit" },
      { name: "description", content: "WhatsApp English correction bot control panel." },
      { property: "og:title", content: "Talk'n'Bit" },
      { property: "og:description", content: "WhatsApp English correction bot control panel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=Space+Grotesk:wght@500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="bg-[#fbf9fe] min-h-full">
      <head>
        <HeadContent />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              #lovable-badge,
              aside#lovable-badge,
              [id*="lovable-badge"],
              [class*="lovable-badge"],
              [aria-label*="Lovable"],
              [aria-label*="lovable"],
              [aria-label*="Edit with Lovable"],
              a[href*="lovable.dev"][target="_blank"],
              div[data-lovable-badge] {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
                width: 0 !important;
                height: 0 !important;
                position: absolute !important;
                z-index: -999999 !important;
              }
            `,
          }}
        />
      </head>
      <body className="bg-[#fbf9fe] min-h-full text-[#1e0a45] antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const purgeLovableBadge = () => {
      const selectors = [
        "#lovable-badge",
        "aside#lovable-badge",
        '[id*="lovable-badge"]',
        '[class*="lovable-badge"]',
        '[aria-label*="Lovable"]',
        '[aria-label*="lovable"]',
        '[aria-label*="Edit with Lovable"]',
        'a[href*="lovable.dev"][target="_blank"]',
        'div[data-lovable-badge]',
      ];
      selectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => {
          el.remove();
        });
      });
    };

    purgeLovableBadge();
    const observer = new MutationObserver(purgeLovableBadge);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Toaster />
      <Footer />
    </QueryClientProvider>
  );
}

function Footer() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // Suppress fallback footer on pages that provide their own custom footers or full-screen dashboard
  if (
    pathname === "/" ||
    pathname === "/privacy" ||
    pathname === "/terms" ||
    pathname.startsWith("/admin")
  ) {
    return null;
  }

  return (
    <footer className="border-t border-purple-100/80 bg-[#fbf9fe] py-6">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-5 text-xs text-slate-500 sm:flex-row">
        <span>Talk'n'Bit</span>
        <div className="flex items-center gap-4">
          <Link
            to="/terms"
            className="underline underline-offset-4 transition-colors hover:text-[#1e0a45]"
          >
            Terms of Service
          </Link>
          <Link
            to="/privacy"
            className="underline underline-offset-4 transition-colors hover:text-[#1e0a45]"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
