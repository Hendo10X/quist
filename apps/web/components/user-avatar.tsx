import BoringAvatar from "boring-avatars"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"

// Brand-aligned palette — terracotta / teal / blue accents (echoing the
// per-model OKLCH badges) plus a cream and a deep neutral. boring-avatars seeds
// a deterministic "beam" blob off the name, so each user gets a stable avatar.
const AVATAR_PALETTE = ["#CC7A4D", "#4F9E8C", "#6470D4", "#EAD9C0", "#3A352F"]

/** Avatar that shows the user's uploaded image when present, otherwise a
 *  generated boring-avatars beam instead of plain initials. The blob is
 *  deterministic in `seed` — pass a stable, unique key (the user id) so each
 *  account gets a distinct avatar that survives renames; falls back to `name`.
 *  Server-safe: usable from both server and client components. */
export function UserAvatar({
  name,
  seed,
  image,
  className,
}: {
  name: string
  /** Stable unique key to generate the fallback from. Defaults to `name`. */
  seed?: string
  image?: string | null
  className?: string
}) {
  return (
    <Avatar className={className}>
      {image ? <AvatarImage src={image} alt={name} /> : null}
      <AvatarFallback className="bg-transparent text-transparent">
        <BoringAvatar
          name={seed ?? name}
          variant="beam"
          size={80}
          square
          colors={AVATAR_PALETTE}
          className="size-full"
        />
      </AvatarFallback>
    </Avatar>
  )
}
