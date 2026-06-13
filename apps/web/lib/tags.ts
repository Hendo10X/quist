export type TagGroup = { label: string; tags: string[] }

// Curated tag taxonomy shown in the landing-page Tags menu (desktop popover +
// mobile nav sheet). Each tag links to /browse?tag=<tag>.
export const TAG_GROUPS: TagGroup[] = [
  {
    label: "Languages",
    tags: ["typescript", "javascript", "python", "go", "rust", "sql"],
  },
  {
    label: "Frameworks",
    tags: ["next.js", "react", "express", "django", "svelte", "vue"],
  },
  {
    label: "Tools",
    tags: ["docker", "postgres", "redis", "git", "vite", "tailwind"],
  },
  {
    label: "Errors",
    tags: ["cors", "hydration", "type-error", "401", "memory-leak", "build"],
  },
]
