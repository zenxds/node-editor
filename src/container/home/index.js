import { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { observer, inject } from "mobx-react"
import { autorun } from 'mobx'
import CSSModules from 'react-css-modules'
import * as d3 from 'd3'
import { Button, message } from 'antd'

import Editor from './component/editor'

import styles from './less/styles.less'

@inject('homeStore', 'homeActions')
@withRouter
@CSSModules(styles)
@observer
class Home extends Component {
  constructor(props, context) {
    super(props, context)

    this.store = this.props.homeStore

    // 画布大小
    this.canvasSize = {
      width: 2000,
      height: 2000
    }
    // 视口大小
    this.viewportSize = {
      width: 800,
      height: 500
    }
    // 节点大小
    this.nodeSize = {
      width: 120,
      height: 30
    }

  }

  /**
   * 拖拽源节点进画布
   */
  dragSource() {
    const editor = this.editor

    let $nodePlaceholder = null

    const drag = d3.drag()
      .on('start', function() {
        const sourceEvent = d3.event.sourceEvent

        $nodePlaceholder = d3.select('body')
          .append('div')
          .classed('editor-node-placeholder', true)
          .style('left', sourceEvent.pageX + 'px')
          .style('top', sourceEvent.pageY + 'px')
      })
      .on('drag', function() {
        const sourceEvent = d3.event.sourceEvent

        $nodePlaceholder
          .style('left', sourceEvent.pageX + 'px')
          .style('top', sourceEvent.pageY + 'px')
      })
      .on('end', function() {
        $nodePlaceholder.remove()

        const event = d3.event
        if(event.x >= 0 && event.y >= 0) {
          editor.addNodeFromEvent(d3.event)
        }
      })
      .container(this.container)

    d3.select(this.sourceNode).call(drag)
  }

  /**
   * 拖拽画布时，改变scrollLeft和scrollTop
   */
  dragContainer() {
    const container = this.container
    const $container = d3.select(this.container)

    const drag = d3.drag()
      .on('start', function() {
        $container.classed('dragging', true)
      })
      .on('drag', function() {
        const event = d3.event

        container.scrollLeft -= event.dx
        container.scrollTop -= event.dy
      })
      .on('end', function() {
        $container.classed('dragging', false)
      })
      .filter(() => {
        // d3.event.button 0是左键
        // 过滤掉拖拽连线的元素
        if (/(editor-node-entrance|editor-node-export)/.test(d3.event.target.className) || d3.event.button) {
          return false
        }

        return true
      })

    $container.call(drag)
  }

  componentDidMount() {
    const $container = d3.select(this.container)
    const $svg = this.$svg = $container.append('svg')

    const editor = this.editor = new Editor({
      canvasSize: this.canvasSize,
      nodeSize: this.nodeSize,
      $container,
      $svg
    })

    this.dragSource()
    this.dragContainer()
  }

  componentDidCatch(err) {
  }

  shouldComponentUpdate(nextProps, nextState) {
    return false
  }

  render() {
    return (
      <div>
        <div className="editor-toolbar">
          <a ref={sourceNode => {
            this.sourceNode = sourceNode
          }}>拖拽节点</a>
        </div>

        <div className="editor-container" ref={container => {
          this.container = container
        }} />
      </div>
    )
  }
}

export default Home
