export function isRoutePathname(pathname: string, routePathname: string, exact = false) {
  if (!pathname.startsWith('/') || !routePathname.startsWith('/')) return false
  const pathnameParts = pathname.replace(/\/$/, '').split('/')
  const routePathnameParts = routePathname.replace(/\/$/, '').split('/')
  if (exact && routePathnameParts.length !== pathnameParts.length) return false
  if (routePathnameParts.length > pathnameParts.length) return false
  for (let i = 0; i < routePathnameParts.length; i += 1) {
    const part = routePathnameParts[i]
    if (part.startsWith(':') && !!pathnameParts[i]) continue
    if (routePathnameParts[i] !== pathnameParts[i]) return false
  }
  return true
}
