
import Node from './node'
import * as d3 from 'd3'
import {
  getElementLeft,
  getElementTop,
  isInsideElement,
  getParentUntil
} from 'util/editor'

class Editor {
  constructor({ $container, width, height, nodeSize, canvas, data }) {
    this.$container = $container
    this.width = width
    this.height = height
    this.canvas = canvas
    this.scale = 1
    this.nodeSize = nodeSize
    this.nodes = []

    this.initElements()
    this.bindEvents()
    this.initDragSelection()
    this.buildFromData(data)
  }

  /**
   * 序列化数据
   */
  serialize() {
    const container = this.$container.node()

    return {
      scrollLeft: container.scrollLeft,
      scrollTop: container.scrollTop,
      scale: this.scale,
      nodes: this.nodes.map(node => node.serialize())
    }
  }

  /**
   * 从数据中构建editor
   */
  buildFromData(data) {
    const container = this.$container.node()

    if (data.scrollLeft) {
      container.scrollLeft = data.scrollLeft
    }
    if (data.scrollTop) {
      container.scrollTop = data.scrollTop
    }

    if (data.scale) {
      this.makeScale(data.scale)
    }

    // 先添加节点，再处理连线信息，因为连线需要节点信息
    if (data.nodes) {
      data.nodes.forEach(d => {
        this.addNodeFromData(d)
      })

      data.nodes.forEach(item => {
        const node = this.getNodeById(item.id)
        if (!node) {
          return
        }

        item.targetNodes.forEach(tid => {
          node.addConnect(tid)
        })
      })
    }
  }

  /**
   * 节点、连线、scale等信息发生变化
   */
  onChange() {
    localStorage.setItem('editor-data', JSON.stringify(this.serialize()))
  }

  initElements() {
    const {
      $container,
      width,
      height,
      canvas
    } = this

    this.$nodes = canvas.main.append('div').classed('editor-nodes', true)

    const $svg = this.$svg = canvas.svg
      .insert('svg', ':first-child')
      .attr('xmlns', d3.namespaces.svg)
      .attr('xmlns:xlink', d3.namespaces.xlink)
      .attr('width', width)
      .attr('height', height)
      .classed('editor-svg', true)

    // 连线的三角形
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

    this.$lines = this.$viewport.append('g').classed('editor-lines', true)
    this.$menus = canvas.guide.selectAll('.contextmenu')
  }

  bindEvents() {
    // 右键菜单
    d3.select(document).on('contextmenu', () => {
      const event = d3.event

      // 不同类型元素的右键菜单不一样
      const types = ['node', 'line', 'svg']

      for (let i = 0; i < types.length; i++) {
        if (isInsideElement(event, '.editor-' + types[i])) {
          this.showContextmenu(types[i], event)

          event.preventDefault()
          return
        }
      }

      // 否则隐藏menu
      this.hideContextmenu()
    }).on('click', () => {
      if (!isInsideElement(d3.event, '.editor-toolbar')) {
        this.onBlur()
      }
    })

    d3.select(window).on('resize', () => {
      this.hideContextmenu()
    })

    this.$container.on('scroll', () => {
      this.onChange()
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
        startEvent = d3.event

        $placeholder = d3.select('body')
          .append('div')
          .classed('editor-selection', true)

        this.onBlur()
      })
      .on('drag', () => {
        const endEvent = d3.event
        const startSourceEvent = startEvent.sourceEvent
        const endSourceEvent = endEvent.sourceEvent
        const scale = this.scale

        // 选框
        $placeholder
          .style('left', Math.min(startSourceEvent.pageX, endSourceEvent.pageX) + 'px')
          .style('top', Math.min(startSourceEvent.pageY, endSourceEvent.pageY) + 'px')
          .style('width', Math.abs(startSourceEvent.pageX - endSourceEvent.pageX) + 'px')
          .style('height', Math.abs(startSourceEvent.pageY - endSourceEvent.pageY) + 'px')

        const x = Math.min(startEvent.x, endEvent.x) + container.scrollLeft
        const y = Math.min(startEvent.y, endEvent.y) + container.scrollTop
        const width = Math.abs(startEvent.x - endEvent.x)
        const height = Math.abs(startEvent.y - endEvent.y)

        // 判断节点是否被框选住
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
    const dataset = getParentUntil(event.target, `.editor-${type}`).dataset

    const $menu = this.$menus
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
    this.$menus.style('display', 'none')
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
      x: Math.floor((event.x + container.scrollLeft - width / 2) / this.scale),
      y: Math.floor((event.y + container.scrollTop - height / 2) / this.scale)
    })

    this.nodes.push(node)
    this.onChange()
  }

  addNodeFromData(data) {
    const container = this.$container.node()
    const { width, height } = this.nodeSize

    const node = new Node({
      editor: this,
      width,
      height,
      id: data.id,
      x: data.x,
      y: data.y
    })

    this.nodes.push(node)
  }

  getNodeById(id) {
    return this.nodes.find(item => item.id === id)
  }

  /**
   * 获取被框选的node
   */
  getSelectNodes() {
    return this.canvas.main.selectAll('.editor-node.selected').nodes().map(item => {
      return this.getNodeById(item.dataset.id)
    })
  }

  /**
   * 放大画布
   */
  scaleUp() {
    this.makeScale(Number((this.scale + 0.1).toFixed(1)))
  }

  /**
   * 缩小画布
   */
  scaleDown() {
    if (this.scale <= 0.5) {
      return
    }

    this.makeScale(Number((this.scale - 0.1).toFixed(1)))
  }

  makeScale(scale) {
    if (scale === this.scale) {
      return
    }

    this.scale = scale
    this.$viewport.attr('transform', `scale(${scale})`)
    this.$nodes.style('transform', `scale(${scale})`)
    this.onChange()
  }
}

export default Editor
