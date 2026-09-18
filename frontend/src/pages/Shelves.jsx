import React, { useEffect, useState } from "react";

import {
  FaLayerGroup,
  FaPlus,
  FaTrash,
  FaStore,
  FaSearch,
  FaTimes,
  FaCheckCircle,
  FaExclamationCircle,
  FaMapMarkerAlt,
  FaBoxes,
} from "react-icons/fa";

import {
  getStores,
  getShelves,
  createShelf,
  deleteShelf,
  getErrorMessage,
} from "../services/api";

import "../styles/Shelves.css";


function Shelves() {

  // =====================================================
  // STATE
  // =====================================================

  const [shelves, setShelves] = useState([]);
  const [stores, setStores] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);

  // Form
  const [shelfName, setShelfName] = useState("");
  const [section, setSection] = useState("");
  const [capacity, setCapacity] = useState("");
  const [storeId, setStoreId] = useState("");

  // NEW: selected zone
  const [zoneId, setZoneId] = useState("");


  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    loadData();
  }, []);


  const loadData = async () => {

    setLoading(true);
    setError("");

    try {

      const [storesResponse, shelvesResponse] =
        await Promise.all([
          getStores(),
          getShelves(),
        ]);


      // -----------------------------------------------
      // STORES
      // -----------------------------------------------

      const storesData =
        storesResponse?.data ?? storesResponse;

      if (Array.isArray(storesData)) {

        setStores(storesData);

      } else if (Array.isArray(storesData?.stores)) {

        setStores(storesData.stores);

      } else {

        setStores([]);

      }


      // -----------------------------------------------
      // SHELVES
      // -----------------------------------------------

      const shelvesData =
        shelvesResponse?.data ?? shelvesResponse;

      if (Array.isArray(shelvesData)) {

        setShelves(shelvesData);

      } else if (Array.isArray(shelvesData?.shelves)) {

        setShelves(shelvesData.shelves);

      } else {

        setShelves([]);

      }

    } catch (err) {

      console.error(
        "Shelves loading error:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Unable to load shelves."
        )
      );

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // GET SELECTED STORE
  // =====================================================

  const getSelectedStore = () => {

    if (!storeId) {
      return null;
    }

    return stores.find(
      (store) =>
        String(
          store?._id ||
          store?.id
        ) === String(storeId)
    ) || null;
  };


  // =====================================================
  // GET SELECTED STORE ZONES
  // =====================================================

  const getSelectedStoreZones = () => {

    const store = getSelectedStore();

    if (!store) {
      return [];
    }

    return Array.isArray(store.zones)
      ? store.zones
      : [];
  };


  // =====================================================
  // STORE CHANGE
  // =====================================================

  const handleStoreChange = (event) => {

    const selectedStoreId =
      event.target.value;

    setStoreId(selectedStoreId);

    // Reset zone whenever store changes
    setZoneId("");

    setError("");
  };


  // =====================================================
  // ZONE CHANGE
  // =====================================================

  const handleZoneChange = (event) => {

    setZoneId(
      event.target.value
    );

    setError("");
  };


  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {

    setShelfName("");
    setSection("");
    setCapacity("");
    setStoreId("");

    // NEW
    setZoneId("");

  };


  // =====================================================
  // OPEN FORM
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

    if (saving) return;

    setShowForm(false);

    setError("");

    resetForm();

  };


  // =====================================================
  // CREATE SHELF
  // =====================================================

  const handleCreateShelf = async (event) => {

    event.preventDefault();

    setError("");
    setSuccess("");


    // -----------------------------------------------
    // VALIDATION
    // -----------------------------------------------

    if (!shelfName.trim()) {

      setError(
        "Please enter a shelf name."
      );

      return;
    }


    if (!section.trim()) {

      setError(
        "Please enter a section."
      );

      return;
    }


    if (
      capacity === "" ||
      Number.isNaN(Number(capacity)) ||
      Number(capacity) <= 0
    ) {

      setError(
        "Please enter a valid capacity greater than 0."
      );

      return;
    }


    if (!storeId) {

      setError(
        "Please select a store."
      );

      return;
    }


    // NEW: zone validation

    if (!zoneId) {

      setError(
        "Please select a zone."
      );

      return;
    }


    setSaving(true);


    try {

      const shelfData = {

        shelf_name:
          shelfName.trim(),

        section:
          section.trim(),

        capacity:
          Number(capacity),

        store_id:
          storeId,

        // NEW
        zone_id:
          zoneId,

      };


      console.log(
        "Creating shelf:",
        shelfData
      );


      await createShelf(
        shelfData
      );


      setSuccess(
        "Shelf created successfully."
      );


      resetForm();

      setShowForm(false);

      await loadData();

    } catch (err) {

      console.error(
        "Create shelf error:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Unable to create shelf."
        )
      );

    } finally {

      setSaving(false);

    }
  };


  // =====================================================
  // DELETE SHELF
  // =====================================================

  const handleDelete = async (shelf) => {

    const shelfId =
      shelf?._id ||
      shelf?.id;


    if (!shelfId) {

      setError(
        "Unable to identify this shelf."
      );

      return;
    }


    const confirmed =
      window.confirm(
        `Delete "${shelf.shelf_name}"?`
      );


    if (!confirmed) return;


    setError("");
    setSuccess("");

    setDeletingId(shelfId);


    try {

      await deleteShelf(
        shelfId
      );


      setSuccess(
        "Shelf deleted successfully."
      );


      setShelves((current) =>
        current.filter(
          (item) =>
            (item?._id || item?.id) !== shelfId
        )
      );

    } catch (err) {

      console.error(
        "Delete shelf error:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Unable to delete shelf."
        )
      );

    } finally {

      setDeletingId(null);

    }
  };


  // =====================================================
  // GET STORE NAME
  // =====================================================

  const getStoreName = (storeIdValue) => {

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
      "Unnamed Store"
    );
  };


  // =====================================================
  // GET STORE LOCATION
  // =====================================================

  const getStoreLocation = (storeIdValue) => {

    const store =
      stores.find(
        (item) =>
          String(
            item?._id ||
            item?.id
          ) ===
          String(storeIdValue)
      );


    return (
      store?.location ||
      "Location unavailable"
    );
  };


  // =====================================================
  // GET ZONE NAME
  // =====================================================

  const getZoneName = (
    storeIdValue,
    zoneIdValue
  ) => {

    if (!storeIdValue || !zoneIdValue) {
      return "No zone";
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
      return "Unknown zone";
    }


    const zones =
      Array.isArray(store.zones)
        ? store.zones
        : [];


    const zone =
      zones.find(
        (item) =>
          String(item?.zone_id) ===
          String(zoneIdValue)
      );


    return (
      zone?.zone_name ||
      "Unknown zone"
    );
  };


  // =====================================================
  // SEARCH
  // =====================================================

  const filteredShelves =
    shelves.filter((shelf) => {

      const searchText =
        search
          .toLowerCase()
          .trim();


      if (!searchText) {
        return true;
      }


      const name =
        String(
          shelf?.shelf_name || ""
        ).toLowerCase();


      const sectionValue =
        String(
          shelf?.section || ""
        ).toLowerCase();


      const storeName =
        getStoreName(
          shelf?.store_id
        ).toLowerCase();


      const zoneName =
        getZoneName(
          shelf?.store_id,
          shelf?.zone_id
        ).toLowerCase();


      return (
        name.includes(searchText) ||
        sectionValue.includes(searchText) ||
        storeName.includes(searchText) ||
        zoneName.includes(searchText)
      );

    });


  // =====================================================
  // SUMMARY
  // =====================================================

  const totalCapacity =
    shelves.reduce(
      (total, shelf) =>
        total +
        Number(
          shelf?.capacity || 0
        ),
      0
    );


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="shelves-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="shelves-header">

        <div>

          <div className="shelves-eyebrow">
            SHELF MANAGEMENT
          </div>

          <h1>
            Shelves
          </h1>

          <p>
            Organize retail shelves and connect
            them to your store locations.
          </p>

        </div>


        <button
          className="add-shelf-button"
          onClick={openForm}
        >

          <FaPlus />

          <span>
            Add Shelf
          </span>

        </button>

      </div>


      {/* =================================================
          ALERTS
      ================================================= */}

      {success && (

        <div className="shelves-alert success">

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

        <div className="shelves-alert error">

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

      <div className="shelves-summary">


        {/* TOTAL SHELVES */}

        <div className="shelf-summary-card">

          <div className="shelf-summary-icon cyan">
            <FaLayerGroup />
          </div>

          <div>

            <span>
              Total Shelves
            </span>

            <strong>
              {shelves.length}
            </strong>

          </div>

        </div>


        {/* CONNECTED STORES */}

        <div className="shelf-summary-card">

          <div className="shelf-summary-icon purple">
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


        {/* CAPACITY */}

        <div className="shelf-summary-card">

          <div className="shelf-summary-icon green">
            <FaBoxes />
          </div>

          <div>

            <span>
              Total Capacity
            </span>

            <strong>
              {totalCapacity}
            </strong>

          </div>

        </div>

      </div>


      {/* =================================================
          SHELF INVENTORY
      ================================================= */}

      <section className="shelves-panel">


        {/* PANEL HEADER */}

        <div className="shelves-panel-header">

          <div>

            <div className="shelves-panel-eyebrow">
              SHELF INVENTORY
            </div>

            <h2>
              Store Shelves
            </h2>

            <p>
              Shelves currently registered across
              your retail locations.
            </p>

          </div>


          <div className="shelf-search">

            <FaSearch />

            <input
              type="text"
              placeholder="Search shelves..."
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

          <div className="shelves-loading">

            <div className="shelf-loading-spinner"></div>

            <span>
              Loading shelves...
            </span>

          </div>


        ) : filteredShelves.length === 0 ? (

          /* =================================================
             EMPTY
          ================================================= */

          <div className="shelves-empty">

            <div className="shelves-empty-icon">
              <FaLayerGroup />
            </div>

            <h3>
              {search
                ? "No shelves found"
                : "No shelves yet"}
            </h3>

            <p>
              {search
                ? "Try a different search term."
                : "Add your first shelf to begin organizing your stores."}
            </p>


            {!search && (

              <button
                className="empty-add-shelf-button"
                onClick={openForm}
              >

                <FaPlus />

                Add Shelf

              </button>

            )}

          </div>


        ) : (

          /* =================================================
             TABLE
          ================================================= */

          <div className="shelves-table-wrapper">

            <table className="shelves-table">

              <thead>

                <tr>

                  <th>
                    Shelf
                  </th>

                  <th>
                    Section
                  </th>

                  <th>
                    Store
                  </th>

                  <th>
                    Location
                  </th>

                  <th>
                    Capacity
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredShelves.map(
                  (shelf, index) => {

                    const shelfId =
                      shelf?._id ||
                      shelf?.id ||
                      index;


                    return (

                      <tr
                        key={shelfId}
                      >


                        {/* SHELF */}

                        <td>

                          <div className="shelf-name-cell">

                            <div className="shelf-avatar">
                              <FaLayerGroup />
                            </div>

                            <div>

                              <strong>
                                {
                                  shelf.shelf_name ||
                                  "Unnamed Shelf"
                                }
                              </strong>

                              <small>
                                Shelf #{index + 1}
                              </small>

                            </div>

                          </div>

                        </td>


                        {/* SECTION */}

                        <td>

                          <span className="section-badge">

                            {shelf.section ||
                              "General"}

                          </span>

                        </td>


                        {/* STORE */}

                        <td>

                          <div className="shelf-store-cell">

                            <FaStore />

                            <span>
                              {getStoreName(
                                shelf.store_id
                              )}
                            </span>

                          </div>

                        </td>


                        {/* LOCATION */}

                        <td>

                          <div className="shelf-location-cell">

                            <FaMapMarkerAlt />

                            <span>
                              {getStoreLocation(
                                shelf.store_id
                              )}
                            </span>

                          </div>

                        </td>


                        {/* CAPACITY */}

                        <td>

                          <div className="capacity-cell">

                            <FaBoxes />

                            <strong>
                              {Number(
                                shelf.capacity || 0
                              )}
                            </strong>

                            <span>
                              units
                            </span>

                          </div>

                        </td>


                        {/* DELETE */}

                        <td>

                          <button
                            className="delete-shelf-button"
                            onClick={() =>
                              handleDelete(
                                shelf
                              )
                            }
                            disabled={
                              deletingId ===
                              shelfId
                            }
                            title="Delete shelf"
                          >

                            {deletingId === shelfId ? (

                              <span className="shelf-button-spinner"></span>

                            ) : (

                              <FaTrash />

                            )}

                          </button>

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
          ADD SHELF MODAL
      ================================================= */}

      {showForm && (

        <div
          className="shelf-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {

              closeForm();

            }

          }}
        >

          <div className="shelf-modal">


            {/* MODAL HEADER */}

            <div className="shelf-modal-header">

              <div>

                <span>
                  SHELF SETUP
                </span>

                <h2>
                  Add New Shelf
                </h2>

                <p>
                  Create a shelf and assign it
                  to a retail store.
                </p>

              </div>


              <button
                className="shelf-modal-close"
                onClick={closeForm}
                disabled={saving}
              >

                <FaTimes />

              </button>

            </div>


            {/* FORM */}

            <form
              className="shelf-form"
              onSubmit={
                handleCreateShelf
              }
            >


              {/* SHELF NAME */}

              <div className="shelf-form-field">

                <label>
                  Shelf Name
                </label>

                <div className="shelf-form-input">

                  <FaLayerGroup />

                  <input
                    type="text"
                    placeholder="e.g. Shelf A1"
                    value={shelfName}
                    onChange={(event) =>
                      setShelfName(
                        event.target.value
                      )
                    }
                    disabled={saving}
                  />

                </div>

              </div>


              {/* SECTION */}

              <div className="shelf-form-field">

                <label>
                  Section
                </label>

                <div className="shelf-form-input">

                  <FaBoxes />

                  <input
                    type="text"
                    placeholder="e.g. Beverages"
                    value={section}
                    onChange={(event) =>
                      setSection(
                        event.target.value
                      )
                    }
                    disabled={saving}
                  />

                </div>

              </div>


              {/* CAPACITY */}

              <div className="shelf-form-field">

                <label>
                  Capacity
                </label>

                <div className="shelf-form-input">

                  <FaBoxes />

                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="e.g. 50"
                    value={capacity}
                    onChange={(event) =>
                      setCapacity(
                        event.target.value
                      )
                    }
                    disabled={saving}
                  />

                </div>

              </div>


              {/* STORE */}

              <div className="shelf-form-field">

                <label>
                  Store
                </label>

                <div className="shelf-form-input">

                  <FaStore />

                  <select
                    value={storeId}
                    onChange={
                      handleStoreChange
                    }
                    disabled={saving}
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

              </div>


              {/* =================================================
                  NEW: ZONE
              ================================================= */}

              <div className="shelf-form-field">

                <label>
                  Zone
                </label>

                <div className="shelf-form-input">

                  <FaLayerGroup />

                  <select
                    value={zoneId}
                    onChange={
                      handleZoneChange
                    }
                    disabled={
                      saving ||
                      !storeId
                    }
                  >

                    <option value="">

                      {!storeId
                        ? "Select a store first"
                        : getSelectedStoreZones().length === 0
                          ? "No zones available"
                          : "Select a zone"}

                    </option>


                    {getSelectedStoreZones().map(
                      (zone) => (

                        <option
                          key={
                            zone.zone_id
                          }
                          value={
                            zone.zone_id
                          }
                        >

                          {
                            zone.zone_name
                          }

                          {" — "}

                          {
                            zone.zone_type ||
                            "General"
                          }

                        </option>

                      )
                    )}

                  </select>

                </div>

              </div>


              {/* ACTIONS */}

              <div className="shelf-modal-actions">

                <button
                  type="button"
                  className="shelf-cancel-button"
                  onClick={closeForm}
                  disabled={saving}
                >

                  Cancel

                </button>


                <button
                  type="submit"
                  className="save-shelf-button"
                  disabled={saving}
                >

                  {saving ? (

                    <>

                      <span className="shelf-button-spinner"></span>

                      Creating...

                    </>

                  ) : (

                    <>

                      <FaPlus />

                      Create Shelf

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

      <footer className="shelves-footer">

        <span>
          Consumer Attention Mapping System
        </span>

        <span>
          Shelf Intelligence
        </span>

      </footer>

    </div>

  );

}


export default Shelves;