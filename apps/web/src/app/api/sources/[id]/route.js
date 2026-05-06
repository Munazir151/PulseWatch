import sql from "@/app/api/utils/sql";

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, latency_mode, name } = body;

    const setClauses = [];
    const values = [];
    let idx = 1;

    if (status !== undefined) {
      setClauses.push(`status = $${idx++}`);
      values.push(status);
    }
    if (latency_mode !== undefined) {
      setClauses.push(`latency_mode = $${idx++}`);
      values.push(latency_mode);
    }
    if (name !== undefined) {
      setClauses.push(`name = $${idx++}`);
      values.push(name);
    }

    if (setClauses.length === 0)
      return Response.json({ error: "No fields to update" }, { status: 400 });

    values.push(id);
    const query = `UPDATE sources SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING *`;
    const rows = await sql(query, values);

    if (!rows.length)
      return Response.json({ error: "Source not found" }, { status: 404 });
    return Response.json({ source: rows[0] });
  } catch (error) {
    console.error("PUT /api/sources/[id] error:", error);
    return Response.json({ error: "Failed to update source" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await sql`DELETE FROM sources WHERE id = ${id}`;
    return Response.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/sources/[id] error:", error);
    return Response.json({ error: "Failed to delete source" }, { status: 500 });
  }
}
