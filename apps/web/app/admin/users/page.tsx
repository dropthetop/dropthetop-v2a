import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Users | Admin",
  robots: { index: false, follow: false },
};

export default function UsersPage() {
  return (
    <div>
      <h1 className="font-display text-3xl md:text-4xl mb-2">Users</h1>
      <p className="text-muted-foreground">Coming soon.</p>
    </div>
  );
}
