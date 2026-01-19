import type { CanvasElement, AnimationConfig } from '@/types'

export function exportCSS(elements: CanvasElement[]): string {
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
    css += `  animation: ${animationName} ${element.animation?.duration || 1000}ms ${element.animation?.easing || 'ease'} ${element.animation?.iterations || 1};\n`
    css += `}\n\n`
  })

  return css
}
