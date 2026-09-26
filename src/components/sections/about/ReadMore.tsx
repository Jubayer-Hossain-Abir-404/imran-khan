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
          <div className="space-y-4 pt-5 text-pretty text-muted">
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
        className="group mt-6 inline-flex py-1 items-center gap-2 text-sm font-medium"
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
