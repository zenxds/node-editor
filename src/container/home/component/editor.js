
import Node from './node'
import * as d3 from 'd3'
import {
  getElementLeft,
  getElementTop
} from 'util/offset'
import { isInsideElement, getParentUntil } from 'util'

class Editor {
  constructor({ $container, $svg, width, height, nodeSize }) {

    this.$container = $container
    this.$svg = $svg

    this.width = width
    this.height = height
    this.scale = 1
    this.nodeSize = nodeSize
    this.nodes = []

    this.initElements()
    this.bindEvents()
    this.initDragSelection()
  }

  initElements() {
    const {
      $svg,
      width,
      height
    } = this

    $svg
      .attr('width', width)
      .attr('height', height)
      .classed('editor-svg', true)

    // 连线三角形
    $svg
      .append('defs')
      .append('marker')
      .attr('id', 'line-triangle')
      .attr('markerWidth', 5)
      .attr('markerHeight', 10)
      .attr('markerUnits', 'userSpaceOnUse')
      .attr('refX', 5)
      .attr('refY', 5)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 5 5 0 10 Z')
      .style('fill', '#333')

    this.$viewport = $svg
      .append('g')
      .classed('editor-viewport', true)

    // 线在下面
    this.$lines = this.$viewport.append('g').classed('editor-lines', true)
    this.$nodes = this.$viewport.append('g').classed('editor-nodes', true)
  }

  bindEvents() {
    // 右键菜单
    d3.select(document).on('contextmenu', () => {
      const event = d3.event

      // 不同类型元素的右键菜单不一样
      const types = ['node', 'line', 'svg']

      for (let i = 0; i < types.length; i++) {
        if (isInsideElement(event, 'editor-' + types[i])) {
          event.preventDefault()
          this.showContextmenu(types[i], event)
          return
        }
      }

      // 否则隐藏menu
      this.hideContextmenu()
    }).on('click', () => {
      this.onBlur()
    })

    d3.select(window).on('resize', () => {
      this.hideContextmenu()
    })
  }

  /**
   * 拖拽生成选区
   */
  initDragSelection() {
    let container = this.$container.node()
    let $placeholder = null
    let startEvent

    const drag = d3.drag()
      .on('start', () => {
        const { pageX, pageY } = d3.event.sourceEvent

        startEvent = d3.event
        $placeholder = d3.select('body')
          .append('div')
          .classed('editor-selection', true)
          .style('left', pageX + 'px')
          .style('top', pageY + 'px')

        this.onBlur()
      })
      .on('drag', () => {
        const sourceEvent = d3.event.sourceEvent
        const scale = this.scale

        $placeholder
          .style('left', Math.min(startEvent.sourceEvent.pageX, sourceEvent.pageX) + 'px')
          .style('top', Math.min(startEvent.sourceEvent.pageY, sourceEvent.pageY) + 'px')
          .style('width', Math.abs(startEvent.sourceEvent.pageX - sourceEvent.pageX) + 'px')
          .style('height', Math.abs(startEvent.sourceEvent.pageY - sourceEvent.pageY) + 'px')

        const endEvent = d3.event
        const x = Math.min(startEvent.x, endEvent.x) + container.scrollLeft
        const y = Math.min(startEvent.y, endEvent.y) + container.scrollTop
        const width = Math.abs(startEvent.x - endEvent.x)
        const height = Math.abs(startEvent.y - endEvent.y)

        this.nodes.forEach(node => {
          const yInSelection = node.y * scale <= y + height && node.y * scale + node.height * scale >= y
          const xInSelection = node.x * scale <= x + width && node.x * scale + node.width * scale >= x

          if (xInSelection && yInSelection) {
            node.$node.classed('selected', true)
          } else {
            node.$node.classed('selected', false)
          }
        })
      })
      .on('end', () => {
        $placeholder.remove()
      })
      .container(container)

    this.$svg.call(drag)
  }

  /**
   * 展示右键菜单
   * @param {*} type
   * @param {*} event
   */
  showContextmenu(type, event) {
    const container = this.$container.node()
    const offsetX = getElementLeft(container)
    const offsetY = getElementTop(container)
    const dataset = getParentUntil(event.target, `editor-${type}`).dataset

    const $menu = d3.selectAll('.contextmenu')
      .style('display', 'none')
      .filter(`.contextmenu-${type}`)
      .style('display', 'block')
      .style('left', (event.pageX - offsetX + container.scrollLeft) + 'px')
      .style('top', (event.pageY - offsetY + container.scrollTop) + 'px')


    if (type === 'node') {
      $menu.attr('data-id', dataset.id)
    } else if (type === 'line') {
      $menu.attr('data-sid', dataset.sid).attr('data-tid', dataset.tid)
    }
  }

  // 隐藏menu
  hideContextmenu() {
    d3.selectAll('.contextmenu').style('display', 'none')
  }

  onBlur() {
    this.hideContextmenu()

    // 去掉节点的选中状态
    this.nodes.forEach(node => {
      node.$node.classed('selected', false)
    })
  }

  /**
   * 从事件中增加节点
   */
  addNodeFromEvent(event) {
    const container = this.$container.node()
    const { width, height } = this.nodeSize

    const node = new Node({
      editor: this,
      width,
      height,
      // 减去transform的偏移量
      x: Math.floor(event.x / this.scale) + container.scrollLeft - width / 2,
      y: Math.floor(event.y / this.scale) + container.scrollTop - height / 2
    })

    this.nodes.push(node)
  }

  getNodeById(id) {
    return this.nodes.find(item => item.id === id)
  }

  getSelectNodes() {
    return this.$svg.selectAll('.editor-node.selected').nodes().map(item => {
      return this.getNodeById(item.dataset.id)
    })
  }

  scaleUp() {
    this.scale = Number((this.scale + 0.1).toFixed(1))
    this.$viewport.attr('transform', `scale(${this.scale})`)
    this.makeScale()
  }
  scaleDown() {
    if (this.scale <= 0.5) {
      return
    }

    this.scale = Number((this.scale - 0.1).toFixed(1))
    this.makeScale()
  }

  makeScale() {
    this.$viewport.attr('transform', `scale(${this.scale})`)
  }
}

export default Editor
