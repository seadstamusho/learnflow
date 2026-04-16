import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkOsTabs from '@/lib/markdown/remark-os-tabs'
import rehypeToc from '@/lib/markdown/rehype-toc'
import type { TocItem } from '@/lib/markdown/rehype-toc'
import type { Element } from 'hast'
import type { Handlers } from 'mdast-util-to-hast'

export type ParsedMarkdown = {
  html: string
  tocItems: TocItem[]
  checklistItems: string[][]  // 見出しごとのチェックリスト項目
  osTabBlocks: OsTabBlockData[]  // OSタブブロックのデータ（クライアント側で使用）
}

export type OsTabBlockData = {
  windows: string
  mac: string
  lang: string
}

// OsTab カスタムノードの型（remark-os-tabs が生成）
type OsTabNode = {
  type: 'osTab'
  windows: string
  mac: string
  lang?: string
}

// rehype-sanitize のカスタムスキーマ（data-* 属性を div で許可）
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    div: [
      ...(defaultSchema.attributes?.div ?? []),
      'data*',
    ],
  },
}

// サーバーサイドでMarkdownをパース
export async function parseMarkdown(markdown: string): Promise<ParsedMarkdown> {
  const osTabBlocks: OsTabBlockData[] = []

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkOsTabs)
    .use(remarkRehype, {
      allowDangerousHtml: false,
      // 未知のカスタムノード（osTab）用ハンドラーを注入
      // Handlers 型は既知の mdast ノード型しか受け付けないため as unknown でキャスト
      handlers: {
        osTab: (_state: unknown, node: unknown): Element => {
          const osNode = node as OsTabNode
          const windows = encodeURIComponent(osNode.windows)
          const mac = encodeURIComponent(osNode.mac)
          const lang = encodeURIComponent(osNode.lang ?? 'bash')

          // クライアント側参照用にデータを収集
          osTabBlocks.push({
            windows: osNode.windows,
            mac: osNode.mac,
            lang: osNode.lang ?? 'bash',
          })

          return {
            type: 'element',
            tagName: 'div',
            properties: {
              dataOsTab: 'true',
              dataWindows: windows,
              dataMac: mac,
              dataLang: lang,
            },
            children: [],
          }
        },
      } as unknown as Handlers,
    })
    .use(rehypeSlug)
    .use(rehypeToc)
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeStringify)
    .process(markdown)

  const tocItems = (file.data.toc as TocItem[]) ?? []

  // チェックリスト項目の抽出（GFM task list items）
  const checklistItems: string[] = []
  const taskRegex = /^- \[[ x]\] (.+)$/gm
  let m
  while ((m = taskRegex.exec(markdown)) !== null) {
    checklistItems.push(m[1])
  }

  return {
    html: String(file),
    tocItems,
    checklistItems: [checklistItems],
    osTabBlocks,
  }
}

type MarkdownRendererProps = {
  html: string
}

// Server Component：sanitize済みHTMLを表示
export default function MarkdownRenderer({ html }: MarkdownRendererProps) {
  return (
    <article
      className="
        prose prose-zinc dark:prose-invert max-w-none
        prose-headings:scroll-mt-20
        prose-code:before:content-none prose-code:after:content-none
        prose-pre:p-0 prose-pre:bg-transparent
      "
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
