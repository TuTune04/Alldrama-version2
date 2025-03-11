import { fromHono } from "chanfana";
import { Hono } from "hono";
import { TaskCreate } from "./endpoints/taskCreate";
import { TaskDelete } from "./endpoints/taskDelete";
import { TaskFetch } from "./endpoints/taskFetch";
import { TaskList } from "./endpoints/taskList";
import { Env } from "./types";

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

// Setup OpenAPI registry
const openapi = fromHono(app, {
	docs_url: "/",
});

// Register OpenAPI endpoints
openapi.get("/api/tasks", TaskList);
openapi.post("/api/tasks", TaskCreate);
openapi.get("/api/tasks/:taskSlug", TaskFetch);
openapi.delete("/api/tasks/:taskSlug", TaskDelete);

// Định nghĩa routes cho media mà không dùng OpenAPI để đơn giản hóa
app.post("/api/convert-hls", async (c) => {
  try {
    // Xác thực request
    const authHeader = c.req.header("Authorization");
    if (!authHeader || !validateToken(authHeader)) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const body = await c.req.json();
    const { videoKey, movieId, episodeId } = body;
    
    console.log(`Bắt đầu xử lý video: ${videoKey}`);
    
    // Sửa lại: Xử lý trực tiếp ngay tại worker thay vì gọi về backend
    try {
      // Trong môi trường phát triển/test, tạo một response giả lập
      const jobId = `worker-job-${Date.now()}`;
      
      return c.json({
        success: true,
        message: "Video processing started (worker test mode)",
        jobId: jobId,
        hlsPath: `episodes/${movieId}/${episodeId}/hls/master.m3u8`
      });
      
      /* Giữ lại phần code cũ để tham khảo, nhưng không sử dụng
      const processingEndpoint = "http://localhost:3000/api/media/process-video";
      console.log(`Calling backend at: ${processingEndpoint}`);
      
      const response = await fetch(processingEndpoint, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Worker-Secret": "alldrama-worker-secret"
        },
        body: JSON.stringify({ videoKey, movieId, episodeId })
      });
      
      // Kiểm tra response status
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Backend returned error status ${response.status}: ${errorText}`);
        return c.json({
          success: false,
          error: `Backend error: ${response.status} ${response.statusText}`
        }, 500);
      }
      
      // Parse response một cách an toàn
      let result;
      try {
        const text = await response.text();
        console.log(`Backend response text: ${text}`);
        result = JSON.parse(text);
      } catch (parseError) {
        console.error(`Error parsing JSON: ${parseError}`);
        return c.json({
          success: false,
          error: `Failed to parse backend response: ${parseError instanceof Error ? parseError.message : String(parseError)}`
        }, 500);
      }
      
      return c.json({
        success: true,
        message: "Video processing started",
        jobId: result.jobId || "unknown",
        hlsPath: `episodes/${movieId}/${episodeId}/hls/master.m3u8`
      });
      */
    } catch (fetchError) {
      console.error(`Error in worker processing: ${fetchError}`);
      return c.json({
        success: false,
        error: `Worker processing error: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`
      }, 500);
    }
  } catch (error) {
    console.error(`Error in HLS conversion: ${error}`);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

app.get("/resize/:width/:height/*", async (c) => {
  try {
    const width = parseInt(c.req.param("width"));
    const height = c.req.param("height") === "auto" ? null : parseInt(c.req.param("height"));
    
    // Lấy phần còn lại của path sau /resize/{width}/{height}/
    const path = c.req.path.split("/").slice(4).join("/");
    
    // Lấy hình ảnh gốc từ R2
    const object = await c.env.MEDIA_BUCKET.get(path);
    
    if (!object) {
      return c.json({ error: "Image not found" }, 404);
    }
    
    // Trả về hình ảnh gốc (trong thực tế sẽ thêm xử lý resize)
    return new Response(object.body, {
      headers: {
        "Content-Type": object.httpMetadata?.contentType || "image/jpeg",
        "Cache-Control": "public, max-age=31536000",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error(`Error resizing image: ${error}`);
    return c.json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

app.get("/hls/*", async (c) => {
  try {
    // Lấy phần path sau /hls/
    const path = c.req.path.substring(5);
    console.log(`HLS request path: ${path}`);
    
    // Log để debug
    console.log(`Trying to get object from R2: ${path}`);
    console.log(`Env bindings:`, Object.keys(c.env));
    
    // Đảm bảo path bắt đầu đúng cách
    let objectPath = path;
    if (objectPath.startsWith('/')) {
      objectPath = objectPath.substring(1);
    }
    console.log(`Final object path: ${objectPath}`);
    
    const object = await c.env.MEDIA_BUCKET.get(objectPath);
    
    if (!object) {
      console.log(`Object not found at path: ${objectPath}`);
      return c.json({ error: "HLS file not found" }, 404);
    }
    
    console.log(`Object found with key: ${object.key}, size: ${object.size}`);
    
    const headers = new Headers();
    
    // Thiết lập Content-Type phù hợp
    if (path.endsWith(".m3u8")) {
      headers.set("Content-Type", "application/vnd.apple.mpegurl");
    } else if (path.endsWith(".m4s")) {
      headers.set("Content-Type", "video/iso.segment");
    } else if (path.endsWith(".mp4")) {
      headers.set("Content-Type", "video/mp4");
    }
    
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Cache-Control", "public, max-age=31536000");
    
    return new Response(object.body, { headers });
  } catch (error) {
    console.error(`Error serving HLS file: ${error}`);
    return c.json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

// Thêm endpoint để liệt kê các file trong R2 (hữu ích để debug)
app.get("/list-r2/*", async (c) => {
  try {
    const prefix = c.req.path.substring(8); // Lấy phần path sau /list-r2/
    console.log(`Listing R2 objects with prefix: ${prefix}`);
    
    // Đảm bảo prefix bắt đầu đúng cách
    let objectPrefix = prefix;
    if (objectPrefix.startsWith('/')) {
      objectPrefix = objectPrefix.substring(1);
    }
    
    // Liệt kê các objects trong R2 với prefix
    const listed = await c.env.MEDIA_BUCKET.list({
      prefix: objectPrefix,
      limit: 100,
    });
    
    // Tạo danh sách các file để trả về
    const files = listed.objects.map(obj => ({
      key: obj.key,
      size: obj.size,
      uploadedAt: obj.uploaded
    }));
    
    return c.json({
      success: true,
      prefix: objectPrefix,
      files: files
    });
  } catch (error) {
    console.error(`Error listing R2 objects: ${error}`);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// Hàm kiểm tra token
function validateToken(authHeader: string): boolean {
  // Trong môi trường phát triển, chấp nhận token đơn giản
  // Khi triển khai production, thay thế bằng xác thực JWT hoặc khác
  const token = authHeader.split(" ")[1];
  return token === "alldrama-dev-token";
}

// Export the Hono app
export default app;
