export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const url = new URL(request.url);
    if (url.pathname !== '/' || !response.headers.get('content-type')?.includes('text/html')) return response;
    const html = (await response.text()).replaceAll('__SITE_ORIGIN__', url.origin);
    const headers = new Headers(response.headers);
    headers.set('content-type', 'text/html; charset=UTF-8');
    headers.set('cache-control', 'public, max-age=0, must-revalidate');
    return new Response(html, { status: response.status, headers });
  },
};
