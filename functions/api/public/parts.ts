/**
 * GET /api/public/parts
 * 
 * Returns video parts for a skater
 * Query params: 
 *   - host=tonyhawk.bio (required)
 */

export const onRequestGet = async ({ request, env }: any) => {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(env.NEON_DATABASE_URL);

    const url = new URL(request.url);
    let host = url.searchParams.get('host') || request.headers.get('host')?.replace('www.', '') || '';
    
    host = host.split(':')[0];

    console.log(`[Parts API] Fetching video parts for host: ${host}`);

    const result = await sql`
      SELECT 
        p.id,
        p.video_name,
        p.video_company,
        p.release_year,
        p.release_date,
        p.part_title,
        p.video_url,
        p.thumbnail_url,
        p.duration,
        p.is_featured,
        p.created_at
      FROM parts p
      JOIN domains d ON p.skater_id = d.skater_id
      WHERE d.host = ${host}
      ORDER BY p.release_date DESC NULLS LAST, p.sort_order NULLS LAST;
    `;

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error: any) {
    console.error('[Parts API] Error:', error);
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
