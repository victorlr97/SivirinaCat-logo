import * as amplitude from "@amplitude/unified"

export function trackProductListViewed(params: {
  listName: string
  listSource: string
  productsShown: number
  pageNumber?: number
  sortOption?: string
  collectionName?: string
}) {
  amplitude.track("Product List Viewed", {
    "list name": params.listName,
    "list source": params.listSource,
    "products shown": params.productsShown,
    "page number": params.pageNumber,
    "sort option": params.sortOption,
    "collection name": params.collectionName,
  })
}

export function trackSearchSubmitted(params: {
  searchQuery: string
  searchContext: string
  resultsCount: number
  noResults: boolean
  isAutocomplete: boolean
}) {
  amplitude.track("Search Submitted", {
    "search query": params.searchQuery,
    "search context": params.searchContext,
    "results count": params.resultsCount,
    "no results": params.noResults,
    "is autocomplete": params.isAutocomplete,
  })
}

export function trackSearchResultSelected(params: {
  searchQuery: string
  resultPosition: number
  productId: string
  productName: string
  productType: string
}) {
  amplitude.track("Search Result Selected", {
    "search query": params.searchQuery,
    "result position": params.resultPosition,
    "product id": params.productId,
    "product name": params.productName,
    "product type": params.productType,
  })
}

export function trackProductViewed(params: {
  productId: string
  productName: string
  productType: string
  priceBrl: number
  currency: string
  availabilityStatus: string
  entrySource: string
}) {
  amplitude.track("Product Viewed", {
    "product id": params.productId,
    "product name": params.productName,
    "product type": params.productType,
    "price brl": params.priceBrl,
    currency: params.currency,
    "availability status": params.availabilityStatus,
    "entry source": params.entrySource,
  })
}

export function trackSizeGuideOpened(params: {
  productId: string
  productName: string
  productType: string
  sizeGuideType: string
}) {
  amplitude.track("Size Guide Opened", {
    "product id": params.productId,
    "product name": params.productName,
    "product type": params.productType,
    "size guide type": params.sizeGuideType,
  })
}

export function trackPurchaseInquiryStarted(params: {
  productId: string
  productName: string
  productType: string
  priceBrl: number
  currency: string
  outboundChannel: string
  messageTemplate: string
}) {
  amplitude.track("Purchase Inquiry Started", {
    "product id": params.productId,
    "product name": params.productName,
    "product type": params.productType,
    "price brl": params.priceBrl,
    currency: params.currency,
    "outbound channel": params.outboundChannel,
    "message template": params.messageTemplate,
  })
}

export function trackOutboundLinkOpened(params: {
  destinationDomain: string
  destinationPath: string
  linkLabel: string
  outboundChannel: string
  pageContext: string
}) {
  amplitude.track("Outbound Link Opened", {
    "destination domain": params.destinationDomain,
    "destination path": params.destinationPath,
    "link label": params.linkLabel,
    "outbound channel": params.outboundChannel,
    "page context": params.pageContext,
  })
}

export function trackBrandStoryViewed(params: {
  sectionName: string
  pageContext: string
  contentLanguage: string
}) {
  amplitude.track("Brand Story Viewed", {
    "section name": params.sectionName,
    "page context": params.pageContext,
    "content language": params.contentLanguage,
  })
}

export function trackErrorEncountered(params: {
  errorCategory: string
  errorMessage: string
  errorContext: string
  httpStatusCode?: number
  isRetryable: boolean
}) {
  amplitude.track("Error Encountered", {
    "error category": params.errorCategory,
    "error message": params.errorMessage,
    "error context": params.errorContext,
    "http status code": params.httpStatusCode,
    "is retryable": params.isRetryable,
  })
}
