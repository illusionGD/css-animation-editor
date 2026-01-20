import type { CanvasElement } from '@/types'
import { exportCSS } from './cssExporter'
import { parseStyleValue } from '../calculators'
import { ELEMENT_DEFAULT_WIDTH, ELEMENT_DEFAULT_HEIGHT, COLOR_ELEMENT_DEFAULT_BACKGROUND } from '@/constants'

export function exportHTML(elements: CanvasElement[]): string {
  const css = exportCSS(elements)

  let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CSS动画</title>
  <style>
${css}
  </style>
</head>
<body>
`

  elements.forEach((element, index) => {
    // 从 style 中解析宽高
    const width = parseStyleValue(element.style.width, ELEMENT_DEFAULT_WIDTH)
    const height = parseStyleValue(element.style.height, ELEMENT_DEFAULT_HEIGHT)
    
    html += `  <div id="element-${element.id || index}" style="
    width: ${width}px;
    height: ${height}px;
    background: ${element.style.backgroundColor || COLOR_ELEMENT_DEFAULT_BACKGROUND};
    position: absolute;
    left: ${element.position.x}px;
    top: ${element.position.y}px;
  "></div>\n`
  })

  html += `</body>
</html>`

  return html
}
