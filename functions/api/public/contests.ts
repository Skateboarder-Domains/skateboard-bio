/**
 * GET /api/public/contests
 * 
 * Returns contest results for a skater
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

    console.log(`[Contests API] Fetching contests for host: ${host}, year: ${year || 'all'}`);

    let result;
    if (year) {
      result = await sql`
        SELECT 
          c.id,
          c.contest_name,
          c.contest_series,
          c.event_type,
          c.contest_date,
          c.contest_year,
          c.location,
          c.placement,
          c.placement_text,
          c.prize_money,
          c.currency,
          c.notes,
          c.media_url,
          c.created_at
        FROM contests c
        JOIN domains d ON c.skater_id = d.skater_id
        WHERE d.host = ${host} AND c.contest_year = ${parseInt(year)}
        ORDER BY c.contest_date DESC, c.placement ASC;
      `;
    } else {
      result = await sql`
        SELECT 
          c.id,
          c.contest_name,
          c.contest_series,
          c.event_type,
          c.contest_date,
          c.contest_year,
          c.location,
          c.placement,
          c.placement_text,
          c.prize_money,
          c.currency,
          c.notes,
          c.media_url,
          c.created_at
        FROM contests c
        JOIN domains d ON c.skater_id = d.skater_id
        WHERE d.host = ${host}
        ORDER BY c.contest_date DESC, c.placement ASC;
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
    console.error('[Contests API] Error:', error);
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
