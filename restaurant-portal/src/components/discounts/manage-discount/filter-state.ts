export type FilterState = {
  statusFilter: "all" | "active" | "inactive" | "upcoming" | "expired"
  typeFilter: "all" | "loyalty" | "percentageDeal" | "bankDiscount" | "fixedPriceDeal"
  searchQuery: string
  viewMode: "grid" | "list"
  sortOrder: "newest" | "oldest" | "alphabetical" | "status"
  selectedFilters: {
    appOnly: boolean
    allBranches: boolean
    alwaysActive: boolean
  }
}

export type FilterAction =
  | { type: "SET_STATUS_FILTER"; payload: FilterState["statusFilter"] }
  | { type: "SET_TYPE_FILTER"; payload: FilterState["typeFilter"] }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_VIEW_MODE"; payload: FilterState["viewMode"] }
  | { type: "SET_SORT_ORDER"; payload: FilterState["sortOrder"] }
  | { type: "SET_SELECTED_FILTERS"; payload: Partial<FilterState["selectedFilters"]> }
  | { type: "RESET_FILTERS" }

export function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case "SET_STATUS_FILTER":
      return { ...state, statusFilter: action.payload }
    case "SET_TYPE_FILTER":
      return { ...state, typeFilter: action.payload }
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload }
    case "SET_VIEW_MODE":
      return { ...state, viewMode: action.payload }
    case "SET_SORT_ORDER":
      return { ...state, sortOrder: action.payload }
    case "SET_SELECTED_FILTERS":
      return {
        ...state,
        selectedFilters: { ...state.selectedFilters, ...action.payload },
      }
    case "RESET_FILTERS":
      return {
        statusFilter: "all",
        typeFilter: "all",
        searchQuery: "",
        viewMode: "grid",
        sortOrder: "newest",
        selectedFilters: {
          appOnly: false,
          allBranches: false,
          alwaysActive: false,
        },
      }
    default:
      return state
  }
}

export const initialFilterState: FilterState = {
  statusFilter: "all",
  typeFilter: "all",
  searchQuery: "",
  viewMode: "grid",
  sortOrder: "newest",
  selectedFilters: {
    appOnly: false,
    allBranches: false,
    alwaysActive: false,
  },
}
