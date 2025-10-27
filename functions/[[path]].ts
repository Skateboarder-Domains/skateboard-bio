/**
 * Dynamic Skater Profile Page
 * 
 * Catch-all route that serves individual skater profiles
 * Example: tonyhawk.bio → Tony Hawk's profile page
 */

export const onRequestGet = async ({ request, env }: any) => {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(env.NEON_DATABASE_URL);

    // Get host from request
    let host = request.headers.get('host')?.replace('www.', '') || '';
    host = host.split(':')[0];

    console.log(`[Profile] Rendering profile for: ${host}`);

    // Special case: if this is the main skateboard.bio domain, redirect to directory
    if (host === 'skateboard.bio' || host === 'skateboard-bio.pages.dev') {
      return Response.redirect('/', 302);
    }

    // Fetch skater data
    const skaterResult = await sql`
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
        s.header_image_url
      FROM domains d
      JOIN skaters s ON s.id = d.skater_id
      WHERE d.host = ${host} AND d.is_active = true
      LIMIT 1;
    `;

    if (skaterResult.length === 0) {
      return new Response(notFoundHTML(host), {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    const skater = skaterResult[0];

    // Fetch media (photos/videos)
    const media = await sql`
      SELECT id, type, url, title, caption, thumbnail_url, is_featured
      FROM media_assets
      WHERE skater_id = ${skater.id}
      ORDER BY is_featured DESC, sort_order NULLS LAST, created_at DESC
      LIMIT 12;
    `;

    // Fetch timeline events
    const timeline = await sql`
      SELECT id, event_date, event_year, title, description, event_type, location
      FROM timeline
      WHERE skater_id = ${skater.id}
      ORDER BY event_date DESC
      LIMIT 10;
    `;

    // Fetch video parts
    const parts = await sql`
      SELECT id, video_name, video_company, release_year, video_url, thumbnail_url, is_featured
      FROM parts
      WHERE skater_id = ${skater.id}
      ORDER BY is_featured DESC, release_date DESC NULLS LAST
      LIMIT 6;
    `;

    // Fetch contest results
    const contests = await sql`
      SELECT id, contest_name, contest_year, location, placement, placement_text, prize_money, currency
      FROM contests
      WHERE skater_id = ${skater.id}
      ORDER BY contest_date DESC
      LIMIT 10;
    `;

    // Build HTML
    const html = profileHTML(skater, media, timeline, parts, contests, host);

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=600',
      },
    });
  } catch (error: any) {
    console.error('[Profile] Error:', error);
    return new Response(errorHTML(error.message), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
};

function profileHTML(
  skater: any,
  media: any[],
  timeline: any[],
  parts: any[],
  contests: any[],
  host: string
): string {
  const age = skater.birth_date ? calculateAge(skater.birth_date) : null;
  const headerImage = skater.header_image_url || 'https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=1200&h=400&fit=crop';
  const profileImage = skater.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(skater.full_name)}&background=22c55e&color=fff&size=400`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${skater.full_name}${skater.nickname ? ' "' + skater.nickname + '"' : ''} - Professional Skateboarder</title>
  <meta name="description" content="${skater.bio || `${skater.full_name} is a professional skateboarder${skater.hometown ? ' from ' + skater.hometown : ''}.`}" />
  
  <!-- Open Graph -->
  <meta property="og:title" content="${skater.full_name} - Professional Skateboarder" />
  <meta property="og:description" content="${(skater.bio || '').substring(0, 160)}" />
  <meta property="og:image" content="${profileImage}" />
  <meta property="og:url" content="https://${host}" />
  <meta property="og:type" content="profile" />
  
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@3.4.0/dist/tailwind.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    body {
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
      min-height: 100vh;
    }
    .header-gradient {
      background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(10,10,10,0.8) 70%, rgba(10,10,10,1) 100%);
    }
    .card {
      background: rgba(31, 31, 31, 0.6);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s;
    }
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(34, 197, 94, 0.15);
    }
    .stat-card {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%);
      border: 1px solid rgba(34, 197, 94, 0.2);
    }
    .timeline-item::before {
      content: '';
      position: absolute;
      left: 9px;
      top: 30px;
      bottom: -20px;
      width: 2px;
      background: linear-gradient(to bottom, rgba(34, 197, 94, 0.3), transparent);
    }
    .timeline-item:last-child::before {
      display: none;
    }
  </style>
</head>
<body class="text-white font-sans">
  <!-- Header with Background Image -->
  <div class="relative h-96 overflow-hidden">
    <img 
      src="${headerImage}" 
      alt="${skater.full_name} header"
      class="w-full h-full object-cover"
    />
    <div class="absolute inset-0 header-gradient"></div>
    
    <!-- Profile Section -->
    <div class="absolute bottom-0 left-0 right-0 px-6 pb-6">
      <div class="max-w-6xl mx-auto flex items-end gap-6">
        <img 
          src="${profileImage}" 
          alt="${skater.full_name}"
          class="w-32 h-32 rounded-full border-4 border-green-500 shadow-2xl object-cover"
        />
        <div class="flex-1 pb-2">
          <h1 class="text-5xl font-black mb-2">
            ${skater.full_name}
            ${skater.nickname ? `<span class="text-green-400 text-3xl ml-2">"${skater.nickname}"</span>` : ''}
          </h1>
          <div class="flex flex-wrap gap-4 text-gray-300">
            ${skater.hometown ? `<div><i class="fas fa-map-marker-alt text-green-400 mr-2"></i>${skater.hometown}</div>` : ''}
            ${age ? `<div><i class="fas fa-calendar text-green-400 mr-2"></i>${age} years old</div>` : ''}
            ${skater.stance ? `<div><i class="fas fa-shoe-prints text-green-400 mr-2"></i>${capitalize(skater.stance)} stance</div>` : ''}
            ${skater.turned_pro_year ? `<div><i class="fas fa-trophy text-green-400 mr-2"></i>Pro since ${skater.turned_pro_year}</div>` : ''}
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <main class="max-w-6xl mx-auto px-6 py-12">
    
    <!-- Bio Section -->
    ${skater.bio ? `
      <section class="mb-12">
        <div class="card rounded-lg p-8">
          <h2 class="text-3xl font-bold mb-4 text-green-400">Bio</h2>
          <p class="text-gray-300 text-lg leading-relaxed">${skater.bio}</p>
        </div>
      </section>
    ` : ''}

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
      <div class="stat-card rounded-lg p-6 text-center">
        <div class="text-4xl font-bold text-green-400">${media.length}</div>
        <div class="text-gray-400 mt-1">Media</div>
      </div>
      <div class="stat-card rounded-lg p-6 text-center">
        <div class="text-4xl font-bold text-green-400">${parts.length}</div>
        <div class="text-gray-400 mt-1">Video Parts</div>
      </div>
      <div class="stat-card rounded-lg p-6 text-center">
        <div class="text-4xl font-bold text-green-400">${contests.length}</div>
        <div class="text-gray-400 mt-1">Contests</div>
      </div>
      <div class="stat-card rounded-lg p-6 text-center">
        <div class="text-4xl font-bold text-green-400">${timeline.length}</div>
        <div class="text-gray-400 mt-1">Timeline</div>
      </div>
    </div>

    <!-- Sponsors -->
    ${skater.sponsors && skater.sponsors.length > 0 ? `
      <section class="mb-12">
        <div class="card rounded-lg p-8">
          <h2 class="text-3xl font-bold mb-6 text-green-400">Sponsors</h2>
          <div class="flex flex-wrap gap-3">
            ${skater.sponsors.map((sponsor: string) => `
              <div class="px-4 py-2 bg-gray-700/50 rounded-full border border-gray-600 text-gray-200">
                ${sponsor}
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    ` : ''}

    <!-- Media Gallery -->
    ${media.length > 0 ? `
      <section class="mb-12">
        <h2 class="text-3xl font-bold mb-6 text-green-400">Media</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          ${media.map((m: any) => `
            <div class="card rounded-lg overflow-hidden group cursor-pointer">
              <div class="aspect-square bg-gray-800 overflow-hidden relative">
                <img 
                  src="${m.type === 'video' && m.thumbnail_url ? m.thumbnail_url : m.url}" 
                  alt="${m.title || 'Media'}"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
                ${m.type === 'video' ? `
                  <div class="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                    <i class="fas fa-play-circle text-6xl text-white/80"></i>
                  </div>
                ` : ''}
              </div>
              ${m.caption ? `<div class="p-3 text-sm text-gray-400">${m.caption}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </section>
    ` : ''}

    <!-- Video Parts -->
    ${parts.length > 0 ? `
      <section class="mb-12">
        <h2 class="text-3xl font-bold mb-6 text-green-400">Video Parts</h2>
        <div class="grid md:grid-cols-2 gap-6">
          ${parts.map((p: any) => `
            <div class="card rounded-lg overflow-hidden">
              <div class="aspect-video bg-gray-800 relative group cursor-pointer">
                ${p.thumbnail_url ? `
                  <img 
                    src="${p.thumbnail_url}" 
                    alt="${p.video_name}"
                    class="w-full h-full object-cover"
                  />
                ` : `
                  <div class="flex items-center justify-center h-full bg-gradient-to-br from-gray-800 to-gray-900">
                    <i class="fas fa-video text-6xl text-gray-600"></i>
                  </div>
                `}
                <div class="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                  <i class="fas fa-play-circle text-6xl text-white/80"></i>
                </div>
              </div>
              <div class="p-5">
                <h3 class="text-xl font-bold mb-2">${p.video_name}</h3>
                <div class="flex gap-3 text-sm text-gray-400">
                  ${p.video_company ? `<div><i class="fas fa-building mr-1"></i>${p.video_company}</div>` : ''}
                  ${p.release_year ? `<div><i class="fas fa-calendar mr-1"></i>${p.release_year}</div>` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    ` : ''}

    <!-- Career Timeline -->
    ${timeline.length > 0 ? `
      <section class="mb-12">
        <h2 class="text-3xl font-bold mb-6 text-green-400">Career Timeline</h2>
        <div class="card rounded-lg p-8">
          <div class="space-y-8">
            ${timeline.map((t: any) => `
              <div class="relative pl-8 timeline-item">
                <div class="absolute left-0 top-1 w-5 h-5 bg-green-500 rounded-full border-4 border-gray-900"></div>
                <div class="flex justify-between items-start mb-2">
                  <h3 class="text-xl font-bold">${t.title}</h3>
                  <span class="text-green-400 font-mono text-sm">${t.event_year}</span>
                </div>
                ${t.description ? `<p class="text-gray-400 mb-2">${t.description}</p>` : ''}
                <div class="flex gap-3 text-sm text-gray-500">
                  ${t.location ? `<div><i class="fas fa-map-marker-alt mr-1"></i>${t.location}</div>` : ''}
                  ${t.event_type ? `<div><i class="fas fa-tag mr-1"></i>${capitalize(t.event_type)}</div>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    ` : ''}

    <!-- Contest Results -->
    ${contests.length > 0 ? `
      <section class="mb-12">
        <h2 class="text-3xl font-bold mb-6 text-green-400">Contest Results</h2>
        <div class="card rounded-lg overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-800/50 border-b border-gray-700">
                <tr>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-300">Contest</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-300">Year</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-300">Location</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-300">Place</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-300">Prize</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-700/50">
                ${contests.map((c: any) => `
                  <tr class="hover:bg-gray-800/30 transition-colors">
                    <td class="px-6 py-4 font-medium">${c.contest_name}</td>
                    <td class="px-6 py-4 text-gray-400">${c.contest_year || '-'}</td>
                    <td class="px-6 py-4 text-gray-400">${c.location || '-'}</td>
                    <td class="px-6 py-4">
                      <span class="px-3 py-1 rounded-full text-sm font-medium ${
                        c.placement === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                        c.placement === 2 ? 'bg-gray-400/20 text-gray-300' :
                        c.placement === 3 ? 'bg-orange-500/20 text-orange-400' :
                        'bg-green-500/20 text-green-400'
                      }">
                        ${c.placement_text || (c.placement ? c.placement + getSuffix(c.placement) : '-')}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-gray-400">
                      ${c.prize_money ? `$${formatMoney(c.prize_money)}` : '-'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    ` : ''}

    <!-- Social Links -->
    ${skater.social_links ? `
      <section class="mb-12">
        <div class="card rounded-lg p-8">
          <h2 class="text-3xl font-bold mb-6 text-green-400">Connect</h2>
          <div class="flex flex-wrap gap-4">
            ${Object.entries(skater.social_links).map(([platform, url]) => `
              <a 
                href="${url}" 
                target="_blank" 
                rel="noopener noreferrer"
                class="px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg border border-gray-600 transition-colors flex items-center gap-2"
              >
                <i class="fab fa-${platform.toLowerCase()} text-xl"></i>
                <span class="capitalize">${platform}</span>
              </a>
            `).join('')}
          </div>
        </div>
      </section>
    ` : ''}

    <!-- Footer -->
    <footer class="mt-16 text-center text-gray-500 text-sm">
      <p class="mb-2">Part of the <a href="https://skateboard.bio" class="text-green-400 hover:underline">skateboard.bio</a> network</p>
      <p>Powered by Cloudflare Pages + Neon PostgreSQL</p>
    </footer>
  </main>
</body>
</html>
  `;
}

function notFoundHTML(host: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Skater Not Found - ${host}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@3.4.0/dist/tailwind.min.css">
</head>
<body class="bg-gray-900 text-white flex items-center justify-center min-h-screen">
  <div class="text-center px-6">
    <div class="text-8xl mb-4">🛹</div>
    <h1 class="text-4xl font-bold mb-4 text-green-400">Skater Not Found</h1>
    <p class="text-gray-400 mb-6">No skater profile found for <span class="text-white font-mono">${host}</span></p>
    <a href="https://skateboard.bio" class="inline-block px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg font-semibold transition-colors">
      View Directory
    </a>
  </div>
</body>
</html>
  `;
}

function errorHTML(message: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Error - Skateboard.bio</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@3.4.0/dist/tailwind.min.css">
</head>
<body class="bg-gray-900 text-white flex items-center justify-center min-h-screen">
  <div class="text-center px-6">
    <h1 class="text-4xl font-bold mb-4 text-red-500">Error</h1>
    <p class="text-gray-400 mb-4">Unable to load profile</p>
    <pre class="text-left text-sm bg-gray-800 p-4 rounded max-w-lg mx-auto">${message}</pre>
  </div>
</body>
</html>
  `;
}

// Utility functions
function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getSuffix(num: number): string {
  if (num === 1) return 'st';
  if (num === 2) return 'nd';
  if (num === 3) return 'rd';
  return 'th';
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-US').format(amount);
}
