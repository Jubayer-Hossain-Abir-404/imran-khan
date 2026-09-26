import type { ReactNode } from 'react'
import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'
import { LOADER_SCRIPT } from '@/components/layout/Loader'
import { ANCHORS, hash } from '@/lib/links'
import type { Route } from './+types/root'
import './styles/index.css'

export function Layout({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning: extensions (Grammarly etc.) add attributes to <html>/<body> before
    // hydration. Only these two elements' own attributes are exempt, not their children.
    <html lang="en" id={ANCHORS.top} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0a0c0c" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {/* Before first paint, so the loader never flashes in late. */}
        <script dangerouslySetInnerHTML={{ __html: LOADER_SCRIPT }} />
        <Meta />
        <Links />
      </head>
      <body className="grain" suppressHydrationWarning>
        <a
          href={hash(ANCHORS.main)}
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-70 focus:bg-fg focus:px-3 focus:py-2 focus:text-bg"
        >
          Skip to content
        </a>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const isResponse = isRouteErrorResponse(error)
  const title = isResponse ? `${error.status}` : 'Something broke'
  const detail = isResponse
    ? error.status === 404
      ? 'That page does not exist.'
      : error.statusText
    : 'An unexpected error occurred.'

  return (
    <main
      id={ANCHORS.main}
      className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-4 px-gutter py-24"
    >
      <p className="meta text-muted">Error</p>
      <h1 className="display text-h2">{title}</h1>
      <p className="text-lead text-muted">{detail}</p>
      <a href="/" className="mt-4 meta text-accent underline underline-offset-4">
        Back to the homepage
      </a>
    </main>
  )
}
