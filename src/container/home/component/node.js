import * as d3 from 'd3'

class Node {
  constructor({ x, y, size, $viewport }) {
    this.$viewport = $viewport
    this.size = size
    this.x = x
    this.y = y

    this.initElements()
    this.bindEvents()
    this.initDrag()
    this.initDragLine()
  }

  initElements() {
    const {
      $viewport,
      size,
      x,
      y
    } = this

    const $fo = this.$fo = $viewport.append('foreignObject')
      .attr('width', size.width)
      .attr('height', size.height)
      .attr('x', x)
      .attr('y', y)

    const div = $fo.append('xhtml:div')
      .classed('editor-node', true)

    div.append('div')
      .classed('editor-node-content', true)

    div.append('div')
      .classed('editor-node-entrance', true)

    div.append('div')
      .classed('editor-node-export', true)
  }

  bindEvents() {
    // 右键菜单
    this.$fo.on('contextmenu', function() {
      d3.event.preventDefault()
    })
  }

  // 拖拽连线
  initDragLine() {
    const $fo = this.$fo
    const $dragger = this.$fo.select('.editor-node-export')

    const drag = d3.drag()
      .on('start', function() {
      })
      .on('drag', function() {
        console.log(d3.event)
      })
      .on('end', function() {
      })
      .container(this.$viewport.node())

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
