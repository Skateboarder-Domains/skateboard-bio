/**
 * GET /api/public/skater
 * 
 * Returns skater profile data based on the requesting domain
 * Query params: ?host=tonyhawk.bio (optional, falls back to request host header)
 */

export const onRequestGet = async ({ request, env }: any) => {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(env.NEON_DATABASE_URL);

    // Get host from query param or request header
    const url = new URL(request.url);
    let host = url.searchParams.get('host') || request.headers.get('host')?.replace('www.', '') || '';
    
    // Remove port if present (for local testing)
    host = host.split(':')[0];

    console.log(`[Skater API] Fetching skater for host: ${host}`);

    // Query: Join domains to skaters table
    const result = await sql`
      SELECT 
        s.id,
        s.slug,
        s.full_name,
        s.nickname,
        s.bio,
        s.birth_date,
        s.birthplace,
        s.hometown,
        s.stance,
        s.turned_pro_year,
        s.sponsors,
        s.social_links,
        s.profile_image_url,
        s.header_image_url,
        s.is_active,
        s.created_at,
        s.updated_at
      FROM domains d
      JOIN skaters s ON s.id = d.skater_id
      WHERE d.host = ${host} AND d.is_active = true
      LIMIT 1;
    `;

    if (result.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Skater not found for this domain' }), 
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    return new Response(JSON.stringify(result[0]), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    });
  } catch (error: any) {
    console.error('[Skater API] Error:', error);
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
