import type { Metadata } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { STACK_CONFIGURED, stackServerApp } from "@/stack";
import { DEV_AUTH_BYPASS } from "@/lib/devAuth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vínová kalkulačka — hodnocení vín (OIV 100)",
  description:
    "Osobní databáze degustačních hodnocení vín podle 100-bodového systému OIV 2009.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Mount Stack's provider only when cloud auth is configured (and not in
  // dev-bypass). Otherwise the app runs purely in local mode without Stack.
  const useStack = STACK_CONFIGURED && !DEV_AUTH_BYPASS;
  return (
    <html lang="cs">
      <body>
        {useStack ? (
          <StackProvider app={stackServerApp}>
            <StackTheme>{children}</StackTheme>
          </StackProvider>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
