import { DOMParser } from "@xmldom/xmldom"

if (!("DOMParser" in globalThis)) {
  ;(globalThis as typeof globalThis & { DOMParser: typeof DOMParser }).DOMParser = DOMParser
}

;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
