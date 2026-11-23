
import { useEffect, useState } from "react"
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
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [newTitle, setNewTitle] = useState("")
  const [newPrice, setNewPrice] = useState("")
  const [mutationError, setMutationError] = useState("")
  const [mutationLoading, setMutationLoading] = useState(false)

  const limit = 12
  const skip = (page - 1) * limit

  const { status, data, error } = useProducts({
    category,
    query,
    limit,
    skip,
  })

  // Load categories
  useEffect(() => {
    const controller = new AbortController()

    async function loadCategories() {
      try {
        const categoryData = await fetchCategories({
          signal: controller.signal,
        })

        setCategories(categoryData)
      } catch (error) {
        if (error.code !== "ERR_CANCELED") {
          console.error(error)
        }
      }
    }

    loadCategories()

    return () => controller.abort()
  }, [])

  // Update products when API data changes
  useEffect(() => {
    if (data?.products) {
      setProducts(data.products)
    }
  }, [data])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [category, query])

  const totalPages = Math.ceil((data?.total || 0) / limit)

  // Add product
  async function handleAddProduct(event) {
    event.preventDefault()
    setMutationError("")

    if (!newTitle.trim() || Number(newPrice) <= 0) {
      setMutationError(
        "Please enter a product name and a valid price."
      )
      return
    }

    setMutationLoading(true)

    try {
      const created = await createProduct({
        title: newTitle.trim(),
        price: Number(newPrice),
      })

      setProducts((previous) => [created, ...previous])
      setNewTitle("")
      setNewPrice("")
    } catch {
      setMutationError("Could not add product. Please try again.")
    } finally {
      setMutationLoading(false)
    }
  }

  // Optimistic delete with rollback
  async function handleDelete(event, id) {
    event.stopPropagation()

    const previous = products

    setProducts((current) =>
      current.filter((product) => product.id !== id)
    )

    setMutationError("")

    try {
      await deleteProduct(id)
    } catch {
      setProducts(previous)
      setMutationError("Delete failed. Product restored.")
    }
  }

  // Keyboard navigation for product cards
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

        {status === "loading" && (
          <p className="loading">Loading products...</p>
        )}

        {status === "error" && (
          <p className="error">
            Error: {error?.message}
          </p>
        )}

        {status === "success" && (
          <>
            <div className="products-grid">
              {products.map((product) => (
                <article
                  className="product-card"
                  key={product.id}
                  onClick={() => onSelectProduct(product.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) =>
                    handleProductKeyDown(event, product.id)
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
                        onClick={(event) =>
                          handleDelete(event, product.id)
                        }
                      >
                        Delete
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
                disabled={page >= totalPages}
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
          onChange={(event) => setQuery(event.target.value)}
        />

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
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
            disabled={mutationLoading}
          >
            {mutationLoading ? "Adding..." : "Add Product"}
          </button>
        </form>

        {mutationError && (
          <p className="error">{mutationError}</p>
        )}
      </section>

    </main>
  )
}

export default ProductsPage
