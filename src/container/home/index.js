import { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { observer, inject } from "mobx-react"
import { autorun } from 'mobx'
import CSSModules from 'react-css-modules'
import * as d3 from 'd3'
import { Button, message } from 'antd'
import { getParentUntil } from 'util'

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
   * 拖拽画布时，改变画布scrollLeft和scrollTop
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

    $container.call(drag)
  }

  componentDidMount() {
    const $container = d3.select(this.container)
    const $svg = this.$svg = $container
      .insert('svg', ':first-child')
      .attr('xmlns', d3.namespaces.svg)
      .attr('xmlns:xlink', d3.namespaces.xlink)

    const editor = this.editor = new Editor({
      width: this.canvasSize.width,
      height: this.canvasSize.height,
      nodeSize: this.nodeSize,
      $container,
      $svg
    })

    this.dragSource()
    // this.dragContainer()
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

          <a onClick={() => {
            this.editor.scaleUp()
          }}>放大</a>
          <a onClick={() => {
            this.editor.scaleDown()
          }}>缩小</a>

          <a onClick={() => {
            this.editor.scale = 1
            this.editor.makeScale()
          }}>原始大小</a>
        </div>

        <div className="editor-container" ref={container => {
          this.container = container
        }}>
          <ul className="contextmenu contextmenu-node">
            <li><a onClick={(e) => {
              const menu = getParentUntil(e.target, 'contextmenu')
              const selectNodes = this.editor.getSelectNodes()
              const nodes = selectNodes.length ? selectNodes : [this.editor.getNodeById(menu.dataset.id)]

              nodes.forEach(node => {
                node.destroy()
              })
            }}>删除节点</a></li>
          </ul>

          <ul className="contextmenu contextmenu-line">
            <li><a onClick={(e) => {
              const menu = getParentUntil(e.target, 'contextmenu')
              const sourceNode = this.editor.getNodeById(menu.dataset.sid)

              sourceNode.removeConnect(menu.dataset.tid)
            }}>删除连线</a></li>
          </ul>

          <ul className="contextmenu contextmenu-svg">
            <li>svg菜单项</li>
          </ul>
        </div>
      </div>
    )
  }
}

export default Home
