import * as d3 from 'd3'

let cid = 0

class Node {
  constructor({ editor, x, y, size, $viewport }) {
    this.editor = editor
    this.size = size
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
      size,
      x,
      y,
      id
    } = this

    const $fo = this.$fo = this.editor.$nodes.append('foreignObject')
      .attr('width', size.width)
      .attr('height', size.height)
      .attr('x', x)
      .attr('y', y)

    const div = $fo.append('xhtml:div')
      .classed('editor-node', true)
      .attr('data-id', id)

    div.append('div')
      .classed('editor-node-content', true)
      .attr('data-id', id)

    div.append('div')
      .classed('editor-node-entrance', true)
      .attr('data-id', id)

    div.append('div')
      .classed('editor-node-export', true)
      .attr('data-id', id)
  }

  bindEvents() {
    // 右键菜单
    this.$fo.on('contextmenu', function() {
      d3.event.preventDefault()
    })
  }

  // 拖拽连线
  initDragLine() {
    const  {
      $fo,
      editor,
      size
    } = this
    const $dragger = $fo.select('.editor-node-export')

    let $path = null

    const drag = d3.drag()
      .on('start', function() {
        $path = editor.$lines
          .append('path')
          .style('fill', 'none')
          .style('stroke', '#666')
          .style('marker-end', 'url(#line-triangle)')
      })
      .on('drag', () => {
        const startX = this.x
        const startY = this.y + size.height / 2
        const endX = d3.event.x
        const endY = d3.event.y
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
        const target = d3.event.sourceEvent.target
        const id = target.getAttribute('data-id')

        if (target && target.nodeName.toLowerCase() === 'div' && id) {
          this.addConnect(id)
        }

        $path.remove()
      })
      .container(editor.$nodes.node())

    $dragger.call(drag)
  }

  /**
   * 关联两个节点
   */
  addConnect(targetId) {
    const target = this.editor.getNodeById(targetId)
    if (!target || (target.sourceNode && target.sourceNode.node === this)) {
      return
    }

    const $line = this.editor.$lines
      .append('path')
      .attr('d', this.getLinePath(this, target))
      .style('fill', 'none')
      .style('stroke', '#666')
      .style('marker-end', 'url(#line-triangle)')

    target.sourceNode = {
      node: this,
      $line
    }

    this.targetNodes.push({
      node: target,
      $line
    })
  }

  /**
   * 两个节点之间的连线路径
   */
  getLinePath(sourceNode, targetNode) {
    const startX = sourceNode.x
    const startY = sourceNode.y + sourceNode.size.height / 2
    const endX = targetNode.x
    const endY = targetNode.y - targetNode.size.height / 2
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

  /**
   * 更新连线
   */
  updateLines() {
    this.targetNodes.forEach(item => {
      item.$line.attr('d', this.getLinePath(this, item.node))
    })

    if (this.sourceNode) {
      this.sourceNode.$line.attr('d', this.getLinePath(this.sourceNode.node, this))
    }
  }

  // 拖拽内容
  initDrag() {
    const $fo = this.$fo
    const $dragger = this.$fo.select('.editor-node-content')

    const drag = d3.drag()
      .on('start', function() {
        $dragger.classed('dragging', true)
      })
      .on('drag', () => {
        const event = d3.event

        if (event.x >= 0 && event.y >= 0) {
          $fo.attr('x', event.x).attr('y', event.y)

          this.x = event.x
          this.y = event.y
          this.updateLines()
        }
      })
      .on('end', function() {
        $dragger.classed('dragging', false)
      })
      .container($fo.node())

    $dragger.call(drag)
  }
}

export default Node
