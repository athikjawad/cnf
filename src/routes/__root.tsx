import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppTopbar } from "@/components/AppTopbar";
import { RoleProvider } from "@/lib/role-context";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SFI Platform — C&F Operations for Standard Freight Inc." },
      {
        name: "description",
        content:
          "SFI Platform is the operating system for Standard Freight Incorporation — manage Jobs, Expenses, Bills, Transport, Accounts and Reports for Chittagong, Benapole and HSIA operations.",
      },
      { property: "og:title", content: "SFI Platform — C&F Operations for Standard Freight Inc." },
      {
        property: "og:description",
        content:
          "Replace WhatsApp + Excel + paper. Run C&F operations from one calm, modern dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "SFI Platform — C&F Operations for Standard Freight Inc." },
      { name: "description", content: "A C&F operations platform digitizing logistics, customs, and finance for Bangladeshi import/export businesses." },
      { property: "og:description", content: "A C&F operations platform digitizing logistics, customs, and finance for Bangladeshi import/export businesses." },
      { name: "twitter:description", content: "A C&F operations platform digitizing logistics, customs, and finance for Bangladeshi import/export businesses." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/6fcb63ea-938c-42e3-97e9-e1868265ff00/id-preview-9473a458--71a73fee-0ffe-4b9f-96e9-6fad316ec85d.lovable.app-1777748543251.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/6fcb63ea-938c-42e3-97e9-e1868265ff00/id-preview-9473a458--71a73fee-0ffe-4b9f-96e9-6fad316ec85d.lovable.app-1777748543251.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <RoleProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <AppTopbar />
            <main className="flex-1 min-w-0">
              <Outlet />
            </main>
          </div>
        </div>
        <Toaster />
      </SidebarProvider>
    </RoleProvider>
  );
}
