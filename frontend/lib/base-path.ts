// Base path the app is mounted under (e.g. "/drtouhidtapan" in a cPanel
// subfolder deploy, "" at the domain root). next/link, next/image and the
// router prefix this automatically — but raw fetch() to an absolute path does
// NOT, so use withBasePath() for any hand-written internal URL.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** Prefix an absolute app path ("/api/...") with the deploy base path. */
export function withBasePath(path: string): string {
  return `${BASE_PATH}${path}`;
}
