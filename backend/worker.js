addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Enable CORS
  if (request.method === 'OPTIONS') {
    return handleCORS(request)
  }
  
  const url = new URL(request.url)
  
  // Endpoint để trigger chuyển đổi HLS
  if (url.pathname === '/api/convert-hls' && request.method === 'POST') {
    return handleHlsConversion(request)
  }
  
  // Endpoint để resize image
  if (url.pathname.startsWith('/resize/') && request.method === 'GET') {
    return handleImageResize(request, url)
  }
  
  return new Response('Not Found', { status: 404 })
}

async function handleCORS(request) {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    }
  })
}

async function handleHlsConversion(request) {
  try {
    // Authenticate request
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !validateToken(authHeader)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    const { videoKey, movieId, episodeId } = await request.json()
    
    console.log(`Bắt đầu xử lý video: ${videoKey}`)
    
    // Ghi log thông tin vào Worker KV hoặc R2 logs
    await logProcessingRequest(videoKey, movieId, episodeId)
    
    // Trigger video processing by making a request to your backend
    // Đây là URL của API xử lý video trong backend của bạn
    const processingEndpoint = 'https://your-backend-url.com/api/media/process-video'
    
    const response = await fetch(processingEndpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Worker-Secret': 'your-worker-backend-shared-secret'
      },
      body: JSON.stringify({ videoKey, movieId, episodeId })
    })
    
    const result = await response.json()
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Video processing started',
      jobId: result.jobId || 'unknown',
      hlsPath: `episodes/${movieId}/${episodeId}/hls/master.m3u8`
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error(`Error in HLS conversion: ${error}`)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

async function handleImageResize(request, url) {
  try {
    // Get parameters from URL
    // Format: /resize/{width}x{height}/{objectKey}
    const pathParts = url.pathname.split('/')
    if (pathParts.length < 4) {
      return new Response('Invalid resize URL', { status: 400 })
    }
    
    const dimensions = pathParts[2].split('x')
    const width = parseInt(dimensions[0])
    const height = dimensions[1] === 'auto' ? null : parseInt(dimensions[1])
    
    // Lấy path của object (phần còn lại sau /resize/{width}x{height}/)
    const objectPath = url.pathname.substring(url.pathname.indexOf(pathParts[3]))
    
    // Get original object from R2 (the object is accessible through the same domain)
    const imageResponse = await fetch(`https://${url.hostname}/${objectPath}`)
    
    if (!imageResponse.ok) {
      return new Response('Image not found', { status: 404 })
    }
    
    // Đọc dữ liệu hình ảnh
    const imageData = await imageResponse.arrayBuffer()
    
    // Trong Worker thực tế, bạn sẽ sử dụng Sharp hoặc Jimp để resize hình ảnh
    // Đây chỉ là ví dụ, trong thực tế bạn cần implement hàm resizeImage
    // const resizedImage = await resizeImage(imageData, width, height)
    
    // Return original image for demonstration
    return new Response(imageData, {
      headers: {
        'Content-Type': imageResponse.headers.get('Content-Type'),
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (error) {
    console.error(`Error resizing image: ${error}`)
    return new Response(`Error resizing image: ${error.message}`, { status: 500 })
  }
}

// Hàm kiểm tra token
function validateToken(authHeader) {
  // Implement proper token validation
  // This is just a placeholder - implement secure token validation in production
  const token = authHeader.split(' ')[1]
  return token === 'your-secret-token'
}

// Ghi log request
async function logProcessingRequest(videoKey, movieId, episodeId) {
  // Trong Worker thực tế, bạn sẽ ghi log vào Workers KV hoặc R2
  console.log(`HLS request: videoKey=${videoKey}, movieId=${movieId}, episodeId=${episodeId}, time=${new Date().toISOString()}`)
} 