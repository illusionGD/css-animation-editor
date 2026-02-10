import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ElementType, AnimationConfig, CSSProperty, CSSProperties } from '@/types'
import {
  ANIMATION_DEFAULT_DURATION,
  ANIMATION_DEFAULT_DELAY,
  ANIMATION_DEFAULT_ITERATIONS,
  ANIMATION_DEFAULT_DIRECTION,
  ANIMATION_DEFAULT_FILL_MODE,
  ANIMATION_DEFAULT_EASING,
  ELEMENT_DEFAULT_WIDTH_PX,
  ELEMENT_DEFAULT_HEIGHT_PX,
  ELEMENT_DEFAULT_POSITION_X,
  ELEMENT_DEFAULT_POSITION_Y,
  SUPPORTED_CSS_PROPERTIES
} from '@/constants'

// 默认动画配置
const defaultAnimation: AnimationConfig = {
  duration: ANIMATION_DEFAULT_DURATION,
  delay: ANIMATION_DEFAULT_DELAY,
  iterations: ANIMATION_DEFAULT_ITERATIONS,
  direction: ANIMATION_DEFAULT_DIRECTION,
  fillMode: ANIMATION_DEFAULT_FILL_MODE,
  easing: ANIMATION_DEFAULT_EASING,
  tracks: []
}

// 获取默认样式（根据可动画属性的默认值）
function getDefaultStyle(): Record<string, string | number> {
  const style: Record<string, string | number> = {}
  SUPPORTED_CSS_PROPERTIES.forEach(group => {
    group.children.forEach(prop => {
      if (prop.defaultValue !== undefined) {
        style[prop.props] = prop.defaultValue
      }
    })
  })
  return style
}

