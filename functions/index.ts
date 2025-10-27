/**
 * Skateboard.bio Directory Page
 * 
 * Server-rendered HTML page listing all skateboarders
 * Accessible at: https://skateboard.bio
 */

export const onRequestGet = async ({ env }: any) => {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(env.NEON_DATABASE_URL);

    console.log('[Directory] Fetching all skateboarders');

    // Get all active skaters
    const skaters = await sql`
      SELECT 
        s.full_name,
        s.slug,
        s.nickname,
        s.profile_image_url,
        s.hometown,
        s.sponsors,
        d.host
      FROM skaters s
      LEFT JOIN domains d ON d.skater_id = s.id AND d.is_active = true
      WHERE s.is_active = true
      ORDER BY s.full_name ASC;
    `;

    console.log(`[Directory] Found ${skaters.length} skateboarders`);

    // Build HTML response
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Skateboard.bio - Directory of Professional Skateboarders</title>
  <meta name="description" content="Comprehensive directory of professional skateboarders and their biographies. Discover ${skaters.length}+ skate legends and their stories." />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@3.4.0/dist/tailwind.min.css">
  <style>
    body {
      background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
      min-height: 100vh;
    }
    .skater-card {
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .skater-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(34, 197, 94, 0.2);
    }
    .grid-bg {
      background-image: 
        linear-gradient(rgba(34, 197, 94, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(34, 197, 94, 0.05) 1px, transparent 1px);
      background-size: 40px 40px;
    }
  </style>
</head>
<body class="text-white font-sans">
  <div class="grid-bg">
    <main class="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-16">
        <h1 class="text-6xl font-black mb-4 bg-gradient-to-r from-green-400 to-lime-500 text-transparent bg-clip-text">
          Skateboard.bio
        </h1>
        <p class="text-xl text-gray-400 max-w-2xl mx-auto">
          The ultimate directory of professional skateboarders. ${skaters.length}+ legendary athletes, one interconnected network.
        </p>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div class="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <div class="text-4xl font-bold text-green-400 mb-2">${skaters.length}+</div>
          <div class="text-gray-400">Skateboarders</div>
        </div>
        <div class="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <div class="text-4xl font-bold text-green-400 mb-2">API</div>
          <div class="text-gray-400">Powered</div>
        </div>
        <div class="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <div class="text-4xl font-bold text-green-400 mb-2">Live</div>
          <div class="text-gray-400">Real-time Data</div>
        </div>
      </div>

      <!-- Skater Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        ${skaters.map((s: any) => {
          const domain = s.host || `${s.slug}.bio`;
          const imageUrl = s.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.full_name)}&background=22c55e&color=fff&size=200`;
          
          return `
            <a 
              href="https://${domain}" 
              class="skater-card block bg-gray-800/70 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div class="aspect-square bg-gray-900 overflow-hidden">
                <img 
                  src="${imageUrl}" 
                  alt="${s.full_name}"
                  class="w-full h-full object-cover"
                  loading="lazy"
                  onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(s.full_name)}&background=22c55e&color=fff&size=200'"
                />
              </div>
              <div class="p-4">
                <h3 class="font-bold text-lg mb-1 text-white">${s.full_name}</h3>
                ${s.nickname ? `<p class="text-sm text-green-400 mb-2">"${s.nickname}"</p>` : ''}
                ${s.hometown ? `<p class="text-sm text-gray-400 mb-2">${s.hometown}</p>` : ''}
                ${s.sponsors && s.sponsors.length > 0 ? `
                  <div class="flex flex-wrap gap-1 mt-2">
                    ${s.sponsors.slice(0, 2).map((sponsor: string) => `
                      <span class="text-xs bg-gray-700/50 px-2 py-1 rounded">${sponsor}</span>
                    `).join('')}
                    ${s.sponsors.length > 2 ? `<span class="text-xs text-gray-500">+${s.sponsors.length - 2}</span>` : ''}
                  </div>
                ` : ''}
              </div>
            </a>
          `;
        }).join('')}
      </div>

      <!-- API Info -->
      <div class="mt-16 bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700">
        <h2 class="text-2xl font-bold mb-4 text-green-400">API Endpoints</h2>
        <p class="text-gray-400 mb-4">
          All .bio sites are powered by our centralized API. Access skater data programmatically:
        </p>
        <div class="space-y-2 font-mono text-sm">
          <div class="bg-gray-900/50 p-3 rounded"><span class="text-green-400">GET</span> /api/public/skater?host=tonyhawk.bio</div>
          <div class="bg-gray-900/50 p-3 rounded"><span class="text-green-400">GET</span> /api/public/media?host=tonyhawk.bio</div>
          <div class="bg-gray-900/50 p-3 rounded"><span class="text-green-400">GET</span> /api/public/timeline?host=tonyhawk.bio</div>
          <div class="bg-gray-900/50 p-3 rounded"><span class="text-green-400">GET</span> /api/public/parts?host=tonyhawk.bio</div>
          <div class="bg-gray-900/50 p-3 rounded"><span class="text-green-400">GET</span> /api/public/contests?host=tonyhawk.bio</div>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-12 text-center text-gray-500 text-sm">
        <p>Powered by Cloudflare Pages + Neon PostgreSQL + R2 CDN</p>
        <p class="mt-2">Built with ❤️ for the skateboarding community</p>
      </div>
    </main>
  </div>
</body>
</html>
    `;

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=600', // Cache for 10 minutes
      },
    });
  } catch (error: any) {
    console.error('[Directory] Error:', error);
    
    // Error page
    const errorHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Error - Skateboard.bio</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@3.4.0/dist/tailwind.min.css">
</head>
<body class="bg-black text-white flex items-center justify-center min-h-screen">
  <div class="text-center">
    <h1 class="text-4xl font-bold mb-4 text-red-500">Error Loading Directory</h1>
    <p class="text-gray-400 mb-4">Unable to fetch skateboarder data</p>
    <pre class="text-left text-sm bg-gray-900 p-4 rounded max-w-lg">${error.message}</pre>
  </div>
</body>
</html>
    `;

    return new Response(errorHtml, {
      status: 500,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  }
};
