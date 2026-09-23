import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Portal | Pratiko Maroc",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div dir="ltr" className="min-h-screen bg-[#07090e] text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
      {children}
    </div>
  );
}
