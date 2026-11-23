
import { useState, useEffect } from "react"
import axios from "axios"
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
  const [state, setState] = useState({
    status: "loading",
    data: null,
    error: null,
  })

  useEffect(() => {
    const controller = new AbortController()

    async function loadProducts() {
      setState((previous) => ({
        ...previous,
        status: "loading",
        error: null,
      }))

      try {
        let result

        if (query.trim()) {
          result = await searchProducts(query, {
            limit,
            skip,
            signal: controller.signal,
          })
        } else if (category) {
          result = await fetchProductsByCategory(category, {
            limit,
            skip,
            signal: controller.signal,
          })
        } else {
          result = await fetchProducts({
            limit,
            skip,
            signal: controller.signal,
          })
        }

        setState({
          status: "success",
          data: result,
          error: null,
        })
      } catch (error) {
        if (
          axios.isCancel(error) ||
          error.code === "ERR_CANCELED"
        ) return

        setState({
          status: "error",
          data: null,
          error,
        })
      }
    }

    loadProducts()

    return () => controller.abort()
  }, [category, query, limit, skip])

  return state
}
