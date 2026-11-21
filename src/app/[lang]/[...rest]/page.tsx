import { notFound } from "next/navigation";

/** Any unknown path under /en or /ar renders the localized not-found page with a 404. */
export default function CatchAll() {
  notFound();
}
