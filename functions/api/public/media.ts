/**
 * GET /api/public/media
 * 
 * Returns media assets (photos/videos) for a skater
 * Query params: 
 *   - host=tonyhawk.bio (required)
 *   - type=image|video|gif (optional filter)
 */

export const onRequestGet = async ({ request, env }: any) => {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(env.NEON_DATABASE_URL);

    const url = new URL(request.url);
    let host = url.searchParams.get('host') || request.headers.get('host')?.replace('www.', '') || '';
    const type = url.searchParams.get('type'); // Optional filter by type
    
    host = host.split(':')[0];

    console.log(`[Media API] Fetching media for host: ${host}, type: ${type || 'all'}`);

    // Query with optional type filter
    let result;
    if (type) {
      result = await sql`
        SELECT 
          m.id,
          m.type,
          m.url,
          m.title,
          m.description,
          m.caption,
          m.thumbnail_url,
          m.width,
          m.height,
          m.duration,
          m.file_size,
          m.tags,
          m.is_featured,
          m.created_at
        FROM media_assets m
        JOIN domains d ON m.skater_id = d.skater_id
        WHERE d.host = ${host} AND m.type = ${type}
        ORDER BY m.sort_order NULLS LAST, m.created_at DESC;
      `;
    } else {
      result = await sql`
        SELECT 
          m.id,
          m.type,
          m.url,
          m.title,
          m.description,
          m.caption,
          m.thumbnail_url,
          m.width,
          m.height,
          m.duration,
          m.file_size,
          m.tags,
          m.is_featured,
          m.created_at
        FROM media_assets m
        JOIN domains d ON m.skater_id = d.skater_id
        WHERE d.host = ${host}
        ORDER BY m.sort_order NULLS LAST, m.created_at DESC;
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
    console.error('[Media API] Error:', error);
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
