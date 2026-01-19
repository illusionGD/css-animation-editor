import type { CanvasElement } from '@/types'
import { exportCSS } from './cssExporter'

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
    html += `  <div id="element-${element.id || index}" style="
    width: ${element.size.width}px;
    height: ${element.size.height}px;
    background: ${element.style.backgroundColor || '#18a058'};
    position: absolute;
    left: ${element.position.x}px;
    top: ${element.position.y}px;
  "></div>\n`
  })

  html += `</body>
</html>`

  return html
}
