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
      size,
      id
    } = this
    const $dragger = this.$fo.select('.editor-node-export')

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
      .on('end', function() {
        const target = d3.event.sourceEvent.target

        if (target && target.nodeName.toLowerCase() === 'div' && target.getAttribute('data-id')) {
          editor.addConnect(id, target.getAttribute('data-id'))
        }

        $path.remove()
      })
      .container(editor.$nodes.node())

    $dragger.call(drag)
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
