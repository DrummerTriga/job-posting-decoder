export default async function TmpSlow() {
  await new Promise((r) => setTimeout(r, 2000));
  return <main className="flex-1 p-10 text-neutral-100">slow page done</main>;
}
