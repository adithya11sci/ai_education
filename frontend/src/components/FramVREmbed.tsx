"use client";

import { ExternalLink, Maximize2, Minimize2 } from "lucide-react";
import { useRef } from "react";
import { useFullscreen } from "@/hooks/useFramVR";
import { getFramVRIframeProps } from "@/lib/framevr";

interface FramVREmbedProps {
  url: string;
  title?: string;
  className?: string;
  showControls?: boolean;
}

/**
 * FramVR Embed Component
 * Embeds a FramVR virtual classroom with fullscreen and control options
 */
export function FramVREmbed({
  url,
  title = "VR Classroom",
  className = "",
  showControls = true,
}: FramVREmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);
  const iframeProps = getFramVRIframeProps(url);

  return (
    <div
      ref={containerRef}
      className={`relative bg-black rounded-xl overflow-hidden border border-white/10 ${className}`}
    >
      {showControls && (
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-lg p-2 transition-colors"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-lg p-2 transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      )}

      <iframe
        {...iframeProps}
        title={title}
        className="w-full h-full min-h-[600px]"
      />
    </div>
  );
}
