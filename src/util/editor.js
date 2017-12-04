
/**
 * 将className 格式化为不带点的形式以供classList使用
 */
function normalizeClassName(className) {
  return className.replace(/\./g, '')
}

/**
 * 判断事件是否发生在元素内部
 */
export function isInsideElement(event, className) {
  let element = event.srcElement || event.target
  className = normalizeClassName(className)

  if (element.classList.contains(className)) {
    return true
  } else {
    do {
      element = element.parentNode

      if (element && element.classList && element.classList.contains(className)) {
        return true
      }
    } while (element)
  }

  return false
}

/**
 * 向上查找父元素
 */
export function getParentUntil(element, className) {
  className = normalizeClassName(className)

  if (element.classList.contains(className)) {
    return element
  } else {
    do {
      element = element.parentNode

      if (element && element.classList && element.classList.contains(className)) {
        return element
      }
    } while (element)
  }

  return null
}

/**
 * 获取d3元素的transform值
 */
export function getTransform($element) {
  const pattern = /translate\((-?\d+)\s+(-?\d+)\)/
  const match = pattern.exec($element.attr('transform'))

  return [parseInt(match[1]), parseInt(match[2])]
}

/**
 * 获取元素偏移量
 */
export function getElementLeft(element) {
  let actualLeft = element.offsetLeft
  let current = element.offsetParent
  while (current !== null) {
    actualLeft += current.offsetLeft
    current = current.offsetParent
  }
  return actualLeft
}

export function getElementTop(element) {
  let actualTop = element.offsetTop
  let current = element.offsetParent
  while (current !== null) {
    actualTop += current.offsetTop
    current = current.offsetParent
  }
  return actualTop
}

