import {
  MessageSquare,
  Phone,
  Mail,
  Instagram,
  Ghost,
  Users,
  Tag,
} from "lucide-react";
import type { MessageChannel } from "@/lib/schemas/messages";
import { MESSAGE_CHANNEL_LABELS } from "@/lib/schemas/messages";

const ICONS: Record<MessageChannel, React.ComponentType<{ className?: string }>> = {
  in_person: Users,
  text: MessageSquare,
  call: Phone,
  email: Mail,
  instagram: Instagram,
  snapchat: Ghost,
  other: Tag,
};

export function ChannelPill({
  channel,
  channelOther,
}: {
  channel: MessageChannel;
  channelOther: string | null;
}) {
  const Icon = ICONS[channel] ?? Tag;
  const label =
    channel === "other" && channelOther
      ? channelOther
      : MESSAGE_CHANNEL_LABELS[channel];
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-card-hover/60 px-2 py-0.5 text-xs font-medium text-text-secondary">
      <Icon className="h-3 w-3" aria-hidden />
      {label}
    </span>
  );
}
