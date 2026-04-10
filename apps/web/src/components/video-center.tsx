import Link from "next/link";
import { ArrowUpRight, PlayCircle, Upload } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { storyVideo } from "@/lib/site-data";
import { cn } from "@/lib/utils";

type VideoCenterProps = {
  compact?: boolean;
};

export function VideoCenter({ compact = false }: VideoCenterProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
      <Card className="overflow-hidden">
        <div className="border-b border-white/8 bg-black/20 px-6 py-4">
          <div className="flex items-center gap-3 text-sm text-cyan-100">
            <PlayCircle className="h-4 w-4" />
            {storyVideo.title}
          </div>
        </div>
        <CardContent className="p-4 sm:p-6">
          <video
            className="aspect-video w-full rounded-[24px] border border-white/10 bg-black/50 object-cover shadow-[0_20px_80px_rgba(0,0,0,0.35)]"
            controls
            playsInline
            poster={storyVideo.posterHref}
            preload="metadata"
          >
            <source src={storyVideo.siteHref} type="video/mp4" />
          </video>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              className={cn(buttonVariants({ size: "sm" }))}
              href={storyVideo.siteHref}
              rel="noreferrer"
              target="_blank"
            >
              Open MP4
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <a
              className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}
              href={storyVideo.posterHref}
              rel="noreferrer"
              target="_blank"
            >
              Open poster
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <Link className={cn(buttonVariants({ size: "sm", variant: "outline" }))} href="/tracks">
              Open track center
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>What this video covers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-white/60">
            <div className="rounded-3xl border border-white/8 bg-white/4 p-4">
              Private governance, confidential treasury operations, ZK review rails, REFHE settlement logic, MagicBlock corridors, Fast RPC, Android access, buyer corridors, and the reason PrivateDAO is stronger across active Frontier tracks.
            </div>
            <div className="rounded-3xl border border-white/8 bg-white/4 p-4">
              It is designed to work as the first-pass product story for judges, buyers, infrastructure partners, and YouTube uploads.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload-ready file</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-white/60">
            <div className="flex items-start gap-3 rounded-3xl border border-white/8 bg-white/4 p-4">
              <Upload className="mt-1 h-4 w-4 shrink-0 text-emerald-200" />
              <div>
                <div className="font-medium text-white">Desktop export</div>
                <div className="mt-1 break-all">{storyVideo.uploadFile}</div>
              </div>
            </div>
            <div className="rounded-3xl border border-white/8 bg-white/4 p-4">
              Runtime: <span className="text-white/84">{storyVideo.runtime}</span>
              <div className="mt-2">
                {compact
                  ? "Use this asset as the fast submission reel from the track workspaces."
                  : "Upload the MP4 to YouTube or Loom, then replace any public submission links with that final hosted URL if needed."}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
