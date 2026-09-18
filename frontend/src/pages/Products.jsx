import React, { useEffect, useState } from "react";

import {
  FaBoxOpen,
  FaPlus,
  FaTrash,
  FaEdit,
  FaStore,
  FaTag,
  FaRupeeSign,
  FaSearch,
  FaTimes,
  FaCheckCircle,
  FaExclamationCircle,
  FaLayerGroup,
} from "react-icons/fa";

import {
  getStores,
  getProducts,
  getShelves,
  createProduct,
  updateProduct,
  deleteProduct,
  getErrorMessage,
} from "../services/api";

import "../styles/Products.css";


function Products() {

  // =====================================================
  // STATE
  // =====================================================

  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [shelves, setShelves] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [loadingShelves, setLoadingShelves] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  // =====================================================
  // EDIT STATE
  // =====================================================

  const [editingProduct, setEditingProduct] = useState(null);


  // =====================================================
  // FORM STATE
  // =====================================================

  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [storeId, setStoreId] = useState("");
  const [shelfId, setShelfId] = useState("");


  // =====================================================
  // LOAD INITIAL DATA
  // =====================================================

  useEffect(() => {
    loadData();
  }, []);


  const loadData = async () => {

    setLoading(true);
    setError("");

    try {

      const [
        storesResponse,
        productsResponse,
        shelvesResponse,
      ] = await Promise.all([
        getStores(),
        getProducts(),
        getShelves(),
      ]);


      // =================================================
      // STORES
      // =================================================

      const storesData =
        storesResponse?.data ??
        storesResponse;

      if (Array.isArray(storesData)) {

        setStores(storesData);

      } else if (
        Array.isArray(storesData?.stores)
      ) {

        setStores(
          storesData.stores
        );

      } else {

        setStores([]);

      }


      // =================================================
      // PRODUCTS
      // =================================================

      const productsData =
        productsResponse?.data ??
        productsResponse;

      if (Array.isArray(productsData)) {

        setProducts(productsData);

      } else if (
        Array.isArray(productsData?.products)
      ) {

        setProducts(
          productsData.products
        );

      } else {

        setProducts([]);

      }


      // =================================================
      // SHELVES
      // =================================================

      const shelvesData =
        shelvesResponse?.data ??
        shelvesResponse;

      if (Array.isArray(shelvesData)) {

        setShelves(shelvesData);

      } else if (
        Array.isArray(shelvesData?.shelves)
      ) {

        setShelves(
          shelvesData.shelves
        );

      } else {

        setShelves([]);

      }

    } catch (err) {

      console.error(
        "Products loading error:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Unable to load products."
        )
      );

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // LOAD SHELVES FOR SELECTED STORE
  // =====================================================

  const loadShelves = async (
    selectedStoreId
  ) => {

    if (!selectedStoreId) {

      setShelves([]);
      setShelfId("");

      return;

    }


    setLoadingShelves(true);
    setError("");


    try {

      /*
       * Use existing getShelves API.
       *
       * This keeps the frontend compatible with:
       *
       * GET /shelves
       */

      const response =
        await getShelves();


      const shelfData =
        response?.data ??
        response;


      let allShelves = [];


      if (Array.isArray(shelfData)) {

        allShelves =
          shelfData;

      } else if (
        Array.isArray(
          shelfData?.shelves
        )
      ) {

        allShelves =
          shelfData.shelves;

      }


      // -----------------------------------------------
      // FILTER BY STORE
      // -----------------------------------------------

      const filteredShelves =
        allShelves.filter(
          (shelf) => {

            const shelfStoreId =
              shelf?.store_id ||
              shelf?.storeId;

            return (
              String(shelfStoreId) ===
              String(selectedStoreId)
            );

          }
        );


      setShelves(
        filteredShelves
      );


      // Clear previous shelf
      setShelfId("");


      console.log(
        "Shelves for selected store:",
        filteredShelves
      );

      return filteredShelves;

    } catch (err) {

      console.error(
        "Shelves loading error:",
        err
      );


      setShelves([]);
      setShelfId("");


      setError(
        getErrorMessage(
          err,
          "Unable to load shelves for this store."
        )
      );

      return [];

    } finally {

      setLoadingShelves(false);

    }
  };


  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {

    setProductName("");
    setCategory("");
    setPrice("");
    setStoreId("");
    setShelfId("");

    setEditingProduct(null);

    /*
     * Do not clear all shelves here.
     *
     * The complete shelf list is useful for
     * displaying existing products.
     */

  };


  // =====================================================
  // OPEN ADD FORM
  // =====================================================

  const openForm = () => {

    setError("");
    setSuccess("");

    resetForm();

    setShowForm(true);

  };


  // =====================================================
  // CLOSE FORM
  // =====================================================

  const closeForm = () => {

    if (saving) {
      return;
    }


    setShowForm(false);

    setError("");

    resetForm();

  };


  // =====================================================
  // STORE CHANGE
  // =====================================================

  const handleStoreChange = (
    event
  ) => {

    const selectedStoreId =
      event.target.value;


    setStoreId(
      selectedStoreId
    );

    setShelfId("");


    if (selectedStoreId) {

      loadShelves(
        selectedStoreId
      );

    } else {

      /*
       * Keep all shelves available
       * for displaying existing products.
       */

      setShelves(
        (current) =>
          Array.isArray(current)
            ? current
            : []
      );

    }

  };


  // =====================================================
  // EDIT PRODUCT
  // =====================================================

  const handleEdit = async (
    product
  ) => {

    setError("");
    setSuccess("");


    const productId =
      product?._id ||
      product?.id;


    if (!productId) {

      setError(
        "Unable to identify this product."
      );

      return;

    }


    // ---------------------------------------------------
    // Store product being edited
    // ---------------------------------------------------

    setEditingProduct(
      product
    );


    // ---------------------------------------------------
    // Load existing values
    // ---------------------------------------------------

    setProductName(
      product.product_name ||
      ""
    );

    setCategory(
      product.category ||
      ""
    );

    setPrice(
      product.price ??
      ""
    );

    setStoreId(
      product.store_id ||
      ""
    );

    setShelfId(
      ""
    );


    setShowForm(true);


    // ---------------------------------------------------
    // Load shelves for product store
    // ---------------------------------------------------

    if (product.store_id) {

      const filteredShelves =
        await loadShelves(
          product.store_id
        );


      // -------------------------------------------------
      // Select existing shelf
      // -------------------------------------------------

      const existingShelf =
        filteredShelves.find(
          (shelf) => {

            const id =
              shelf?._id ||
              shelf?.id;

            return (
              String(id) ===
              String(product.shelf_id)
            );

          }
        );


      if (existingShelf) {

        setShelfId(
          product.shelf_id
        );

      } else {

        setShelfId(
          product.shelf_id ||
          ""
        );

      }

    } else {

      setShelfId(
        product.shelf_id ||
        ""
      );

    }

  };


  // =====================================================
  // CREATE / UPDATE PRODUCT
  // =====================================================

  const handleCreateProduct = async (
    event
  ) => {

    event.preventDefault();

    setError("");
    setSuccess("");


    // =================================================
    // VALIDATION
    // =================================================

    if (!productName.trim()) {

      setError(
        "Please enter a product name."
      );

      return;

    }


    if (!category.trim()) {

      setError(
        "Please enter a product category."
      );

      return;

    }


    if (
      price === "" ||
      Number.isNaN(
        Number(price)
      ) ||
      Number(price) <= 0
    ) {

      setError(
        "Please enter a valid price greater than 0."
      );

      return;

    }


    if (!storeId) {

      setError(
        "Please select a store."
      );

      return;

    }


    if (!shelfId) {

      setError(
        "Please select a shelf."
      );

      return;

    }


    setSaving(true);


    try {

      // =================================================
      // EDIT PRODUCT
      // =================================================

      if (editingProduct) {

        const productId =
          editingProduct?._id ||
          editingProduct?.id;


        if (!productId) {

          throw new Error(
            "Unable to identify this product."
          );

        }


        /*
         * ProductUpdate expects:
         *
         * product_name
         * category
         * price
         * shelf_id
         *
         * Store is not sent because the backend
         * keeps the existing store relationship.
         */

        const productData = {

          product_name:
            productName.trim(),

          category:
            category.trim(),

          price:
            Number(price),

          shelf_id:
            String(shelfId),

        };


        console.log(
          "Updating product:",
          productData
        );


        const response =
          await updateProduct(
            productId,
            productData
          );


        console.log(
          "Product update response:",
          response
        );


        setSuccess(
          "Product updated successfully."
        );


        setShowForm(false);

        resetForm();


        await loadData();


        return;

      }


      // =================================================
      // CREATE PRODUCT
      // =================================================

      /*
       * This exactly matches your current
       * FastAPI ProductCreate:
       *
       * product_name
       * category
       * price
       * store_id
       * shelf_id
       */

      const productData = {

        product_name:
          productName.trim(),

        category:
          category.trim(),

        price:
          Number(price),

        store_id:
          String(storeId),

        shelf_id:
          String(shelfId),

      };


      console.log(
        "Sending product to backend:",
        productData
      );


      // =================================================
      // CREATE
      // =================================================

      const response =
        await createProduct(
          productData
        );


      console.log(
        "Product creation response:",
        response
      );


      // =================================================
      // SUCCESS
      // =================================================

      setSuccess(
        "Product created successfully."
      );


      setShowForm(false);

      resetForm();


      // =================================================
      // REFRESH PRODUCTS
      // =================================================

      await loadData();

    } catch (err) {

      console.error(
        "Create/update product error:",
        err
      );


      setError(
        getErrorMessage(
          err,
          editingProduct
            ? "Unable to update product."
            : "Unable to create product."
        )
      );

    } finally {

      setSaving(false);

    }

  };


  // =====================================================
  // DELETE PRODUCT
  // =====================================================

  const handleDelete = async (
    product
  ) => {

    const productId =
      product?._id ||
      product?.id;


    if (!productId) {

      setError(
        "Unable to identify this product."
      );

      return;

    }


    const confirmed =
      window.confirm(
        `Delete "${product.product_name}"?`
      );


    if (!confirmed) {
      return;
    }


    setError("");
    setSuccess("");

    setDeletingId(
      productId
    );


    try {

      await deleteProduct(
        productId
      );


      setSuccess(
        "Product deleted successfully."
      );


      setProducts(
        (current) =>
          current.filter(
            (item) =>
              String(
                item?._id ||
                item?.id
              ) !==
              String(productId)
          )
      );

    } catch (err) {

      console.error(
        "Delete product error:",
        err
      );


      setError(
        getErrorMessage(
          err,
          "Unable to delete product."
        )
      );

    } finally {

      setDeletingId(null);

    }

  };


  // =====================================================
  // GET STORE NAME
  // =====================================================

  const getStoreName = (
    storeIdValue
  ) => {

    if (!storeIdValue) {

      return "No store";

    }


    const store =
      stores.find(
        (item) =>
          String(
            item?._id ||
            item?.id
          ) ===
          String(storeIdValue)
      );


    if (!store) {

      return "Unknown store";

    }


    return (
      store.store_name ||
      store.name ||
      "Unnamed store"
    );

  };


  // =====================================================
  // GET SHELF NAME
  // =====================================================

  const getShelfName = (
    shelfIdValue
  ) => {

    if (!shelfIdValue) {

      return "No shelf";

    }


    const shelf =
      shelves.find(
        (item) =>
          String(
            item?._id ||
            item?.id
          ) ===
          String(shelfIdValue)
      );


    if (!shelf) {

      return "Unknown shelf";

    }


    return (
      shelf.shelf_name ||
      shelf.name ||
      shelf.title ||
      "Unnamed shelf"
    );

  };


  // =====================================================
  // GET SHELF STORE ID
  // =====================================================

  const getShelfStoreId = (
    shelf
  ) => {

    return (
      shelf?.store_id ||
      shelf?.storeId ||
      ""
    );

  };


  // =====================================================
  // SEARCH
  // =====================================================

  const filteredProducts =
    products.filter(
      (product) => {

        const searchText =
          search
            .toLowerCase()
            .trim();


        if (!searchText) {

          return true;

        }


        const name =
          String(
            product?.product_name ||
            ""
          ).toLowerCase();


        const categoryValue =
          String(
            product?.category ||
            ""
          ).toLowerCase();


        const storeName =
          getStoreName(
            product?.store_id
          ).toLowerCase();


        const shelfName =
          getShelfName(
            product?.shelf_id
          ).toLowerCase();


        return (
          name.includes(
            searchText
          ) ||

          categoryValue.includes(
            searchText
          ) ||

          storeName.includes(
            searchText
          ) ||

          shelfName.includes(
            searchText
          )
        );

      }
    );


  // =====================================================
  // UNIQUE CATEGORIES
  // =====================================================

  const categoryCount =
    new Set(
      products
        .map(
          (item) =>
            item?.category
        )
        .filter(Boolean)
    ).size;


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="products-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="products-header">

        <div>

          <div className="products-eyebrow">
            PRODUCT MANAGEMENT
          </div>

          <h1>
            Products
          </h1>

          <p>
            Manage products, categories and shelf
            placement across your retail stores.
          </p>

        </div>


        <button
          className="add-product-button"
          onClick={openForm}
        >

          <FaPlus />

          <span>
            Add Product
          </span>

        </button>

      </div>


      {/* =================================================
          ALERTS
      ================================================= */}

      {success && (

        <div className="products-alert success">

          <FaCheckCircle />

          <span>
            {success}
          </span>

          <button
            onClick={() =>
              setSuccess("")
            }
          >

            <FaTimes />

          </button>

        </div>

      )}


      {error && (

        <div className="products-alert error">

          <FaExclamationCircle />

          <span>
            {error}
          </span>

          <button
            onClick={() =>
              setError("")
            }
          >

            <FaTimes />

          </button>

        </div>

      )}


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="products-summary">


        {/* TOTAL PRODUCTS */}

        <div className="summary-card">

          <div className="summary-icon cyan">

            <FaBoxOpen />

          </div>

          <div>

            <span>
              Total Products
            </span>

            <strong>
              {products.length}
            </strong>

          </div>

        </div>


        {/* CONNECTED STORES */}

        <div className="summary-card">

          <div className="summary-icon purple">

            <FaStore />

          </div>

          <div>

            <span>
              Connected Stores
            </span>

            <strong>
              {stores.length}
            </strong>

          </div>

        </div>


        {/* CATEGORIES */}

        <div className="summary-card">

          <div className="summary-icon green">

            <FaTag />

          </div>

          <div>

            <span>
              Categories
            </span>

            <strong>
              {categoryCount}
            </strong>

          </div>

        </div>

      </div>


      {/* =================================================
          PRODUCT PANEL
      ================================================= */}

      <section className="products-panel">


        {/* PANEL HEADER */}

        <div className="products-panel-header">

          <div>

            <span>
              INVENTORY
            </span>

            <h2>
              Product Catalogue
            </h2>

          </div>


          <div className="product-search">

            <FaSearch />

            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>

        </div>


        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (

          <div className="products-loading">

            <div className="loading-spinner"></div>

            <span>
              Loading products...
            </span>

          </div>


        ) : filteredProducts.length === 0 ? (


          /* =================================================
             EMPTY
          ================================================= */

          <div className="products-empty">

            <div className="empty-icon">

              <FaBoxOpen />

            </div>

            <h3>

              {search
                ? "No products found"
                : "No products yet"}

            </h3>

            <p>

              {search
                ? "Try a different search term."
                : "Add your first product to begin managing your catalogue."}

            </p>


            {!search && (

              <button
                className="empty-add-button"
                onClick={openForm}
              >

                <FaPlus />

                Add Product

              </button>

            )}

          </div>


        ) : (


          /* =================================================
             TABLE
          ================================================= */

          <div className="products-table-wrapper">

            <table className="products-table">


              <thead>

                <tr>

                  <th>
                    Product
                  </th>

                  <th>
                    Category
                  </th>

                  <th>
                    Store
                  </th>

                  <th>
                    Shelf
                  </th>

                  <th>
                    Price
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredProducts.map(
                  (product, index) => {

                    const productId =
                      product?._id ||
                      product?.id ||
                      index;


                    return (

                      <tr
                        key={productId}
                      >


                        {/* PRODUCT */}

                        <td>

                          <div className="product-name-cell">

                            <div className="product-avatar">

                              <FaBoxOpen />

                            </div>

                            <div>

                              <strong>

                                {
                                  product.product_name ||
                                  "Unnamed Product"
                                }

                              </strong>

                              <small>

                                Product #
                                {index + 1}

                              </small>

                            </div>

                          </div>

                        </td>


                        {/* CATEGORY */}

                        <td>

                          <span className="category-badge">

                            <FaTag />

                            {
                              product.category ||
                              "Uncategorized"
                            }

                          </span>

                        </td>


                        {/* STORE */}

                        <td>

                          <div className="store-cell">

                            <FaStore />

                            <span>

                              {getStoreName(
                                product.store_id
                              )}

                            </span>

                          </div>

                        </td>


                        {/* SHELF */}

                        <td>

                          <div className="store-cell">

                            <FaLayerGroup />

                            <span>

                              {getShelfName(
                                product.shelf_id
                              )}

                            </span>

                          </div>

                        </td>


                        {/* PRICE */}

                        <td>

                          <div className="price-cell">

                            <FaRupeeSign />

                            <strong>

                              {Number(
                                product.price ||
                                0
                              ).toFixed(2)}

                            </strong>

                          </div>

                        </td>


                        {/* ACTIONS */}

                        <td>

                          <div
                            className="product-actions"
                          >

                            {/* EDIT */}

                            <button
                              className="edit-product-button"
                              onClick={() =>
                                handleEdit(
                                  product
                                )
                              }
                              disabled={
                                deletingId ===
                                productId
                              }
                              title="Edit product"
                            >

                              <FaEdit />

                            </button>


                            {/* DELETE */}

                            <button
                              className="delete-product-button"
                              onClick={() =>
                                handleDelete(
                                  product
                                )
                              }
                              disabled={
                                deletingId ===
                                productId
                              }
                              title="Delete product"
                            >

                              {deletingId ===
                              productId ? (

                                <span className="button-spinner"></span>

                              ) : (

                                <FaTrash />

                              )}

                            </button>

                          </div>

                        </td>

                      </tr>

                    );

                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>


      {/* =================================================
          ADD / EDIT PRODUCT MODAL
      ================================================= */}

      {showForm && (

        <div
          className="product-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {

              closeForm();

            }

          }}
        >

          <div className="product-modal">


            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div className="modal-header">

              <div>

                <span>
                  {editingProduct
                    ? "PRODUCT EDIT"
                    : "PRODUCT SETUP"}
                </span>

                <h2>

                  {editingProduct
                    ? "Edit Product"
                    : "Add New Product"}

                </h2>

                <p>

                  {editingProduct
                    ? "Update product information and shelf placement."
                    : "Add a product and assign it to a store and shelf."}

                </p>

              </div>


              <button
                className="modal-close"
                onClick={closeForm}
                disabled={saving}
              >

                <FaTimes />

              </button>

            </div>


            {/* =================================================
                FORM
            ================================================= */}

            <form
              className="product-form"
              onSubmit={
                handleCreateProduct
              }
            >


              {/* PRODUCT NAME */}

              <div className="form-field">

                <label>
                  Product Name
                </label>

                <div className="form-input">

                  <FaBoxOpen />

                  <input
                    type="text"
                    placeholder="e.g. Dairy Milk"
                    value={productName}
                    onChange={(event) =>
                      setProductName(
                        event.target.value
                      )
                    }
                    disabled={saving}
                  />

                </div>

              </div>


              {/* CATEGORY */}

              <div className="form-field">

                <label>
                  Category
                </label>

                <div className="form-input">

                  <FaTag />

                  <input
                    type="text"
                    placeholder="e.g. Chocolates"
                    value={category}
                    onChange={(event) =>
                      setCategory(
                        event.target.value
                      )
                    }
                    disabled={saving}
                  />

                </div>

              </div>


              {/* PRICE */}

              <div className="form-field">

                <label>
                  Price
                </label>

                <div className="form-input">

                  <FaRupeeSign />

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 60"
                    value={price}
                    onChange={(event) =>
                      setPrice(
                        event.target.value
                      )
                    }
                    disabled={saving}
                  />

                </div>

              </div>


              {/* STORE */}

              <div className="form-field">

                <label>
                  Store
                </label>

                <div className="form-input">

                  <FaStore />

                  <select
                    value={storeId}
                    onChange={
                      handleStoreChange
                    }
                    disabled={
                      saving ||
                      Boolean(editingProduct)
                    }
                  >

                    <option value="">
                      Select a store
                    </option>


                    {stores.map(
                      (store) => {

                        const id =
                          store?._id ||
                          store?.id;


                        return (

                          <option
                            key={id}
                            value={id}
                          >

                            {
                              store.store_name ||
                              store.name ||
                              "Unnamed Store"
                            }

                          </option>

                        );

                      }
                    )}

                  </select>

                </div>

                {editingProduct && (

                  <small>
                    Store cannot be changed while editing a product.
                  </small>

                )}

              </div>


              {/* SHELF */}

              <div className="form-field">

                <label>
                  Shelf
                </label>

                <div className="form-input">

                  <FaLayerGroup />

                  <select
                    value={shelfId}
                    onChange={(event) =>
                      setShelfId(
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      !storeId ||
                      loadingShelves
                    }
                  >

                    <option value="">

                      {!storeId

                        ? "Select a store first"

                        : loadingShelves

                        ? "Loading shelves..."

                        : shelves.length === 0

                        ? "No shelves available"

                        : "Select a shelf"}

                    </option>


                    {shelves.map(
                      (shelf) => {

                        const id =
                          shelf?._id ||
                          shelf?.id;


                        /*
                         * Only display shelves belonging
                         * to the currently selected store.
                         */

                        const shelfStoreId =
                          getShelfStoreId(
                            shelf
                          );


                        if (
                          String(
                            shelfStoreId
                          ) !==
                          String(storeId)
                        ) {

                          return null;

                        }


                        return (

                          <option
                            key={id}
                            value={id}
                          >

                            {
                              shelf.shelf_name ||
                              shelf.name ||
                              shelf.title ||
                              `Shelf ${id}`
                            }

                          </option>

                        );

                      }
                    )}

                  </select>

                </div>

              </div>


              {/* =================================================
                  ACTIONS
              ================================================= */}

              <div className="modal-actions">


                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeForm}
                  disabled={saving}
                >

                  Cancel

                </button>


                <button
                  type="submit"
                  className="save-product-button"
                  disabled={saving}
                >

                  {saving ? (

                    <>

                      <span className="button-spinner"></span>

                      {editingProduct
                        ? "Updating..."
                        : "Creating..."}

                    </>

                  ) : (

                    <>

                      {editingProduct ? (
                        <FaEdit />
                      ) : (
                        <FaPlus />
                      )}

                      {editingProduct
                        ? "Update Product"
                        : "Create Product"}

                    </>

                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="products-footer">

        <span>
          Consumer Attention Mapping System
        </span>

        <span>
          Product Intelligence
        </span>

      </footer>

    </div>

  );
}


export default Products;