import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get("severity");
    const status = searchParams.get("status");
    const platform = searchParams.get("platform");
    const region = searchParams.get("region");
    const language = searchParams.get("language");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = `SELECT * FROM signals WHERE 1=1`;
    const values = [];
    let idx = 1;

    if (severity) {
      query += ` AND severity = $${idx++}`;
      values.push(severity);
    }
    if (status) {
      query += ` AND status = $${idx++}`;
      values.push(status);
    }
    if (platform) {
      query += ` AND platform = $${idx++}`;
      values.push(platform);
    }
    if (region) {
      query += ` AND region = $${idx++}`;
      values.push(region);
    }
    if (language) {
      query += ` AND language = $${idx++}`;
      values.push(language);
    }

    query += ` ORDER BY detected_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    values.push(limit, offset);

    const signals = await sql(query, values);
    return Response.json({ signals, total: signals.length });
  } catch (error) {
    console.error("GET /api/signals error:", error);
    return Response.json({ error: "Failed to fetch signals" }, { status: 500 });
  }
}
