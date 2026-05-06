import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get("severity");
    const status = searchParams.get("status");
    const region = searchParams.get("region");
    const alert_type = searchParams.get("alert_type");

    let query = `SELECT a.*, s.post_text_masked, s.confidence_score, s.platform, s.language 
                 FROM alerts a LEFT JOIN signals s ON a.signal_id = s.id WHERE 1=1`;
    const values = [];
    let idx = 1;

    if (severity) {
      query += ` AND a.severity = $${idx++}`;
      values.push(severity);
    }
    if (status) {
      query += ` AND a.status = $${idx++}`;
      values.push(status);
    }
    if (region) {
      query += ` AND a.region = $${idx++}`;
      values.push(region);
    }
    if (alert_type) {
      query += ` AND a.alert_type = $${idx++}`;
      values.push(alert_type);
    }

    query += ` ORDER BY a.created_at DESC`;

    const alerts = await sql(query, values);
    return Response.json({ alerts });
  } catch (error) {
    console.error("GET /api/alerts error:", error);
    return Response.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}
