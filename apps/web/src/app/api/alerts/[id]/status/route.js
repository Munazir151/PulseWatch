import sql from "@/app/api/utils/sql";

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;
    if (!status)
      return Response.json({ error: "status is required" }, { status: 400 });
    const rows =
      await sql`UPDATE alerts SET status = ${status} WHERE id = ${id} RETURNING *`;
    if (!rows.length)
      return Response.json({ error: "Alert not found" }, { status: 404 });
    return Response.json({ alert: rows[0] });
  } catch (error) {
    console.error("PUT /api/alerts/[id]/status error:", error);
    return Response.json({ error: "Failed to update alert" }, { status: 500 });
  }
}
