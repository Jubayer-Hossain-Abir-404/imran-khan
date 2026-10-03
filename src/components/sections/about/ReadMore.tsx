import { ArrowRight } from 'lucide-react'
import { useId, useState } from 'react'

/** Inline disclosure. Collapsed text stays in the DOM (crawlable) but is inert. */
export function ReadMore({ paragraphs }: { paragraphs: string[] }) {
  const [open, setOpen] = useState(false)
  const id = useId()

  if (paragraphs.length === 0) return null

  return (
    <>
      <div
        id={id}
        inert={!open}
        className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-cinema data-open:grid-rows-[1fr]"
        data-open={open ? '' : undefined}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 pt-4 text-[0.9375rem] leading-relaxed text-pretty text-fg/85 md:pt-5">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        className="group mt-4 inline-flex items-center gap-2 py-1 text-sm font-medium md:mt-6"
      >
        {open ? 'Read less' : 'Read more'}
        <ArrowRight
          aria-hidden
          className="size-4 transition-transform group-hover:translate-x-0.5 group-aria-expanded:-rotate-90"
        />
      </button>
    </>
  )
}
