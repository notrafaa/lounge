"use client";

import { Hash, Mic, Folder } from "lucide-react";
import clsx from "clsx";

export interface DashboardChannel {
  id: string;
  name: string;
  parentId: string | null;
  isCategory: boolean;
  isText: boolean;
  isVoice: boolean;
}

export function ChannelList({
  channels,
  selectedId,
  onSelect
}: {
  channels: DashboardChannel[];
  selectedId?: string;
  onSelect: (channel: DashboardChannel) => void;
}) {
  const categories = channels.filter((channel) => channel.isCategory);
  const orphans = channels.filter((channel) => !channel.parentId && !channel.isCategory);

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <div key={category.id}>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-white/40">
            <Folder size={14} />
            {category.name}
          </div>
          <div className="space-y-1">
            {channels
              .filter((channel) => channel.parentId === category.id)
              .map((channel) => (
                <ChannelButton key={channel.id} channel={channel} selected={channel.id === selectedId} onSelect={onSelect} />
              ))}
          </div>
        </div>
      ))}
      {orphans.map((channel) => (
        <ChannelButton key={channel.id} channel={channel} selected={channel.id === selectedId} onSelect={onSelect} />
      ))}
    </div>
  );
}

function ChannelButton({
  channel,
  selected,
  onSelect
}: {
  channel: DashboardChannel;
  selected: boolean;
  onSelect: (channel: DashboardChannel) => void;
}) {
  const Icon = channel.isVoice ? Mic : Hash;
  return (
    <button
      type="button"
      disabled={!channel.isText}
      onClick={() => onSelect(channel)}
      className={clsx(
        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition",
        selected ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/10 hover:text-white",
        !channel.isText && "cursor-not-allowed opacity-45"
      )}
    >
      <Icon size={15} />
      <span className="truncate">{channel.name}</span>
    </button>
  );
}

