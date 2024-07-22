declare module '*.svg' {
  import type { Assign } from '@ark-ui/react'
  import type { ComponentType, SVGProps } from 'react'
  import type { JsxStyleProps } from 'styled-system/types'

  const content: ComponentType<Assign<JsxStyleProps, SVGProps<SVGSVGElement>>>
  export default content
}
