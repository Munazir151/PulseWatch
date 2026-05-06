import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const sources = await sql`SELECT * FROM sources ORDER BY id ASC`;
    return Response.json({ sources });
  } catch (error) {
    console.error("GET /api/sources error:", error);
    return Response.json({ error: "Failed to fetch sources" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      source_type,
      status = "active",
      latency_mode = "daily",
    } = body;
    if (!name || !source_type)
      return Response.json(
        { error: "name and source_type are required" },
        { status: 400 },
      );
    const rows = await sql`
      INSERT INTO sources (name, source_type, status, latency_mode, signals_found_count)
      VALUES (${name}, ${source_type}, ${status}, ${latency_mode}, 0)
      RETURNING *
    `;
    return Response.json({ source: rows[0] }, { status: 201 });
  } catch (error) {
    console.error("POST /api/sources error:", error);
    return Response.json({ error: "Failed to create source" }, { status: 500 });
  }
}
