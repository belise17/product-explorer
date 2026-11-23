
# Product Explorer - Week 9

## Project Overview

Product Explorer is a React application that retrieves and displays
products from the DummyJSON API.

## Architecture

- `src/api/client.js`: Axios instance and interceptors.
- `src/api/products.js`: API service functions.
- `src/hooks/useProducts.js`: Product fetching hook.
- `src/hooks/useProduct.js`: Single product fetching hook.
- `src/pages/ProductsPage.jsx`: Product interface.

## Concepts Used

- React components and hooks.
- useState and useEffect.
- Axios API requests.
- AbortController for request cancellation.
- Promise.all for parallel requests.
- Controlled forms.
- Search and category filtering.
- Pagination.
- POST and DELETE mutations.
- Optimistic UI updates.

## Limitations

DummyJSON simulates product creation and deletion.
Changes are not permanently saved on the server.

The application currently uses local component state.
It does not yet include a shared cache or background refetching.
