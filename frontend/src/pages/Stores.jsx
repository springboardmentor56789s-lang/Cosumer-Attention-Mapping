import React, {
  useEffect,
  useState,
} from "react";

import {
  FaStore,
  FaMapMarkerAlt,
  FaPlus,
  FaTrash,
  FaArrowRight,
  FaTimes,
  FaVideo,
  FaLayerGroup,
  FaCamera,
} from "react-icons/fa";

import api from "../services/api";
import "../styles/Stores.css";


function Stores() {

  const [stores, setStores] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [selectedStore, setSelectedStore] =
    useState(null);

  const [storeCameras, setStoreCameras] =
    useState([]);

  const [loadingDetails, setLoadingDetails] =
    useState(false);

  const [showZoneForm, setShowZoneForm] =
    useState(false);

  const [showCameraForm, setShowCameraForm] =
    useState(false);

  const [zoneForm, setZoneForm] = useState({
    zone_name: "",
    zone_type: "General",
  });

  const [cameraForm, setCameraForm] = useState({
    camera_name: "",
    camera_location: "",
    camera_type: "Fixed",
    camera_status: "Active",
    zone_id: "",
  });

  const [form, setForm] = useState({
    store_name: "",
    location: "",
    category: "",
  });


  // =====================================================
  // LOAD STORES
  // =====================================================

  const loadStores = async () => {

    setLoading(true);
    setError("");

    try {

      const response =
        await api.get("/stores");

      setStores(
        response.data || []
      );

    } catch (err) {

      console.error(
        "Stores error:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to load stores."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    loadStores();

  }, []);


  // =====================================================
  // FORM
  // =====================================================

  const handleChange = (event) => {

    setForm({
      ...form,
      [event.target.name]:
        event.target.value,
    });

  };


  // =====================================================
  // CREATE STORE
  // =====================================================

  const handleCreateStore =
    async (event) => {

      event.preventDefault();

      setError("");
      setSuccess("");

      if (
        !form.store_name.trim() ||
        !form.location.trim() ||
        !form.category.trim()
      ) {

        setError(
          "Please fill all store fields."
        );

        return;
      }

      try {

        await api.post(
          "/stores",
          form
        );

        setSuccess(
          "Store created successfully."
        );

        setForm({
          store_name: "",
          location: "",
          category: "",
        });

        setShowForm(false);

        await loadStores();

      } catch (err) {

        console.error(
          "Create store error:",
          err
        );

        setError(
          err.response?.data?.detail ||
          "Unable to create store."
        );

      }
    };


  // =====================================================
  // DELETE STORE
  // =====================================================

  const handleDelete =
    async (store) => {

      const id =
        store._id ||
        store.id;

      if (!id) return;

      const confirmed =
        window.confirm(
          `Delete ${store.store_name}? This will also remove its cameras, shelves and products.`
        );

      if (!confirmed) return;

      try {

        await api.delete(
          `/stores/${id}`
        );

        setSuccess(
          "Store deleted successfully."
        );

        if (
          selectedStore &&
          (selectedStore._id === id ||
            selectedStore.id === id)
        ) {

          setSelectedStore(null);

        }

        await loadStores();

      } catch (err) {

        setError(
          err.response?.data?.detail ||
          "Unable to delete store."
        );

      }
    };


  // =====================================================
  // VIEW STORE
  // =====================================================

  const handleViewStore =
    async (store) => {

      const id =
        store._id ||
        store.id;

      if (!id) return;

      setError("");
      setSuccess("");
      setLoadingDetails(true);

      try {

        const [
          storeResponse,
          cameraResponse,
        ] = await Promise.all([

          api.get(
            `/stores/${id}`
          ),

          api.get(
            `/stores/${id}/cameras`
          ),

        ]);

        setSelectedStore(
          storeResponse.data
        );

        setStoreCameras(
          cameraResponse.data || []
        );

      } catch (err) {

        console.error(
          "Store details error:",
          err
        );

        setError(
          err.response?.data?.detail ||
          "Unable to load store details."
        );

      } finally {

        setLoadingDetails(false);

      }
    };


  // =====================================================
  // CLOSE STORE DETAILS
  // =====================================================

  const closeStoreDetails = () => {

    setSelectedStore(null);

    setStoreCameras([]);

    setShowZoneForm(false);

    setShowCameraForm(false);

  };


  // =====================================================
  // ZONE FORM
  // =====================================================

  const handleZoneChange =
    (event) => {

      setZoneForm({
        ...zoneForm,
        [event.target.name]:
          event.target.value,
      });

    };


  // =====================================================
  // ADD ZONE
  // =====================================================

  const handleAddZone =
    async (event) => {

      event.preventDefault();

      if (!selectedStore) return;

      if (!zoneForm.zone_name.trim()) {

        setError(
          "Please enter a zone name."
        );

        return;
      }

      try {

        const storeId =
          selectedStore._id;

        await api.post(
          `/stores/${storeId}/zones`,
          zoneForm
        );

        setSuccess(
          "Zone added successfully."
        );

        setZoneForm({
          zone_name: "",
          zone_type: "General",
        });

        setShowZoneForm(false);

        await handleViewStore(
          selectedStore
        );

        await loadStores();

      } catch (err) {

        setError(
          err.response?.data?.detail ||
          "Unable to add zone."
        );

      }
    };


  // =====================================================
  // DELETE ZONE
  // =====================================================

  const handleDeleteZone =
    async (zone) => {

      if (!selectedStore) return;

      const confirmed =
        window.confirm(
          `Delete ${zone.zone_name}?`
        );

      if (!confirmed) return;

      try {

        await api.delete(
          `/stores/${selectedStore._id}/zones/${zone.zone_id}`
        );

        setSuccess(
          "Zone deleted successfully."
        );

        await handleViewStore(
          selectedStore
        );

      } catch (err) {

        setError(
          err.response?.data?.detail ||
          "Unable to delete zone."
        );

      }
    };


  // =====================================================
  // CAMERA FORM
  // =====================================================

  const handleCameraChange =
    (event) => {

      setCameraForm({
        ...cameraForm,
        [event.target.name]:
          event.target.value,
      });

    };


  // =====================================================
  // ADD CAMERA
  // =====================================================

  const handleAddCamera =
    async (event) => {

      event.preventDefault();

      if (!selectedStore) return;

      if (
        !cameraForm.camera_name.trim() ||
        !cameraForm.camera_location.trim()
      ) {

        setError(
          "Please fill all camera fields."
        );

        return;
      }

      try {

        await api.post(
          "/cameras",
          {
            camera_name:
              cameraForm.camera_name,

            camera_location:
              cameraForm.camera_location,

            camera_type:
              cameraForm.camera_type,

            camera_status:
              cameraForm.camera_status,

            shelf_id: "",

            store_id:
              selectedStore._id,

            zone_id:
              cameraForm.zone_id,
          }
        );

        setSuccess(
          "Camera assigned successfully."
        );

        setCameraForm({
          camera_name: "",
          camera_location: "",
          camera_type: "Fixed",
          camera_status: "Active",
          zone_id: "",
        });

        setShowCameraForm(false);

        await handleViewStore(
          selectedStore
        );

      } catch (err) {

        setError(
          err.response?.data?.detail ||
          "Unable to assign camera."
        );

      }
    };


  // =====================================================
  // STATISTICS
  // =====================================================

  const activeLocations =
    stores.length;

  const intelligenceCoverage =
    stores.length
      ? "Connected"
      : "--";


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="stores-content">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="stores-page-header">

        <div>

          <span>
            STORE MANAGEMENT
          </span>

          <h1>
            Stores
          </h1>

          <p>
            Manage retail locations
            connected to the consumer
            attention platform.
          </p>

        </div>


        <button
          className="stores-add-button"
          type="button"
          onClick={() =>
            setShowForm(!showForm)
          }
        >

          <FaPlus />

          {showForm
            ? "Close"
            : "Add Store"}

        </button>

      </div>


      {/* =================================================
          MESSAGES
      ================================================= */}

      {error && (

        <div className="stores-message error">

          {error}

          <button
            type="button"
            onClick={() =>
              setError("")
            }
          >
            <FaTimes />
          </button>

        </div>

      )}


      {success && (

        <div className="stores-message success">

          {success}

          <button
            type="button"
            onClick={() =>
              setSuccess("")
            }
          >
            <FaTimes />
          </button>

        </div>

      )}


      {/* =================================================
          CREATE FORM
      ================================================= */}

      {showForm && (

        <section className="store-create-panel">

          <div className="store-create-heading">

            <span>
              NEW LOCATION
            </span>

            <h2>
              Register a Retail Store
            </h2>

          </div>


          <form
            className="store-form"
            onSubmit={
              handleCreateStore
            }
          >

            <div className="store-field">

              <label>
                Store Name
              </label>

              <input
                name="store_name"
                value={
                  form.store_name
                }
                onChange={
                  handleChange
                }
                placeholder="e.g. V Mart"
              />

            </div>


            <div className="store-field">

              <label>
                Location
              </label>

              <input
                name="location"
                value={
                  form.location
                }
                onChange={
                  handleChange
                }
                placeholder="e.g. Chennai"
              />

            </div>


            <div className="store-field">

              <label>
                Category
              </label>

              <input
                name="category"
                value={
                  form.category
                }
                onChange={
                  handleChange
                }
                placeholder="e.g. Supermarket"
              />

            </div>


            <button
              className="store-create-button"
              type="submit"
            >
              Create Store
            </button>

          </form>

        </section>

      )}


      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="store-statistics">


        <div className="store-stat">

          <div className="store-stat-icon">
            <FaStore />
          </div>

          <div>

            <span>
              Total Stores
            </span>

            <strong>
              {stores.length}
            </strong>

          </div>

        </div>


        <div className="store-stat">

          <div className="store-stat-icon green">
            <FaMapMarkerAlt />
          </div>

          <div>

            <span>
              Active Locations
            </span>

            <strong>
              {activeLocations}
            </strong>

          </div>

        </div>


        <div className="store-stat">

          <div className="store-stat-icon purple">
            AI
          </div>

          <div>

            <span>
              Intelligence Coverage
            </span>

            <strong>
              {intelligenceCoverage}
            </strong>

          </div>

        </div>

      </div>


      {/* =================================================
          STORE LIST HEADER
      ================================================= */}

      <div className="stores-list-header">

        <div>

          <h2>
            Registered Stores
          </h2>

          <p>
            Retail locations available
            for camera and shelf mapping.
          </p>

        </div>

        <span>
          {stores.length} locations
        </span>

      </div>


      {/* =================================================
          LOADING
      ================================================= */}

      {loading && (

        <div className="stores-empty">

          Loading stores...

        </div>

      )}


      {/* =================================================
          EMPTY
      ================================================= */}

      {!loading &&
        stores.length === 0 && (

          <div className="stores-empty">

            <div className="empty-icon">
              <FaStore />
            </div>

            <h3>
              No stores registered
            </h3>

            <p>
              Add your first retail
              location to begin.
            </p>

            <button
              onClick={() =>
                setShowForm(true)
              }
            >

              <FaPlus />

              Add Store

            </button>

          </div>

        )}


      {/* =================================================
          GRID
      ================================================= */}

      {!loading &&
        stores.length > 0 && (

          <div className="stores-grid">

            {stores.map(
              (store) => {

                const id =
                  store._id ||
                  store.id;

                const zones =
                  store.zones || [];

                return (

                  <article
                    className="store-card"
                    key={id}
                  >

                    <div className="store-card-top">

                      <div className="store-icon">
                        <FaStore />
                      </div>

                      <span className="store-status">

                        <span></span>

                        ACTIVE

                      </span>

                    </div>


                    <h3>
                      {store.store_name}
                    </h3>


                    <div className="store-location">

                      <FaMapMarkerAlt />

                      <span>
                        {store.location}
                      </span>

                    </div>


                    <div className="store-category">

                      <span>
                        CATEGORY
                      </span>

                      <strong>
                        {store.category}
                      </strong>

                    </div>


                    <div className="store-mini-info">

                      <span>
                        <FaLayerGroup />
                        {zones.length} zones
                      </span>

                    </div>


                    <div className="store-actions">

                      <button
                        className="store-view-button"
                        type="button"
                        onClick={() =>
                          handleViewStore(
                            store
                          )
                        }
                      >

                        View Store

                        <FaArrowRight />

                      </button>


                      <button
                        className="store-delete-button"
                        type="button"
                        onClick={() =>
                          handleDelete(
                            store
                          )
                        }
                      >

                        <FaTrash />

                      </button>

                    </div>

                  </article>

                );

              }
            )}

          </div>

        )}


      {/* =================================================
          STORE DETAILS
      ================================================= */}

      {selectedStore && (

        <div className="store-details-overlay">

          <section className="store-details-panel">


            {/* HEADER */}

            <div className="store-details-header">

              <div>

                <span>
                  STORE DETAILS
                </span>

                <h2>
                  {selectedStore.store_name}
                </h2>

                <p>
                  <FaMapMarkerAlt />
                  {selectedStore.location}
                </p>

              </div>


              <button
                className="store-details-close"
                type="button"
                onClick={
                  closeStoreDetails
                }
              >
                <FaTimes />
              </button>

            </div>


            {loadingDetails ? (

              <div className="store-details-loading">
                Loading store intelligence...
              </div>

            ) : (

              <>


                {/* STORE INFORMATION */}

                <div className="details-section">

                  <div className="details-section-title">

                    <span>
                      STORE INFORMATION
                    </span>

                  </div>


                  <div className="details-info-grid">

                    <div>

                      <span>
                        STORE ID
                      </span>

                      <strong>
                        {selectedStore._id}
                      </strong>

                    </div>


                    <div>

                      <span>
                        LOCATION
                      </span>

                      <strong>
                        {selectedStore.location}
                      </strong>

                    </div>


                    <div>

                      <span>
                        CATEGORY
                      </span>

                      <strong>
                        {selectedStore.category}
                      </strong>

                    </div>


                    <div>

                      <span>
                        STATUS
                      </span>

                      <strong className="active-text">
                        ● ACTIVE
                      </strong>

                    </div>

                  </div>

                </div>


                {/* OVERVIEW */}

                <div className="details-overview">

                  <div className="overview-card">

                    <FaLayerGroup />

                    <span>
                      ZONES
                    </span>

                    <strong>
                      {
                        (
                          selectedStore.zones ||
                          []
                        ).length
                      }
                    </strong>

                  </div>


                  <div className="overview-card">

                    <FaVideo />

                    <span>
                      CAMERAS
                    </span>

                    <strong>
                      {storeCameras.length}
                    </strong>

                  </div>


                  <div className="overview-card">

                    <FaStore />

                    <span>
                      SHELVES
                    </span>

                    <strong>
                      0
                    </strong>

                  </div>

                </div>


                {/* ZONES */}

                <div className="details-section">

                  <div className="details-section-heading">

                    <div>

                      <span>
                        STORE ZONES
                      </span>

                      <p>
                        Define areas used by
                        shopper tracking.
                      </p>

                    </div>


                    <button
                      type="button"
                      className="details-add-button"
                      onClick={() =>
                        setShowZoneForm(
                          !showZoneForm
                        )
                      }
                    >

                      <FaPlus />

                      Add Zone

                    </button>

                  </div>


                  {showZoneForm && (

                    <form
                      className="inline-create-form"
                      onSubmit={
                        handleAddZone
                      }
                    >

                      <input
                        name="zone_name"
                        value={
                          zoneForm.zone_name
                        }
                        onChange={
                          handleZoneChange
                        }
                        placeholder="Zone name"
                      />


                      <select
                        name="zone_type"
                        value={
                          zoneForm.zone_type
                        }
                        onChange={
                          handleZoneChange
                        }
                      >

                        <option value="General">
                          General
                        </option>

                        <option value="Entrance">
                          Entrance
                        </option>

                        <option value="Shopping">
                          Shopping
                        </option>

                        <option value="Checkout">
                          Checkout
                        </option>

                        <option value="Exit">
                          Exit
                        </option>

                      </select>


                      <button
                        type="submit"
                      >
                        Create
                      </button>

                    </form>

                  )}


                  <div className="zones-list">

                    {(
                      selectedStore.zones ||
                      []
                    ).length === 0 ? (

                      <div className="details-empty">
                        No zones configured yet.
                      </div>

                    ) : (

                      (
                        selectedStore.zones ||
                        []
                      ).map(
                        (zone) => (

                          <div
                            className="zone-card"
                            key={
                              zone.zone_id
                            }
                          >

                            <div className="zone-icon">
                              <FaLayerGroup />
                            </div>

                            <div>

                              <strong>
                                {zone.zone_name}
                              </strong>

                              <span>
                                {zone.zone_type}
                              </span>

                            </div>


                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteZone(
                                  zone
                                )
                              }
                            >
                              <FaTrash />
                            </button>

                          </div>

                        )
                      )

                    )}

                  </div>

                </div>


                {/* CAMERAS */}

                <div className="details-section">

                  <div className="details-section-heading">

                    <div>

                      <span>
                        CAMERA ASSIGNMENT
                      </span>

                      <p>
                        Connect cameras to
                        store zones.
                      </p>

                    </div>


                    <button
                      type="button"
                      className="details-add-button"
                      onClick={() =>
                        setShowCameraForm(
                          !showCameraForm
                        )
                      }
                    >

                      <FaCamera />

                      Add Camera

                    </button>

                  </div>


                  {showCameraForm && (

                    <form
                      className="camera-create-form"
                      onSubmit={
                        handleAddCamera
                      }
                    >

                      <input
                        name="camera_name"
                        value={
                          cameraForm.camera_name
                        }
                        onChange={
                          handleCameraChange
                        }
                        placeholder="Camera name"
                      />


                      <input
                        name="camera_location"
                        value={
                          cameraForm.camera_location
                        }
                        onChange={
                          handleCameraChange
                        }
                        placeholder="Camera location"
                      />


                      <select
                        name="camera_type"
                        value={
                          cameraForm.camera_type
                        }
                        onChange={
                          handleCameraChange
                        }
                      >

                        <option value="Fixed">
                          Fixed
                        </option>

                        <option value="PTZ">
                          PTZ
                        </option>

                        <option value="Dome">
                          Dome
                        </option>

                        <option value="IP">
                          IP Camera
                        </option>

                      </select>


                      <select
                        name="zone_id"
                        value={
                          cameraForm.zone_id
                        }
                        onChange={
                          handleCameraChange
                        }
                      >

                        <option value="">
                          Select Zone
                        </option>

                        {(
                          selectedStore.zones ||
                          []
                        ).map(
                          (zone) => (

                            <option
                              key={
                                zone.zone_id
                              }
                              value={
                                zone.zone_id
                              }
                            >
                              {zone.zone_name}
                            </option>

                          )
                        )}

                      </select>


                      <select
                        name="camera_status"
                        value={
                          cameraForm.camera_status
                        }
                        onChange={
                          handleCameraChange
                        }
                      >

                        <option value="Active">
                          Active
                        </option>

                        <option value="Inactive">
                          Inactive
                        </option>

                        <option value="Maintenance">
                          Maintenance
                        </option>

                      </select>


                      <button
                        type="submit"
                      >
                        Assign Camera
                      </button>

                    </form>

                  )}


                  <div className="camera-list">

                    {storeCameras.length === 0 ? (

                      <div className="details-empty">
                        No cameras assigned to
                        this store yet.
                      </div>

                    ) : (

                      storeCameras.map(
                        (camera) => {

                          const zone =
                            (
                              selectedStore.zones ||
                              []
                            ).find(
                              (item) =>
                                item.zone_id ===
                                camera.zone_id
                            );

                          return (

                            <div
                              className="camera-card"
                              key={
                                camera._id
                              }
                            >

                              <div className="camera-icon">
                                <FaVideo />
                              </div>


                              <div className="camera-main">

                                <strong>
                                  {camera.camera_name}
                                </strong>

                                <span>
                                  {camera.camera_location}
                                </span>

                              </div>


                              <div className="camera-zone">

                                <span>
                                  ZONE
                                </span>

                                <strong>
                                  {
                                    zone
                                      ?.zone_name ||
                                    "Unassigned"
                                  }
                                </strong>

                              </div>


                              <div
                                className={`camera-status ${
                                  (
                                    camera.camera_status ||
                                    ""
                                  ).toLowerCase()
                                }`}
                              >

                                ●
                                {" "}
                                {camera.camera_status}

                              </div>

                            </div>

                          );

                        }
                      )

                    )}

                  </div>

                </div>

              </>

            )}

          </section>

        </div>

      )}


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="stores-footer">

        <span>
          Attentia AI • Store Management
        </span>

        <span>
          Consumer Intelligence Platform
        </span>

      </footer>

    </div>

  );

}


export default Stores;