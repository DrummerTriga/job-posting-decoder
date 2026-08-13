import LogoutButton from "@/components/LogoutButton";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Dashboard privado</h1>
        <LogoutButton />
      </div>
    </div>
  );
}