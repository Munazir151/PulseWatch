import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const [
      severityCounts,
      statusCounts,
      recentTrends,
      topDrugs,
      platformBreakdown,
      regionBreakdown,
    ] = await sql.transaction([
      sql`SELECT severity, COUNT(*) as count FROM signals GROUP BY severity`,
      sql`SELECT status, COUNT(*) as count FROM signals GROUP BY status`,
      sql`
        SELECT 
          DATE_TRUNC('day', detected_at) as day,
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE severity = 'critical') as critical,
          COUNT(*) FILTER (WHERE severity = 'high') as high,
          COUNT(*) FILTER (WHERE severity = 'medium') as medium,
          COUNT(*) FILTER (WHERE severity = 'low') as low
        FROM signals
        WHERE detected_at >= NOW() - INTERVAL '14 days'
        GROUP BY DATE_TRUNC('day', detected_at)
        ORDER BY day ASC
      `,
      sql`SELECT drug_name, COUNT(*) as mention_count FROM signals GROUP BY drug_name ORDER BY mention_count DESC LIMIT 8`,
      sql`SELECT platform, COUNT(*) as count FROM signals GROUP BY platform ORDER BY count DESC`,
      sql`
        SELECT 
          region,
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE severity = 'critical') as critical,
          COUNT(*) FILTER (WHERE severity = 'high') as high,
          COUNT(*) FILTER (WHERE severity = 'medium') as medium,
          COUNT(*) FILTER (WHERE severity = 'low') as low
        FROM signals
        GROUP BY region
        ORDER BY total DESC
      `,
    ]);

    const alertStats = await sql`
      SELECT severity, COUNT(*) as count FROM alerts WHERE status IN ('open', 'escalated') GROUP BY severity
    `;

    const totalSignals = await sql`SELECT COUNT(*) as total FROM signals`;
    const totalAlerts =
      await sql`SELECT COUNT(*) as total FROM alerts WHERE status = 'open'`;

    return Response.json({
      severityCounts,
      statusCounts,
      recentTrends,
      topDrugs,
      platformBreakdown,
      regionBreakdown,
      alertStats,
      totalSignals: parseInt(totalSignals[0]?.total || 0),
      totalAlerts: parseInt(totalAlerts[0]?.total || 0),
    });
  } catch (error) {
    console.error("GET /api/dashboard/stats error:", error);
    return Response.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
