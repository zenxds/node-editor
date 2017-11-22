export function isInsideElement(event, className) {
  let element = event.srcElement || event.target

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

export function getParentUntil(element, className) {
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

export function getTransform($element) {
  const pattern = /translate\((-?\d+)\s+(-?\d+)\)/
  const match = pattern.exec($element.attr('transform'))

  return [parseInt(match[1]), parseInt(match[2])]
}
