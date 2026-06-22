import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@workspace/ui/components/pagination"
import { cn } from "@workspace/ui/lib/utils"

type FilterParams = {
  model?: string
  tag?: string
  sort?: "newest" | "oldest" | "top"
}

function buildHref(page: number, params: FilterParams): string {
  const query = new URLSearchParams()
  if (params.model) query.set("model", params.model)
  if (params.tag) query.set("tag", params.tag)
  // "newest" is the default, so only non-default sorts need to be carried.
  if (params.sort && params.sort !== "newest") query.set("sort", params.sort)
  if (page > 1) query.set("page", String(page))
  const queryString = query.toString()
  return queryString ? `/browse?${queryString}` : "/browse"
}

// Windowed page list: 1 … current-1 current current+1 … total
function pageRange(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | "ellipsis")[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) pages.push("ellipsis")
  for (let page = start; page <= end; page++) pages.push(page)
  if (end < total - 1) pages.push("ellipsis")
  pages.push(total)
  return pages
}

export function BrowsePagination({
  page,
  totalPages,
  params,
}: {
  page: number
  totalPages: number
  params: FilterParams
}) {
  if (totalPages <= 1) return null

  const prevDisabled = page <= 1
  const nextDisabled = page >= totalPages

  return (
    <Pagination className="mt-6">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={prevDisabled ? undefined : buildHref(page - 1, params)}
            aria-disabled={prevDisabled}
            className={cn(prevDisabled && "pointer-events-none opacity-50")}
          />
        </PaginationItem>

        {pageRange(page, totalPages).map((item, index) => (
          <PaginationItem key={`${item}-${index}`}>
            {item === "ellipsis" ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href={buildHref(item, params)}
                isActive={item === page}
              >
                {item}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            href={nextDisabled ? undefined : buildHref(page + 1, params)}
            aria-disabled={nextDisabled}
            className={cn(nextDisabled && "pointer-events-none opacity-50")}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
