=====================================================

interface slide {
  id: string
  slidename: string
  type: string
  content: contentItem
  slideorder: number
  classname: string
}

interface contentItem {
  id: string
  type: contentType
  name: string
  content: contentItem[] | string | string[] | string[][]
  initialRows: number
  initialColumns: number
  restrictToDrop: boolean
  columns: number
  placeholder: string
  classname: string
  alt: string
  callOutType: 'success' | 'warning' | 'info' | 'question' | 'caution'
  link: string
  code: string
  language: string
  bgColor: string
  isTransparent: boolean
}

type ContentType = 
  | 'column'
  | 'resizable-column'
  | 'text'
  | 'paragraph'
  | 'image'
  | 'table'
  | 'multiColumn'
  | 'blank'
  | 'imageAndText'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'title'
  | 'heading4'
  | 'table'
  | 'blockquote'
  | 'numberedList'
  | 'bulletedList'
  | 'code'
  | 'link'
  | 'quote'
  | 'divider'
  | 'calloutBox'
  | 'todoList'
  | 'bulletList'
  | 'codeBlock'
  | 'customButton'
  | 'table'
  | 'tableOfContents'

export interface Theme {
  name string
  fontFamily string
  fontColor string
  backgroundColor string
  slideBackgroundColor string
  accentColo string
  gradientBackground string
  sidebarColor string
  navbarColor string
  type: 'light' | 'dark'
}



https://plus.unsplash.com/premium_photo-1729004379397-ece899804701?q=80&w=2767&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D