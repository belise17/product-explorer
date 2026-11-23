
import { useState } from "react"
import ProductsPage from "./pages/ProductsPage"
import ProductDetails from "./pages/ProductDetails"

function App() {
  const [selectedProductId, setSelectedProductId] = useState(null)

  function handleSelectProduct(id) {
    setSelectedProductId(id)
  }

  function handleBack() {
    setSelectedProductId(null)
  }

  return (
    <>
      {selectedProductId ? (
        <ProductDetails
          productId={selectedProductId}
          onBack={handleBack}
        />
      ) : (
        <ProductsPage onSelectProduct={handleSelectProduct} />
      )}
    </>
  )
}

export default App
