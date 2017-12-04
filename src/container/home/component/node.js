import * as d3 from 'd3'
import { getParentUntil, getTransform } from 'util/editor'

let cid = 0

const lineWidthNormal = 1
const lineWidthHover = 6

class Node {

  constructor({ editor, x, y, width, height, $viewport }) {
    this.editor = editor
    this.width = width
    this.height = height
    this.x = x
    this.y = y
    this.id = (cid++) + ''

    this.sourceNode = null
    this.targetNodes = []

    this.initElements()
    this.bindEvents()
    this.initDrag()
    this.initDragLine()
  }

  initElements() {
    const {
      editor,
      width,
      height,
      x,
      y,
      id
    } = this

    const $node = this.$node = this.editor.$nodes
      .append('g')
      .classed('editor-node', true)
      .attr('data-id', id)
      .attr('transform', `translate(${x} ${y})`)

    $node.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('rx', 15)
      .attr('ry', 15)
      .classed('editor-node-content', true)

    $node.append('circle')
      .attr('cx', width / 2)
      .attr('cy', 0)
      .attr('r', 5)
      .classed('editor-node-entrance', true)

    $node.append('circle')
      .attr('cx', width / 2)
      .attr('cy', height)
      .attr('r', 5)
      .classed('editor-node-export', true)
  }

  bindEvents() {
    // 阻止拖拽的冒泡
    this.$node.on('mousedown', function() {
      d3.event.stopPropagation()
    })
  }

  bindLineEvents($line) {
    $line.on('mousedown', function() {
      d3.event.stopPropagation()
    }).on('mouseenter', () => {
      $line.style('stroke-width', lineWidthHover)
    }).on('mouseleave', () => {
      $line.style('stroke-width', lineWidthNormal)
    })
  }

  // 拖拽连线
  initDragLine() {
    const  {
      $node,
      editor,
      width,
      height
    } = this
    const $dragger = $node.select('.editor-node-export')

    let $path = null

    const drag = d3.drag()
      .on('start', function() {
        $path = editor.$lines
          .append('path')
          .style('fill', 'none')
          .style('stroke', '#666')
          .style('stroke-width', lineWidthNormal)
          .style('marker-end', 'url(#line-triangle)')
      })
      .on('drag', () => {
        const startX = this.x + width / 2
        const startY = this.y + height
        const endX = Math.floor(d3.event.x / editor.scale)
        const endY = Math.floor(d3.event.y / editor.scale)
        const p = d3.path()

        p.moveTo(startX, startY)
        p.bezierCurveTo(
          endX + (startX - endX) / 2,
          startY,
          endX,
          endY + (startY - endY) / 2,
          endX,
          endY
        )

        $path.attr('d', p.toString())
      })
      .on('end', () => {
        $path.remove()

        const target = getParentUntil(d3.event.sourceEvent.target, '.editor-node')
        if (!target) {
          return
        }

        const id = target.dataset.id
        if (id) {
          this.addConnect(id)
        }
      })
      .container(editor.$svg.node())

    $dragger.call(drag)
  }

  /**
   * 关联两个节点
   */
  addConnect(targetId) {
    const target = this.editor.getNodeById(targetId)

    // 不允许关联自身
    // 树形结构，已经有sourceNode的不能继续关联
    if (!target || target === this || target.sourceNode) {
      return
    }

    const $line = this.editor.$lines
      .append('path')
      .classed('editor-line', true)
      .attr('id', `editor-line-${this.id}-${targetId}`)
      .attr('data-sid', this.id)
      .attr('data-tid', targetId)
      .attr('d', this.getLinePath(this, target))
      .style('fill', 'none')
      .style('stroke-width', lineWidthNormal)
      .style('stroke', '#666')
      .style('marker-end', 'url(#line-triangle)')

    this.bindLineEvents($line)

    target.sourceNode = this
    this.targetNodes.push(target)
  }

  /**
   * 两个节点之间的连线路径
   */
  getLinePath(sourceNode, targetNode) {
    const startX = sourceNode.x + sourceNode.width / 2
    const startY = sourceNode.y + sourceNode.height
    const endX = targetNode.x + targetNode.width / 2
    const endY = targetNode.y

    const p = d3.path()

    p.moveTo(startX, startY)
    p.bezierCurveTo(
      endX + (startX - endX)/2,
      startY,
      endX,
      endY + (startY - endY)/2,
      endX,
      endY
    )

    return p.toString()
  }

  getLine(sid, tid) {
    return d3.select(`#editor-line-${sid}-${tid}`)
  }

  /**
   * 更新连线
   */
  updateLines() {
    this.targetNodes.forEach(node => {
      const $line = this.getLine(this.id, node.id)
      $line.attr('d', this.getLinePath(this, node))
    })

    if (this.sourceNode) {
      const $line = this.getLine(this.sourceNode.id, this.id)
      $line.attr('d', this.getLinePath(this.sourceNode, this))
    }
  }

  // 拖拽内容
  initDrag() {
    const $dragger = this.$node.select('.editor-node-content')

    const drag = d3.drag()
      .on('start', () => {
        $dragger.classed('dragging', true)

        this.editor.hideContextmenu()
      })
      .on('drag', () => {
        // 可以拖拽多个节点
        const event = d3.event
        const selectNodes = this.editor.getSelectNodes()
        const nodes = selectNodes.length ? selectNodes : [this]

        if (event.x >= 0 && event.y >= 0) {
          nodes.forEach(node => {
            const [x, y] = getTransform(node.$node)
            node.$node.attr('transform', `translate(${x + event.dx} ${y + event.dy})`)

            node.x = x + event.dx
            node.y = y + event.dy
            node.updateLines()
          })
        }
      })
      .on('end', function() {
        $dragger.classed('dragging', false)
      })
      .container(this.editor.$svg.node())

    $dragger.call(drag)
  }

  /**
   * 删除source节点到target节点的关联
   */
  removeConnect(targetId) {
    const target = this.editor.getNodeById(targetId)
    if (!target) {
      return
    }

    const $line = this.getLine(this.id, targetId)

    $line.remove()
    target.sourceNode = null

    const index = this.targetNodes.indexOf(target)
    if (index > -1) {
      this.targetNodes.splice(index, 1)
    }
  }

  destroy() {
    if (this.sourceNode) {
      this.sourceNode.removeConnect(this.id)
      this.sourceNode = null
    }

    const targetIds = this.targetNodes.map(node => {
      return node.id
    })
    targetIds.forEach(id => {
      this.removeConnect(id)
    })

    const index = this.editor.nodes.indexOf(this)
    if (index > -1) {
      this.editor.nodes.splice(index, 1)
    }

    this.$node.remove()
  }
}

export default Node
