import Nav from "@/components/Nav";

export default function TmpNav() {
  return (
    <main className="flex-1 bg-neutral-950 p-6">
      <p className="text-neutral-500 text-sm mb-4">signed-in nav below:</p>
      <Nav userEmail="gilsantos.engineer@gmail.com" />
    </main>
  );
}
