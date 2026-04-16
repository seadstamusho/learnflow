import { visit } from 'unist-util-visit'
import type { Root, Element } from 'hast'
import type { Plugin } from 'unified'

export type TocItem = {
  id: string
  text: string
  level: 2 | 3
}

// rehypeプラグイン：H2/H3からTOCデータを抽出し、プロパティに添付
const rehypeToc: Plugin<[], Root> = () => {
  return (tree, file) => {
    const items: TocItem[] = []

    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'h2' && node.tagName !== 'h3') return

      const level = node.tagName === 'h2' ? 2 : 3

      // テキスト内容を収集
      let text = ''
      visit(node, 'text', (textNode: { value: string }) => {
        text += textNode.value
      })

      // IDを取得（rehype-slugが付与したもの）
      const id = (node.properties?.id as string) ?? ''
      if (!id || !text) return

      items.push({ id, text, level })
    })

    // ファイルのデータとしてTOCを保存
    file.data.toc = items
  }
}

export default rehypeToc
