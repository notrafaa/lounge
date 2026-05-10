import { discordMarkdownPreview } from "@/lib/markdownPreview";

export function DiscordPreview({ content }: { content: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-[#313338]/80 p-4 text-sm text-[#dbdee1]">
      <div className="mb-3 flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-lounge-mist/20 text-lounge-mist">L</div>
        <div>
          <p className="font-semibold text-white">Louna</p>
          <p className="text-xs text-white/35">preview dashboard</p>
        </div>
      </div>
      <div dangerouslySetInnerHTML={{ __html: discordMarkdownPreview(content || "Le message apparaîtra ici.") }} />
    </div>
  );
}

