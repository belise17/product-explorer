import { useQuery } from "@tanstack/react-query"
import { fetchProduct } from "../api/products"

export function useProduct(id) {
  return useQuery({
    queryKey: ["products", "detail", id],
    queryFn: ({ signal }) => fetchProduct(id, { signal }),
    enabled: Boolean(id),
  })
}