
import Node from './node'

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

    this.$viewport = $svg
      .append('g')
      .classed('editor-viewport', true)
  }

  /**
   * 从事件中增加节点
   */
  addNodeFromEvent(event) {
    const node = new Node({
      $viewport: this.$viewport,
      size: this.nodeSize,
      x: event.x + this.$container.node().scrollLeft,
      y: event.y + this.$container.node().scrollTop
    })

    this.nodes.push(node)
  }
}

export default Editor
