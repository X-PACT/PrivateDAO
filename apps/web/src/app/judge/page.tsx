import { redirect } from "next/navigation";

export default function JudgePage() {
  redirect("/proof?judge=1");
}
