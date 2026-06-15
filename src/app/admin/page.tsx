import type { Metadata } from "next";
import { AdminCRM } from "./AdminCRM";

export const metadata: Metadata = {
  title: "CRM | ADV Interiors",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminCRM />;
}
