import { ArrowUpRight, XIcon } from 'lucide-react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { externalLinkProps } from '@/lib/links'
import type { OtherWork } from '@/types'

function Still({ work, className }: { work: OtherWork; className?: string }) {
  if (!work.image) return null

  return (
    <img
      src={work.image.src}
      alt={work.image.alt}
      width={work.image.width}
      height={work.image.height}
      loading="lazy"
      decoding="async"
      className={className}
    />
  )
}

/** Whole card opens a detail dialog; the link (when set) lives inside it. */
export function OtherWorkCard({ work }: { work: OtherWork }) {
  return (
    <Dialog>
      <article className="group relative flex h-full flex-col outline-offset-3 outline-accent has-focus-visible:outline-2">
        <div className="aspect-[2.39/1] overflow-hidden bg-surface">
          <Still
            work={work}
            className="size-full object-cover transition-transform duration-700 ease-cinema motion-safe:group-hover:scale-[1.03]"
          />
        </div>

        <div className="flex-1 border-b border-rule py-4 transition-colors duration-300 group-hover:border-fg/40">
          <h3 className="font-medium">
            {/* Stretched: the ::after covers the whole card. */}
            <DialogTrigger className="text-left outline-none after:absolute after:inset-0 after:content-['']">
              {work.title}
            </DialogTrigger>
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-pretty text-muted">{work.description}</p>
        </div>
      </article>

      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/80"
        className="w-[min(calc(100vw-2rem),40rem)] max-w-none gap-0 overflow-hidden rounded-none p-0 sm:max-w-none"
      >
        <Still work={work} className="aspect-[2.39/1] w-full object-cover" />

        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="display text-h3 leading-tight font-medium">
              {work.title}
            </DialogTitle>
            <DialogClose
              aria-label="Close"
              className="-mt-1 -mr-2 grid size-10 shrink-0 place-items-center rounded-full text-muted transition-colors hover:text-fg"
            >
              <XIcon aria-hidden className="size-4" />
            </DialogClose>
          </div>

          <DialogDescription className="mt-3 text-pretty text-muted">
            {work.description}
            {work.year ? ` · ${work.year}` : null}
          </DialogDescription>

          {work.href ? (
            <a
              href={work.href}
              className="mt-6 inline-flex items-center gap-1.5 text-sm underline decoration-fg/25 underline-offset-4 transition-colors hover:decoration-accent"
              {...externalLinkProps(work.href)}
            >
              Visit
              <ArrowUpRight aria-hidden className="size-3.5" />
            </a>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
