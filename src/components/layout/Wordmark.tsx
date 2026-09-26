import { cn } from '@/lib/utils'

/** Tracked serif caps: first name upright, surname italic. Tracking opens on hover of a `group`. */
export function Wordmark({ name, className }: { name: string; className?: string }) {
  const [first, ...rest] = name.split(' ')

  return (
    <span
      className={cn(
        'display leading-none tracking-[0.14em] whitespace-nowrap uppercase transition-[letter-spacing,color] duration-500 ease-out-quart group-hover:tracking-[0.2em]',
        className,
      )}
    >
      <span className="font-semibold">{first}</span>
      {rest.length > 0 ? <span className="italic"> {rest.join(' ')}</span> : null}
    </span>
  )
}
