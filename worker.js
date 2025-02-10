export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Max-Age': '86400',
    };

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders
      });
    }

    try {
      const url = new URL(request.url);
      const key = url.pathname.replace(/^\//, '');

      // Get object from R2
      const object = await env.OPHNM_BUCKET.get(key);

      if (!object) {
        return new Response('Object Not Found', { 
          status: 404,
          headers: corsHeaders
        });
      }

      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set('etag', object.httpEtag);
      
      // Add CORS headers
      Object.entries(corsHeaders).forEach(([key, value]) => {
        headers.set(key, value);
      });

      // Add content type headers for different file types
      const fileExtension = key.split('.').pop().toLowerCase();
      switch (fileExtension) {
        case 'glb':
          headers.set('Content-Type', 'model/gltf-binary');
          break;
        case 'gltf':
          headers.set('Content-Type', 'model/gltf+json');
          break;
        case 'mp3':
          headers.set('Content-Type', 'audio/mpeg');
          break;
        case 'bin':
          headers.set('Content-Type', 'application/octet-stream');
          break;
      }

      // Cache control
      headers.set('Cache-Control', 'public, max-age=31536000');

      return new Response(object.body, {
        headers
      });
    } catch (error) {
      console.error('Worker error:', error);
      return new Response('Internal Error', { 
        status: 500,
        headers: corsHeaders
      });
    }
  }
}; 