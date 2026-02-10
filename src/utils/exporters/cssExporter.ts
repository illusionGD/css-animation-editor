import type { ElementType, AnimationConfig } from '@/types'
import { ANIMATION_DEFAULT_DURATION } from '@/constants'

export function exportCSS(elements: ElementType[]): string {
  let css = ''

  elements.forEach((element, index) => {
    const animationName = `animation-${element.id || index}`

    // 生成 @keyframes
    css += `@keyframes ${animationName} {\n`
    if (element.animation?.keyframes) {
      element.animation.keyframes.forEach(keyframe => {
        const percentage = Math.round(keyframe.time * 100)
        css += `  ${percentage}% {\n`
        css += `    transform: translate(${keyframe.value}px, 0);\n`
        css += `  }\n`
      })
    }
    css += `}\n\n`

    // 生成元素样式
    css += `#element-${element.id || index} {\n`
    css += `  animation: ${animationName} ${element.animation?.duration || ANIMATION_DEFAULT_DURATION}ms ${element.animation?.easing || 'ease'} ${element.animation?.iterations || 1};\n`
    css += `}\n\n`
  })

  return css
}
