
import { useProduct } from "../hooks/useProduct"

function ProductDetails({ productId, onBack }) {
  const { status, data, error } = useProduct(productId)

  if (status === "loading") {
    return <p className="loading">Loading product details...</p>
  }

  if (status === "error") {
    return <p className="error">{error?.message}</p>
  }

  if (!data) return null

  return (
    <main className="details-container">
      <button className="back-button" onClick={onBack}>
        ← Back to Products
      </button>

      <div className="details-card">
        <div className="details-image">
          <img src={data.thumbnail} alt={data.title} />
        </div>

        <div className="details-info">
          <span className="category">{data.category}</span>

          <h1>{data.title}</h1>

          <p>{data.description}</p>

          <h2>${data.price}</h2>

          <p><strong>Brand:</strong> {data.brand || "Not available"}</p>
          <p><strong>Rating:</strong> ⭐ {data.rating}</p>
          <p><strong>Stock:</strong> {data.stock} available</p>
          <p><strong>Availability:</strong> {data.availabilityStatus}</p>
          <p><strong>Warranty:</strong> {data.warrantyInformation}</p>
          <p><strong>Shipping:</strong> {data.shippingInformation}</p>
        </div>
      </div>
    </main>
  )
}

export default ProductDetails
