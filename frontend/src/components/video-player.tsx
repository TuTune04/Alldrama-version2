"use client";

import React, { useLayoutEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

interface ExtendedVideoJsPlayer {
  requestFullscreen: () => void;
  dispose: () => void;
  src: (source: { src: string; type: string }) => void;
}

interface VideoPlayerProps {
  src: string;
  poster?: string;
  onNext?: () => void;
  hasNextEpisode?: boolean;
  videoSize: "normal" | "fullscreen";
  setVideoSize: (size: "normal" | "fullscreen") => void;
}

export function VideoPlayer({
  src,
  poster,
  onNext,
  hasNextEpisode,
  videoSize,
  setVideoSize,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<ExtendedVideoJsPlayer | null>(null);

  // Khởi tạo player chỉ một lần
  useLayoutEffect(() => {
    const initPlayer = () => {
      if (!videoRef.current) return;
      if (!document.body.contains(videoRef.current)) {
        requestAnimationFrame(initPlayer);
        return;
      }
      if (!playerRef.current) {
        const options = {
          controls: true,
          autoplay: false,
          preload: "auto",
          sources: [
            {
              src,
              type: "video/mp4",
            },
          ],
          poster: poster,
        };
        const player = videojs(videoRef.current, options, function () {
          console.log("Video.js player is ready");
        });
        playerRef.current = player as ExtendedVideoJsPlayer;
      }
    };

    requestAnimationFrame(initPlayer);

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [poster]); // khởi tạo chỉ phụ thuộc vào poster (có thể thêm tùy chọn khác nếu cần)

  // Effect riêng để cập nhật nguồn video khi src thay đổi
  useLayoutEffect(() => {
    if (playerRef.current) {
      playerRef.current.src({ src, type: "video/mp4" });
    }
  }, [src]);

  // Xử lý fullscreen khi videoSize thay đổi
  useLayoutEffect(() => {
    if (playerRef.current) {
      if (videoSize === "fullscreen") {
        playerRef.current.requestFullscreen();
      } else if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    }
  }, [videoSize]);

  // Container responsive: luôn căn giữa, không vượt quá chiều rộng màn hình
  const containerStyle = {
    width: "100%",
    maxWidth: "450px",
    aspectRatio: "9 / 16" as unknown as string, // duy trì tỉ lệ 9:16 (540x960)
  };

  return (
    <div
      data-vjs-player
      className={
        videoSize === "fullscreen"
          ? "fixed inset-0 z-50 flex items-center justify-center bg-black"
          : "mx-auto my-4"
      }
      style={containerStyle}
    >
      <video ref={videoRef} className="video-js vjs-big-play-centered w-full h-full" />
    </div>
  );
}