export const useElementStore = defineStore('element', () => {
  // ========== 状态 ==========
  // 使用 Map 存储元素，提高查找性能
  const elements = ref<Map<string, ElementType>>(new Map())

  // 选中状态：存储选中的元素 ID 数组
  const selectedElementIds = ref<string[]>([])

  // ========== 计算属性 ==========
  // 转换为数组形式（供其他模块使用）
  const elementsArray = computed(() => Array.from(elements.value.values()))

  // 元素总数
  const elementCount = computed(() => elements.value.size)

  // 选中元素数组（核心方法）
  const selectedElements = computed(() => {
    return selectedElementIds.value
      .map(id => elements.value.get(id))
      .filter((el): el is ElementType => el !== undefined)
  })

  // 是否有选中元素
  const hasSelection = computed(() => selectedElementIds.value.length > 0)

  // 第一个选中元素（常用场景）
  const firstSelectedElement = computed(() => selectedElements.value[0])

  // ========== 父子关系管理（辅助函数，在CRUD之前定义） ==========

  // 获取元素的子元素（内部辅助函数）
  function getChildrenInternal(parentId?: string): ElementType[] {
    return elementsArray.value
      .filter(el => (parentId === undefined ? !el.parentId : el.parentId === parentId))
      .sort((a, b) => (a.order || 0) - (b.order || 0))
  }

  // ========== CRUD 操作 ==========

  function createElement(data: Partial<ElementType>): string {
    const id = data.id || crypto.randomUUID()

    // 如果指定了 parentId，验证父元素存在
    if (data.parentId && !hasElement(data.parentId)) {
      console.warn(`Parent element ${data.parentId} does not exist`)
      data.parentId = undefined
    }

    // 计算排序顺序
    let order = data.order
    if (order === undefined) {
      const siblings = getChildrenInternal(data.parentId)
      order = siblings.length
    }

    // 合并默认样式和传入的样式
    const defaultStyle = getDefaultStyle()
    const mergedStyle = { ...defaultStyle, ...(data.style || {}) }

    // 确保 width 和 height 在 style 中（如果没有则使用默认值）
    if (!mergedStyle.width) {
      mergedStyle.width = ELEMENT_DEFAULT_WIDTH_PX
    }

    if (!mergedStyle.height) {
      mergedStyle.height = ELEMENT_DEFAULT_HEIGHT_PX
    }
    let level = 0
    if (data.parentId) {
      const parent = elements.value.get(data.parentId)
      level = parent ? parent.level + 1 : 0
    }
    const element: ElementType = {
      id,
      type: data.type || 'div',
      style: mergedStyle,
      animation: data.animation || defaultAnimation,
      name: data.name || '元素',
      visible: data.visible !== false,
      locked: data.locked || false,
      parentId: data.parentId,
      order,
      level
    }
    console.log("🚀 ~ element:", element)
    elements.value.set(id, element)
    return id
  }

  function getElement(id: string): ElementType | undefined {
    return elements.value.get(id)
  }

  function getElements(): ElementType[] {
    return elementsArray.value
  }

  function updateElement(id: string, updates: Partial<ElementType>): void {
    const element = elements.value.get(id)
    if (element) {
      // 使用展开运算符创建新对象，保持响应式
      elements.value.set(id, { ...element, ...updates })
    }
  }

  function updateElementStyle(id: string, style: CSSProperties): void {
    const element = elements.value.get(id)
    if (!element) return
    const newStyle = { ...element.style, ...style }
    elements.value.set(id, { ...element, style: newStyle })
  }

  function deleteElement(id: string): void {
    // 先删除所有后代（递归删除）
    // 使用内部辅助函数获取后代
    function getDescendantsInternal(elementId: string): ElementType[] {
      const descendants: ElementType[] = []
      const children = getChildrenInternal(elementId)
      children.forEach(child => {
        descendants.push(child)
        descendants.push(...getDescendantsInternal(child.id))
      })
      return descendants
    }

    const descendants = getDescendantsInternal(id)
    descendants.forEach(desc => {
      elements.value.delete(desc.id)
      deselectElement(desc.id)
    })

    elements.value.delete(id)
    // 如果删除的元素是选中的，从选中列表中移除
    deselectElement(id)
  }

  function hasElement(id: string): boolean {
    return elements.value.has(id)
  }

  function getElementsByIds(ids: string[]): ElementType[] {
    return ids
      .map(id => elements.value.get(id))
      .filter((el): el is ElementType => el !== undefined)
  }

  function deleteElements(ids: string[]): void {
    ids.forEach(id => {
      elements.value.delete(id)
      deselectElement(id)
    })
  }

  function clearAll(): void {
    elements.value.clear()
    selectedElementIds.value = []
  }

  // ========== 选中状态管理 ==========

  function selectElement(ids: string | string[], multi = false): void {
    // 统一转换为数组
    const idArray = Array.isArray(ids) ? ids : [ids]

    // 验证所有元素是否存在，过滤掉不存在的 ID
    const validIds = idArray.filter(id => {
      if (!hasElement(id)) {
        console.warn(`Element ${id} does not exist`)
        return false
      }
      return true
    })

    if (validIds.length === 0) {
      return
    }

    if (multi) {
      // 追加模式：将新选中的元素添加到现有选中列表（去重）
      validIds.forEach(id => {
        if (!selectedElementIds.value.includes(id)) {
          selectedElementIds.value.push(id)
        }
      })
    } else {
      // 替换模式：直接替换选中列表
      selectedElementIds.value = [...validIds]
    }
  }

  function deselectElement(ids: string | string[]): void {
    const idArray = Array.isArray(ids) ? ids : [ids]

    idArray.forEach(id => {
      const index = selectedElementIds.value.indexOf(id)
      if (index >= 0) {
        selectedElementIds.value.splice(index, 1)
      }
    })
  }

  function clearSelection(): void {
    selectedElementIds.value = []
  }


  function toggleSelection(ids: string | string[]): void {
    const idArray = Array.isArray(ids) ? ids : [ids]

    idArray.forEach(id => {
      if (selectedElementIds.value.includes(id)) {
        deselectElement(id)
      } else {
        selectElement(id, true) // 追加模式
      }
    })
  }

  function isSelected(id: string): boolean {
    return selectedElementIds.value.includes(id)
  }

  // ========== 父子关系管理 ==========

  // 获取元素的子元素
  function getChildren(parentId?: string): ElementType[] {
    return getChildrenInternal(parentId)
  }

  // 获取元素的父元素
  function getParent(elementId: string): ElementType | undefined {
    const element = elements.value.get(elementId)
    if (!element || !element.parentId) return undefined
    return elements.value.get(element.parentId)
  }

  // 获取元素的所有祖先元素（从父元素到根元素）
  function getAncestors(elementId: string): ElementType[] {
    const ancestors: ElementType[] = []
    let current = getParent(elementId)
    while (current) {
      ancestors.push(current)
      current = getParent(current.id)
    }
    return ancestors
  }

  // 获取元素的所有后代元素（递归）
  function getDescendants(elementId: string): ElementType[] {
    const descendants: ElementType[] = []
    const children = getChildren(elementId)
    children.forEach(child => {
      descendants.push(child)
      descendants.push(...getDescendants(child.id))
    })
    return descendants
  }

  // 设置元素的父元素
  function setParent(elementId: string, parentId?: string): boolean {
    const element = elements.value.get(elementId)
    if (!element) return false

    // 检查是否会形成循环引用
    if (parentId) {
      const ancestors = getAncestors(elementId)
      if (ancestors.some(a => a.id === parentId)) {
        console.warn(`Cannot set parent: would create circular reference`)
        return false
      }
      // 验证父元素存在
      if (!hasElement(parentId)) {
        console.warn(`Parent element ${parentId} does not exist`)
        return false
      }
    }

    // 更新父元素和排序
    const siblings = getChildrenInternal(parentId)
    updateElement(elementId, {
      parentId,
      order: siblings.length
    })
    return true
  }

  // 移动元素到新的父元素下
  function moveElement(elementId: string, newParentId?: string, newOrder?: number): boolean {
    if (!setParent(elementId, newParentId)) return false

    if (newOrder !== undefined) {
      const siblings = getChildrenInternal(newParentId)
      // 调整其他元素的order
      siblings.forEach((sibling, index) => {
        if (sibling.id !== elementId) {
          let targetOrder = index
          if (index >= newOrder) {
            targetOrder = index + 1
          }
          if (sibling.order !== targetOrder) {
            updateElement(sibling.id, { order: targetOrder })
          }
        }
      })
      updateElement(elementId, { order: newOrder })
    } else {
      // 如果没有指定order，添加到末尾
      const siblings = getChildrenInternal(newParentId)
      updateElement(elementId, { order: siblings.length - 1 })
    }

    return true
  }

  // 检查元素是否为另一个元素的后代
  function isDescendantOf(elementId: string, ancestorId: string): boolean {
    const ancestors = getAncestors(elementId)
    return ancestors.some(a => a.id === ancestorId)
  }

  // 获取根元素（没有父元素的元素）
  function getRootElements(): ElementType[] {
    return getChildren(undefined)
  }

  // 获取元素的动画轨道（只读方法，供其他store使用）
  function getElementTracks(elementId: string) {
    const element = elements.value.get(elementId)
    return element?.animation.tracks || []
  }

  // ========== 导出 ==========
  return {
    // 状态
    elements, // Map 形式（内部使用）
    selectedElementIds, // 选中 ID 数组

    // 计算属性
    elementsArray, // 所有元素数组
    elementCount, // 元素总数
    selectedElements, // 选中元素数组（核心方法）
    hasSelection, // 是否有选中
    firstSelectedElement, // 第一个选中元素

    // CRUD 方法
    /**
     * 创建元素
     * @param data 元素数据（部分）
     * @returns 元素 ID
     */
    createElement,
    /**
     * 获取单个元素
     * @param id 元素 ID
     * @returns 元素或 undefined
     */
    getElement,
    /**
     * 获取所有元素（数组形式）
     * @returns 元素数组
     */
    getElements,
    /**
     * 更新元素
     * @param id 元素 ID
     * @param updates 要更新的字段
     */
    updateElement,
    /**
     * 更新元素样式
     * @param id 元素 ID
     * @param style 要更新的样式字段
     */
    updateElementStyle,
    /**
     * 删除元素
     * @param id 元素 ID
     */
    deleteElement,
    /**
     * 检查元素是否存在
     * @param id 元素 ID
     * @returns 是否存在
     */
    hasElement,
    /**
     * 批量获取元素
     * @param ids 元素 ID 数组
     * @returns 元素数组
     */
    getElementsByIds,
    /**
     * 批量删除元素
     * @param ids 元素 ID 数组
     */
    deleteElements,
    /**
     * 清空所有元素
     */
    clearAll,

    // 选中状态方法
    /**
     * 选中元素
     * @param ids 元素 ID 或 ID 数组
     * @param multi 是否追加模式（true: 追加到现有选中，false: 替换选中）
     */
    selectElement,
    /**
     * 取消选中元素
     * @param ids 元素 ID 或 ID 数组
     */
    deselectElement,
    /**
     * 清空选中状态
     */
    clearSelection,
    /**
     * 切换元素选中状态（多选模式）
     * @param ids 元素 ID 或 ID 数组
     */
    toggleSelection,
    /**
     * 检查元素是否被选中
     * @param id 元素 ID
     * @returns 是否选中
     */
    isSelected,

    // 父子关系方法
    /**
     * 获取元素的子元素
     * @param parentId 父元素ID，如果为undefined则获取根元素
     * @returns 子元素数组（按order排序）
     */
    getChildren,
    /**
     * 获取元素的父元素
     * @param elementId 元素ID
     * @returns 父元素或undefined
     */
    getParent,
    /**
     * 获取元素的所有祖先元素（从父元素到根元素）
     * @param elementId 元素ID
     * @returns 祖先元素数组（从父到根）
     */
    getAncestors,
    /**
     * 获取元素的所有后代元素（递归）
     * @param elementId 元素ID
     * @returns 后代元素数组
     */
    getDescendants,
    /**
     * 设置元素的父元素
     * @param elementId 元素ID
     * @param parentId 父元素ID，undefined表示设为根元素
     * @returns 是否成功
     */
    setParent,
    /**
     * 移动元素到新的父元素下
     * @param elementId 元素ID
     * @param newParentId 新父元素ID，undefined表示移到根
     * @param newOrder 新的排序位置，undefined表示添加到末尾
     * @returns 是否成功
     */
    moveElement,
    /**
     * 检查元素是否为另一个元素的后代
     * @param elementId 元素ID
     * @param ancestorId 祖先元素ID
     * @returns 是否为后代
     */
    isDescendantOf,
    /**
     * 获取根元素（没有父元素的元素）
     * @returns 根元素数组（按order排序）
     */
    getRootElements,

    /**
     * 获取元素的动画轨道（只读方法）
     * @param elementId 元素ID
     * @returns 动画轨道数组
     */
    getElementTracks
  }
})
