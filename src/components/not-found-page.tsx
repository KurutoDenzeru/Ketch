import { Link } from "@tanstack/react-router"
import { Compass, Home, Library } from "lucide-react"

import { Button } from "@/components/ui/button"
import { brand } from "@/lib/brand"

export function NotFoundPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
        404 · Off the map
      </p>
      <h1 className="mt-4 font-display text-6xl leading-[0.95] sm:text-7xl">
        {brand.name}
        <span className="block italic text-primary">lost the thread.</span>
      </h1>
      <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
        The page you wanted isn't here. If you came from a shared idea link, the
        snapshot may have been revoked. Otherwise, head back to the lab or open
        your library.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild className="rounded-full">
          <Link to="/app/new">
            <Compass className="size-4" />
            Open the lab
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/app/library">
            <Library className="size-4" />
            Library
          </Link>
        </Button>
        <Button asChild variant="ghost" className="rounded-full">
          <Link to="/">
            <Home className="size-4" />
            Home
          </Link>
        </Button>
      </div>
    </div>
  )
}
