import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Team Task Manager",
  description: "Full-stack project and task management app with role-based access"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
