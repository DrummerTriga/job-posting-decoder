// Shared by every place that lets the user tag an analysis: the dashboard
// cards, the detail modal and the analyze page.
export async function updateJobCategory(id: string, category: string) {
  try {
    const res = await fetch(`/api/jobs/${id}/category`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { ok: false, error: data.error || "Failed to update the tag." };
    }

    return { ok: true, error: "" };
  } catch {
    return { ok: false, error: "Network error while updating the tag." };
  }
}
