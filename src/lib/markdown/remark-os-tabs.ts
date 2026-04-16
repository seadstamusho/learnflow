import { visit } from 'unist-util-visit'
import type { Root, Code, Parent } from 'mdast'
import type { Plugin } from 'unified'

// remark プラグイン：隣接する bash:windows と bash:mac を OsTab ノードに変換
const remarkOsTabs: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'code', (node: Code, index, parent: Parent | null) => {
      if (!parent || index === undefined) return

      const isWindows = node.lang === 'bash:windows' || node.lang === 'cmd:windows'
      if (!isWindows) return

      const next = parent.children[index + 1]
      if (!next || next.type !== 'code') return
      const nextCode = next as Code
      const isMac = nextCode.lang === 'bash:mac' || nextCode.lang === 'bash:linux'
      if (!isMac) return

      // 2ノードをまとめて OsTab カスタムノードに置換
      const osTabNode = {
        type: 'osTab',
        windows: node.value,
        mac: nextCode.value,
        lang: 'bash',
      }

      parent.children.splice(index, 2, osTabNode as unknown as Code)
    })
  }
}

export default remarkOsTabs
