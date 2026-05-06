import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const type = searchParams.get("type") || "drug"; // drug | symptom | region

    if (q.length < 1) return Response.json({ suggestions: [] });

    let results = [];

    if (type === "drug") {
      results = await sql(
        `SELECT DISTINCT drug_name AS value, COUNT(*) as count
         FROM signals
         WHERE LOWER(drug_name) LIKE LOWER($1)
         GROUP BY drug_name
         ORDER BY count DESC
         LIMIT 8`,
        [`%${q}%`],
      );
    } else if (type === "symptom") {
      results = await sql(
        `SELECT DISTINCT symptom AS value, COUNT(*) as count
         FROM signals
         WHERE symptom IS NOT NULL AND LOWER(symptom) LIKE LOWER($1)
         GROUP BY symptom
         ORDER BY count DESC
         LIMIT 8`,
        [`%${q}%`],
      );
    } else if (type === "region") {
      results = await sql(
        `SELECT DISTINCT region AS value, COUNT(*) as count
         FROM signals
         WHERE LOWER(region) LIKE LOWER($1)
         GROUP BY region
         ORDER BY count DESC
         LIMIT 8`,
        [`%${q}%`],
      );
    }

    return Response.json({ suggestions: results });
  } catch (error) {
    console.error("GET /api/signals/suggestions error:", error);
    return Response.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 },
    );
  }
}
