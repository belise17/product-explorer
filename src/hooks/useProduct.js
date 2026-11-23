
import { useState, useEffect } from "react"
import axios from "axios"
import { fetchProduct } from "../api/products"

export function useProduct(id) {
  const [state, setState] = useState({
    status: "loading",
    data: null,
    error: null,
  })

  useEffect(() => {
    if (!id) return

    const controller = new AbortController()

    fetchProduct(id, { signal: controller.signal })
      .then((data) => {
        setState({
          status: "success",
          data,
          error: null,
        })
      })
      .catch((error) => {
        if (
          axios.isCancel(error) ||
          error.code === "ERR_CANCELED"
        ) return

        setState({
          status: "error",
          data: null,
          error,
        })
      })

    return () => controller.abort()
  }, [id])

  return state
}
