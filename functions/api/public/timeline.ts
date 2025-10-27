/**
 * GET /api/public/timeline
 * 
 * Returns career timeline events for a skater
 * Query params: 
 *   - host=tonyhawk.bio (required)
 *   - year=2020 (optional filter)
 */

export const onRequestGet = async ({ request, env }: any) => {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(env.NEON_DATABASE_URL);

    const url = new URL(request.url);
    let host = url.searchParams.get('host') || request.headers.get('host')?.replace('www.', '') || '';
    const year = url.searchParams.get('year');
    
    host = host.split(':')[0];

    console.log(`[Timeline API] Fetching timeline for host: ${host}, year: ${year || 'all'}`);

    let result;
    if (year) {
      result = await sql`
        SELECT 
          t.id,
          t.event_date,
          t.event_year,
          t.title,
          t.description,
          t.event_type,
          t.location,
          t.media_url,
          t.created_at
        FROM timeline t
        JOIN domains d ON t.skater_id = d.skater_id
        WHERE d.host = ${host} AND t.event_year = ${parseInt(year)}
        ORDER BY t.event_date DESC, t.sort_order NULLS LAST;
      `;
    } else {
      result = await sql`
        SELECT 
          t.id,
          t.event_date,
          t.event_year,
          t.title,
          t.description,
          t.event_type,
          t.location,
          t.media_url,
          t.created_at
        FROM timeline t
        JOIN domains d ON t.skater_id = d.skater_id
        WHERE d.host = ${host}
        ORDER BY t.event_date DESC, t.sort_order NULLS LAST;
      `;
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error: any) {
    console.error('[Timeline API] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
};
