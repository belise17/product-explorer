
import { useQuery } from "@tanstack/react-query"
import {
  fetchProducts,
  fetchProductsByCategory,
  searchProducts,
} from "../api/products"

export function useProducts({
  category = "",
  query = "",
  limit = 12,
  skip = 0,
} = {}) {
  return useQuery({
    queryKey: ["products", { category, query, limit, skip }],

    queryFn: ({ signal }) => {
      if (query.trim()) {
        return searchProducts(query, {
          limit,
          skip,
          signal,
        })
      }

      if (category) {
        return fetchProductsByCategory(category, {
          limit,
          skip,
          signal,
        })
      }

      return fetchProducts({
        limit,
        skip,
        signal,
      })
    },
  })
}
