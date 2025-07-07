export const runtime = 'edge';

import { ReactNode } from "react";
import Footer from "@/components/layout/footer";

export default function DefaultLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <main>{children}</main>
      <Footer />
    </>
  );
}
