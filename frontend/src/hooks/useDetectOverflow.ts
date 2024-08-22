import { useCallback, useEffect, useRef, useState } from 'react'

export function useDetectOverflow<T extends HTMLDivElement>(): [overflow: boolean, ref: (element: T | null) => void] {
  const [isOverflow, setIsOverflow] = useState(false)
  const resizeObserver = useRef<ResizeObserver | null>(null)
  const ref = useCallback((element: T | null) => {
    if (!element) return
    setIsOverflow(element.offsetWidth !== element.scrollWidth)
    resizeObserver.current?.disconnect()
    resizeObserver.current = new ResizeObserver(() => {
      setIsOverflow(element.offsetWidth !== element.scrollWidth)
    })
    resizeObserver.current?.observe(element)
  }, [])

  useEffect(() => {
    return () => resizeObserver.current?.disconnect()
  }, [])

  return [isOverflow, ref]
}
