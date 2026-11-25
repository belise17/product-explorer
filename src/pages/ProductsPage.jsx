
import { useState, useEffect } from "react"
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"

import {
  fetchCategories,
  createProduct,
  deleteProduct,
} from "../api/products"

import { useProducts } from "../hooks/useProducts"

function ProductsPage({ onSelectProduct }) {
  const [category, setCategory] = useState("")
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [newTitle, setNewTitle] = useState("")
  const [newPrice, setNewPrice] = useState("")
  const [validationError, setValidationError] = useState("")

  const queryClient = useQueryClient()

  const limit = 12
  const skip = (page - 1) * limit

  // Products query key
  const productsQueryKey = [
    "products",
    { category, query, limit, skip },
  ]

  // Fetch products using custom React Query hook
  const {
    data,
    isPending,
    isError,
    error,
    isFetching,
  } = useProducts({
    category,
    query,
    limit,
    skip,
  })

  // Fetch categories using useQuery
  const {
    data: categories = [],
    isPending: categoriesLoading,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: ({ signal }) =>
      fetchCategories({ signal }),
  })

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [category, query])

  const products = data?.products || []
  const totalPages = Math.ceil((data?.total || 0) / limit)

  // Add product mutation
  const addProductMutation = useMutation({
    mutationFn: createProduct,

    onSuccess: (created) => {
      queryClient.setQueryData(
        productsQueryKey,
        (oldData) => {
          if (!oldData) return oldData

          return {
            ...oldData,
            products: [created, ...oldData.products],
            total: oldData.total + 1,
          }
        }
      )

      setNewTitle("")
      setNewPrice("")
      setValidationError("")
    },
  })

  // Delete product mutation with optimistic update
  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,

    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: productsQueryKey,
      })

      const previousData =
        queryClient.getQueryData(productsQueryKey)

      queryClient.setQueryData(
        productsQueryKey,
        (oldData) => {
          if (!oldData) return oldData

          return {
            ...oldData,
            products: oldData.products.filter(
              (product) => product.id !== id
            ),
            total: Math.max(0, oldData.total - 1),
          }
        }
      )

      return { previousData }
    },

    onError: (error, id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          productsQueryKey,
          context.previousData
        )
      }
    },
  })

  // Add product handler
  function handleAddProduct(event) {
    event.preventDefault()
    setValidationError("")

    if (!newTitle.trim() || Number(newPrice) <= 0) {
      setValidationError(
        "Please enter a product name and a valid price."
      )
      return
    }

    addProductMutation.mutate({
      title: newTitle.trim(),
      price: Number(newPrice),
    })
  }

  // Delete product handler
  function handleDelete(event, id) {
    event.stopPropagation()
    deleteProductMutation.mutate(id)
  }

  // Keyboard navigation
  function handleProductKeyDown(event, id) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      onSelectProduct(id)
    }
  }

  return (
    <main className="container">

      {/* All Products */}
      <section className="products-section">

        <div className="section-heading">
          <h2>Products/categories</h2>
          <span>{data?.total || 0} products</span>
        </div>

        {isFetching && !isPending && (
          <p className="loading">
            Refreshing products...
          </p>
        )}

        {isPending && (
          <p className="loading">
            Loading products...
          </p>
        )}

        {isError && (
          <p className="error">
            Error: {error?.message}
          </p>
        )}

        {!isPending && !isError && (
          <>
            <div className="products-grid">

              {products.map((product) => (
                <article
                  className="product-card"
                  key={product.id}
                  onClick={() =>
                    onSelectProduct(product.id)
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) =>
                    handleProductKeyDown(
                      event,
                      product.id
                    )
                  }
                >
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                  />

                  <div className="product-info">

                    <span className="category">
                      {product.category}
                    </span>

                    <h3>{product.title}</h3>

                    <p>{product.description}</p>

                    <div className="product-bottom">
                      <strong>${product.price}</strong>

                      <button
                        type="button"
                        className="delete-button"
                        disabled={deleteProductMutation.isPending}
                        onClick={(event) =>
                          handleDelete(event, product.id)
                        }
                      >
                        {deleteProductMutation.isPending
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>

                    <p className="view-details">
                      Click to view product details →
                    </p>

                  </div>
                </article>
              ))}

            </div>

            {products.length === 0 && (
              <p className="empty-message">
                No products found.
              </p>
            )}

            {/* Pagination */}
            <div className="pagination">

              <button
                disabled={page === 1}
                onClick={() =>
                  setPage((current) => current - 1)
                }
              >
                Previous
              </button>

              <span>
                Page {page} of {Math.max(1, totalPages)}
              </span>

              <button
                disabled={
                  page >= totalPages || totalPages === 0
                }
                onClick={() =>
                  setPage((current) => current + 1)
                }
              >
                Next
              </button>

            </div>
          </>
        )}

      </section>

      {/* Search and Categories */}
      <section className="toolbar">

        <input
          type="search"
          placeholder="Search products..."
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
        />

        <select
          value={category}
          onChange={(event) =>
            setCategory(event.target.value)
          }
          disabled={categoriesLoading}
        >
          <option value="">All Categories</option>

          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}

        </select>

      </section>

      {/* Add Product */}
      <section className="add-section">

        <h2>Add a Product</h2>

        <form onSubmit={handleAddProduct}>

          <input
            type="text"
            placeholder="Product name"
            value={newTitle}
            onChange={(event) =>
              setNewTitle(event.target.value)
            }
          />

          <input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Price"
            value={newPrice}
            onChange={(event) =>
              setNewPrice(event.target.value)
            }
          />

          <button
            type="submit"
            disabled={addProductMutation.isPending}
          >
            {addProductMutation.isPending
              ? "Adding..."
              : "Add Product"}
          </button>

        </form>

        {validationError && (
          <p className="error">{validationError}</p>
        )}

        {addProductMutation.isError && (
          <p className="error">
            Could not add product. Please try again.
          </p>
        )}

        {deleteProductMutation.isError && (
          <p className="error">
            Delete failed. Product restored.
          </p>
        )}

        {addProductMutation.isSuccess && (
          <p className="success">
            Product added successfully!
          </p>
        )}

      </section>

    </main>
  )
}

export default ProductsPage
