
import Node from './node'
import * as d3 from 'd3'

class Editor {
  constructor({ $container, $svg, canvasSize, nodeSize }) {

    this.$container = $container
    this.$svg = $svg

    this.nodes = []
    this.nodeSize = nodeSize
    this.canvasSize = canvasSize

    this.initElements()
  }

  initElements() {
    const $svg = this.$svg
    const canvasSize = this.canvasSize

    $svg
      .attr('width', canvasSize.width)
      .attr('height', canvasSize.height)
      .classed('editor-svg', true)

    // 连线三角形
    $svg
      .append('defs')
      .append('marker')
      .attr('id', 'line-triangle')
      .attr('markerWidth', 5)
      .attr('markerHeight', 10)
      .attr('refX', 5)
      .attr('refY', 5)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 5 5 0 10 Z')
      .style('fill', '#333')

    this.$viewport = $svg
      .append('g')
      .classed('editor-viewport', true)

    this.$nodes = this.$viewport.append('g').classed('editor-nodes', true)
    this.$lines = this.$viewport.append('g').classed('editor-lines', true)
  }

  /**
   * 从事件中增加节点
   */
  addNodeFromEvent(event) {
    const node = new Node({
      editor: this,
      size: this.nodeSize,
      x: event.x + this.$container.node().scrollLeft,
      y: event.y + this.$container.node().scrollTop
    })

    this.nodes.push(node)
  }

  addConnect(sourceId, targetId) {
    const source = this.getNodeById(sourceId)
    const target = this.getNodeById(targetId)

    const startX = source.x
    const startY = source.y + source.size.height / 2
    const endX = target.x
    const endY = target.y - target.size.height / 2
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

    this.$lines
      .append('path')
      .attr('d', p.toString())
      .style('fill', 'none')
      .style('stroke', '#666')
      .style('marker-end', 'url(#line-triangle)')
  }

  getNodeById(id) {
    return this.nodes.find(item => item.id === id)
  }
}

export default Editor
