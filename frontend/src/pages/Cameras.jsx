import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  FiCamera,
  FiPlus,
  FiRefreshCw,
  FiMapPin,
  FiTrash2,
  FiX,
  FiSave,
  FiVideo,
  FiMaximize,
  FiUpload,
  FiAlertCircle,
} from "react-icons/fi";

import "../styles/Cameras.css";


/* =========================================================
   API
========================================================= */

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

/* =========================================================
   CAMERA PAGE
========================================================= */

function Camera() {

  /* =======================================================
     CAMERA STATE
  ======================================================= */

  const [cameras, setCameras] = useState([]);

  const [selectedCamera, setSelectedCamera] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [videoError, setVideoError] =
    useState("");

  const [selectedFile, setSelectedFile] =
    useState(null);


  /* =======================================================
     UPLOADED VIDEO STATE

     This is important because the camera response may not
     immediately contain the uploaded video's filename.

     The upload API itself returns:
       filename
       video_url
       camera_id
  ======================================================= */

  const [uploadedVideo, setUploadedVideo] =
    useState(null);


  /* =======================================================
     FORM
  ======================================================= */

  const [formData, setFormData] = useState({

    camera_name: "",
    camera_location: "",
    camera_type: "Indoor",
    camera_status: "Online",
    shelf_id: "",
    store_id: "",
    zone_id: "",

  });


  /* =======================================================
     TOKEN
  ======================================================= */

  const getToken = useCallback(() => {

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    ""
  );

}, []);

const authHeaders = useCallback(() => {

  const token = getToken();

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};

}, [getToken]);


  /* =======================================================
     FETCH CAMERAS
  ======================================================= */

  const fetchCameras = useCallback(async () => {

    try {

      setLoading(true);

      setError("");


      const response = await fetch(
        `${API_BASE_URL}/cameras`,
        {
          headers: {
            ...authHeaders(),
          },
        }
      );


      if (!response.ok) {

        const data =
          await response.json().catch(
            () => ({})
          );

        throw new Error(
          data.detail ||
          "Failed to load cameras"
        );

      }


      const data =
        await response.json();


      const cameraList =
        Array.isArray(data)
          ? data
          : data.cameras || [];


      setCameras(cameraList);


      /* ---------------------------------------------------
         Keep selected camera if it still exists
      --------------------------------------------------- */

      if (cameraList.length > 0) {

        setSelectedCamera((previous) => {

          if (!previous) {

            return cameraList[0];

          }


          const previousId =
            previous._id ||
            previous.id;


          const updated =
            cameraList.find(
              (camera) =>
                String(
                  camera._id ||
                  camera.id
                ) ===
                String(previousId)
            );


          return (
            updated ||
            cameraList[0]
          );

        });

      } else {

        setSelectedCamera(null);

      }

    } catch (err) {

      console.error(
        "Camera loading error:",
        err
      );

      setError(
        err.message ||
        "Unable to load cameras"
      );

    } finally {

      setLoading(false);

    }

    }, [authHeaders]);


  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {

    fetchCameras();

  }, [fetchCameras]);


  /* =======================================================
     SELECT CAMERA
  ======================================================= */

  const handleSelectCamera = (camera) => {

    setSelectedCamera(camera);

    setVideoError("");

    setSelectedFile(null);


    /*
     * Clear the previously displayed video first.
     */
    setUploadedVideo(null);


    /*
     * Try to get video information directly from
     * the camera object.
     *
     * Different backend versions may use different
     * property names.
     */

    const filename =
      camera.latest_video_filename ||
      camera.video_filename ||
      camera.filename ||
      camera.latest_filename ||
      null;


    const videoUrl =
      camera.video_url ||
      camera.latest_video_url ||
      null;


    if (videoUrl || filename) {

      setUploadedVideo({

        filename,

        video_url:
          videoUrl ||
          `/uploads/${filename}`,

      });

    }

  };


  /* =======================================================
     FORM INPUT
  ======================================================= */

  const handleInputChange = (event) => {

    const {
      name,
      value,
    } = event.target;


    setFormData((previous) => ({

      ...previous,

      [name]: value,

    }));

  };


  /* =======================================================
     OPEN ADD CAMERA
  ======================================================= */

  const openAddCamera = () => {

    setFormData({

      camera_name: "",
      camera_location: "",
      camera_type: "Indoor",
      camera_status: "Online",
      shelf_id: "",
      store_id: "",
      zone_id: "",

    });

    setShowModal(true);

  };


  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  const closeModal = () => {

    if (saving) return;

    setShowModal(false);

  };


  /* =======================================================
     CREATE CAMERA
  ======================================================= */

  const handleCreateCamera = async (event) => {

    event.preventDefault();


    try {

      setSaving(true);

      setError("");


      const response = await fetch(
        `${API_BASE_URL}/cameras`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            ...authHeaders(),
          },

          body: JSON.stringify(
            formData
          ),

        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Failed to create camera"
        );

      }


      setShowModal(false);


      await fetchCameras();


    } catch (err) {

      console.error(
        "Create camera error:",
        err
      );

      setError(
        err.message ||
        "Failed to create camera"
      );

    } finally {

      setSaving(false);

    }

  };


  /* =======================================================
     DELETE CAMERA
  ======================================================= */

  const handleDeleteCamera = async () => {

    if (!selectedCamera) return;


    const cameraId =
      selectedCamera._id ||
      selectedCamera.id;


    if (
      !window.confirm(
        "Are you sure you want to delete this camera?"
      )
    ) {

      return;

    }


    try {

      setError("");

      setVideoError("");

      setUploadedVideo(null);


      const response = await fetch(
        `${API_BASE_URL}/cameras/${cameraId}`,
        {
          method: "DELETE",

          headers: {
            ...authHeaders(),
          },
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Failed to delete camera"
        );

      }


      setSelectedCamera(null);


      await fetchCameras();


    } catch (err) {

      console.error(
        "Delete camera error:",
        err
      );

      setError(
        err.message ||
        "Failed to delete camera"
      );

    }

  };


  /* =======================================================
     FILE SELECT
  ======================================================= */

  const handleFileChange = (event) => {

    const file =
      event.target.files?.[0];


    if (!file) {

      setSelectedFile(null);

      return;

    }


    setSelectedFile(file);

    setVideoError("");

  };


  /* =======================================================
     UPLOAD VIDEO
  ======================================================= */

  const handleUploadVideo = async () => {

    if (!selectedCamera) {

      setVideoError(
        "Please select a camera first."
      );

      return;

    }


    if (!selectedFile) {

      setVideoError(
        "Please select a video file."
      );

      return;

    }


    const cameraId =
      selectedCamera._id ||
      selectedCamera.id;


    try {

      setUploading(true);

      setVideoError("");


      /* ---------------------------------------------------
         Create multipart form data
      --------------------------------------------------- */

      const uploadFormData =
        new FormData();


      uploadFormData.append(
        "video",
        selectedFile
      );


      uploadFormData.append(
        "camera_id",
        cameraId
      );


      /* ---------------------------------------------------
         Upload original video
      --------------------------------------------------- */

      const response = await fetch(
        `${API_BASE_URL}/upload-video?camera_id=${encodeURIComponent(
          cameraId
        )}`,
        {
          method: "POST",

          headers: {
            ...authHeaders(),
          },

          body: uploadFormData,

        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Video upload failed"
        );

      }


      console.log(
        "Video uploaded successfully:",
        data
      );


      /* =================================================
         IMPORTANT

         Backend response:

         {
           message: "Video uploaded successfully",
           video_id: "...",
           filename: "...",
           processing_status: "Pending",
           camera_id: "...",
           video_url: "/uploads/....mp4"
         }

         Save that information directly.
      ================================================= */

      setUploadedVideo({

        filename:
          data.filename ||
          null,

        video_url:
          data.video_url ||
          (
            data.filename
              ? `/uploads/${data.filename}`
              : null
          ),

      });


      /* ---------------------------------------------------
         Remove selected file after successful upload
      --------------------------------------------------- */

      setSelectedFile(null);


      /* ---------------------------------------------------
         Reset file input
      --------------------------------------------------- */

      const fileInput =
        document.getElementById(
          "camera-video-upload"
        );


      if (fileInput) {

        fileInput.value = "";

      }


      /* ---------------------------------------------------
         Refresh cameras.

         We DON'T depend on the camera response for
         displaying the uploaded video.
      --------------------------------------------------- */

      await fetchCameras();


    } catch (err) {

      console.error(
        "Video upload error:",
        err
      );

      setVideoError(
        err.message ||
        "Video upload failed"
      );

    } finally {

      setUploading(false);

    }

  };


  /* =======================================================
     GET CAMERA ID
  ======================================================= */

  const getCameraId = () => {

    if (!selectedCamera) return "";


    return (
      selectedCamera._id ||
      selectedCamera.id ||
      ""
    );

  };


  /* =======================================================
     GET UPLOADED VIDEO FILENAME
  ======================================================= */

  const getUploadedVideoFilename = () => {

    if (uploadedVideo?.filename) {

      return uploadedVideo.filename;

    }


    if (!selectedCamera) {

      return null;

    }


    return (

      selectedCamera.latest_video_filename ||

      selectedCamera.video_filename ||

      selectedCamera.filename ||

      selectedCamera.latest_filename ||

      null

    );

  };


  /* =======================================================
     GET UPLOADED VIDEO URL
  ======================================================= */

  const getUploadedVideoUrl = () => {

    /*
     * First priority:
     * URL returned directly by upload API.
     */

    if (
      uploadedVideo?.video_url
    ) {

      const url =
        uploadedVideo.video_url;


      /*
       * If backend returned an absolute URL,
       * don't add API_BASE_URL again.
       */

      if (
        url.startsWith("http://") ||
        url.startsWith("https://")
      ) {

        return url;

      }


      return (
        `${API_BASE_URL}${url}`
      );

    }


    /*
     * Second priority:
     * filename returned by upload API.
     */

    const filename =
      getUploadedVideoFilename();


    if (filename) {

      return (
        `${API_BASE_URL}/uploads/${encodeURIComponent(
          filename
        )}`
      );

    }


    return null;

  };


  /* =======================================================
     FULLSCREEN
  ======================================================= */

  const handleFullscreen = () => {

    const video =
      document.getElementById(
        "camera-original-video"
      );


    if (!video) return;


    if (
      document.fullscreenElement
    ) {

      document.exitFullscreen();

    } else if (
      video.requestFullscreen
    ) {

      video.requestFullscreen();

    }

  };


  /* =======================================================
     COUNTS
  ======================================================= */

  const totalCameras =
    cameras.length;


  const onlineCameras =
    cameras.filter(
      (camera) =>
        String(
          camera.camera_status ||
          ""
        ).toLowerCase() ===
        "online"
    ).length;


  const offlineCameras =
    totalCameras -
    onlineCameras;


  /* =======================================================
     RENDER
  ======================================================= */

  return (

    <div className="cameras-page">


      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="cameras-header">

        <div>

          <span className="camera-eyebrow">
            CAMERA MANAGEMENT
          </span>

          <h1>
            Cameras
          </h1>

          <p>
            Manage store cameras and view uploaded videos.
          </p>

        </div>


        <div className="camera-header-right">

          <button
            className="camera-refresh"
            onClick={fetchCameras}
            title="Refresh"
          >

            <FiRefreshCw />

          </button>


          <button
            className="add-camera-button"
            onClick={openAddCamera}
          >

            <FiPlus />

            Add Camera

          </button>

        </div>

      </div>


      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (

        <div className="camera-error">

          <FiAlertCircle />

          <span>
            {error}
          </span>

        </div>

      )}


      {/* ===================================================
          OVERVIEW
      =================================================== */}

      <div className="camera-overview">

        <div>

          <FiCamera />

          <div>

            <span>
              Total Cameras
            </span>

            <strong>
              {totalCameras}
            </strong>

          </div>

        </div>


        <div>

          <FiVideo />

          <div>

            <span>
              Online
            </span>

            <strong>
              {onlineCameras}
            </strong>

          </div>

        </div>


        <div>

          <FiAlertCircle />

          <div>

            <span>
              Offline
            </span>

            <strong>
              {offlineCameras}
            </strong>

          </div>

        </div>

      </div>


      {/* ===================================================
          WORKSPACE
      =================================================== */}

      <div className="camera-workspace">


        {/* =================================================
            SIDEBAR
        ================================================= */}

        <div className="camera-sidebar">


          {/* ===============================================
              SIDEBAR HEADER
          =============================================== */}

          <div className="camera-sidebar-header">

            <div>

              <span>
                DEVICES
              </span>

              <h2>
                Camera List
              </h2>

            </div>

            <strong>
              {cameras.length}
            </strong>

          </div>


          {/* ===============================================
              CAMERA LIST
          =============================================== */}

          <div className="camera-list">

            {loading ? (

              <div className="camera-loading">

                Loading cameras...

              </div>

            ) : cameras.length === 0 ? (

              <div className="camera-empty">

                <FiCamera />

                <h3>
                  No cameras
                </h3>

                <p>
                  Add your first camera to start managing videos.
                </p>

                <button
                  onClick={openAddCamera}
                >

                  <FiPlus />

                  Add Camera

                </button>

              </div>

            ) : (

              cameras.map((camera) => {

                const id =
                  camera._id ||
                  camera.id;


                const selectedId =
                  selectedCamera?._id ||
                  selectedCamera?.id;


                const isSelected =
                  String(selectedId) ===
                  String(id);


                const status =
                  String(
                    camera.camera_status ||
                    "Offline"
                  ).toLowerCase();


                return (

                  <div
                    key={id}
                    className={`camera-item ${
                      isSelected
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      handleSelectCamera(camera)
                    }
                  >

                    <div className="camera-item-icon">

                      <FiCamera />

                    </div>


                    <div className="camera-item-info">

                      <strong>

                        {
                          camera.camera_name ||
                          "Unnamed Camera"
                        }

                      </strong>


                      <span>

                        <FiMapPin />

                        {
                          camera.camera_location ||
                          "No location"
                        }

                      </span>

                    </div>


                    <div
                      className={`camera-status ${
                        status === "online"
                          ? "online"
                          : "offline"
                      }`}
                    >

                      <span />

                      {
                        status === "online"
                          ? "Online"
                          : "Offline"
                      }

                    </div>

                  </div>

                );

              })

            )}

          </div>


          {/* ===============================================
              SIDEBAR ADD
          =============================================== */}

          {cameras.length > 0 && (

            <button
              className="sidebar-add"
              onClick={openAddCamera}
            >

              <FiPlus />

              Add Camera

            </button>

          )}

        </div>


        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="camera-content">

          {!selectedCamera ? (

            <div className="no-camera-selected">

              <FiCamera />

              <h2>
                Select a camera
              </h2>

              <p>
                Choose a camera from the list to view its uploaded video.
              </p>

            </div>

          ) : (

            <>


              {/* ===========================================
                  CONTENT HEADER
              =========================================== */}

              <div className="camera-content-header">

                <div>

                  <div className="camera-name-row">

                    <h2>

                      {
                        selectedCamera.camera_name ||
                        "Unnamed Camera"
                      }

                    </h2>


                    <span
                      className={`detail-status ${
                        String(
                          selectedCamera.camera_status ||
                          ""
                        ).toLowerCase() ===
                        "online"
                          ? "online"
                          : "offline"
                      }`}
                    >

                      <span />

                      {
                        selectedCamera.camera_status ||
                        "Offline"
                      }

                    </span>

                  </div>


                  <p>

                    <FiMapPin />

                    {
                      selectedCamera.camera_location ||
                      "No location specified"
                    }

                  </p>

                </div>


                <button
                  className="delete-camera"
                  onClick={
                    handleDeleteCamera
                  }
                >

                  <FiTrash2 />

                  Delete

                </button>

              </div>


              {/* ===========================================
                  VIDEO SECTION
              =========================================== */}

              <div className="camera-video-section">


                {/* =========================================
                    VIDEO HEADING
                ========================================= */}

                <div className="section-heading">

                  <div>

                    <span>
                      VIDEO
                    </span>

                    <h3>
                      Uploaded Video
                    </h3>

                  </div>


                  {getUploadedVideoUrl() && (

                    <button
                      className="fullscreen-button"
                      onClick={
                        handleFullscreen
                      }
                      title="Fullscreen"
                    >

                      <FiMaximize />

                    </button>

                  )}

                </div>


                {/* =========================================
                    VIDEO
                ========================================= */}

                <div className="camera-video-container">

                  {getUploadedVideoUrl() ? (

                    <video
                      id="camera-original-video"
                      className="camera-video"
                      controls
                      preload="metadata"
                      src={
                        getUploadedVideoUrl()
                      }
                      onError={() => {

                        setVideoError(
                          "Unable to play the uploaded video."
                        );

                      }}
                    />

                  ) : (

                    <div className="video-placeholder">

                      <FiVideo />

                      <h3>
                        No uploaded video
                      </h3>

                      <p>
                        Upload a video for this camera to view it here.
                      </p>

                    </div>

                  )}


                  {videoError && (

                    <div className="video-error-message">

                      <FiAlertCircle />

                      {videoError}

                    </div>

                  )}

                </div>


                {/* =========================================================
                    VIDEO ACTIONS
                ========================================================= */}

                <div className="camera-video-actions">


                  <div className="video-upload-left">


                    <input
                      type="file"
                      accept="video/*"
                      onChange={
                        handleFileChange
                      }
                      id="camera-video-upload"
                      className="camera-file-input"
                    />


                    <label
                      htmlFor="camera-video-upload"
                      className="choose-video-button"
                    >

                      <FiUpload />

                      Choose Video

                    </label>


                    {selectedFile && (

                      <div className="selected-video-file">

                        <FiVideo />

                        <span>
                          {selectedFile.name}
                        </span>

                      </div>

                    )}

                  </div>


                  <button
                    type="button"
                    className="upload-video-button"
                    onClick={
                      handleUploadVideo
                    }
                    disabled={
                      uploading ||
                      !selectedFile
                    }
                  >

                    <FiUpload />

                    {
                      uploading
                        ? "Uploading..."
                        : "Upload Video"
                    }

                  </button>

                </div>


                {/* =========================================================
                    VIDEO STATUS
                ========================================================= */}

                {videoError && (

                  <div className="video-status error">

                    <FiAlertCircle />

                    <span>
                      {videoError}
                    </span>

                  </div>

                )}


                {!videoError &&
                  getUploadedVideoUrl() && (

                  <div className="video-status success">

                    <FiVideo />

                    <div>

                      <strong>
                        Video available
                      </strong>

                      <span>
                        Original uploaded footage is displayed above.
                      </span>

                    </div>

                  </div>

                )}


                {/* =========================================================
                    CAMERA INFORMATION
                ========================================================= */}

                <div className="camera-information">


                  <div className="camera-info-card">

                    <span>
                      Camera Type
                    </span>

                    <strong>

                      {
                        selectedCamera.camera_type ||
                        "-"
                      }

                    </strong>

                  </div>


                  <div className="camera-info-card">

                    <span>
                      Store ID
                    </span>

                    <strong>

                      {
                        selectedCamera.store_id ||
                        "-"
                      }

                    </strong>

                  </div>


                  <div className="camera-info-card">

                    <span>
                      Zone ID
                    </span>

                    <strong>

                      {
                        selectedCamera.zone_id ||
                        "-"
                      }

                    </strong>

                  </div>


                  <div className="camera-info-card">

                    <span>
                      Camera ID
                    </span>

                    <strong>

                      {
                        getCameraId() ||
                        "-"
                      }

                    </strong>

                  </div>


                </div>


              </div>

            </>

          )}

        </div>

      </div>


      {/* ===================================================
          ADD CAMERA MODAL
      =================================================== */}

      {showModal && (

        <div
          className="camera-modal-backdrop"
          onClick={closeModal}
        >

          <div
            className="camera-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >


            {/* =============================================
                MODAL HEADER
            ============================================= */}

            <div className="modal-header">

              <div>

                <span>
                  CAMERA MANAGEMENT
                </span>

                <h2>
                  Add Camera
                </h2>

              </div>


              <button
                type="button"
                onClick={closeModal}
              >

                <FiX />

              </button>

            </div>


            {/* =============================================
                FORM
            ============================================= */}

            <form
              onSubmit={
                handleCreateCamera
              }
            >


              {/* CAMERA NAME */}

              <label>

                Camera Name

                <input
                  type="text"
                  name="camera_name"
                  value={
                    formData.camera_name
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Enter camera name"
                  required
                />

              </label>


              {/* CAMERA LOCATION */}

              <label>

                Camera Location

                <input
                  type="text"
                  name="camera_location"
                  value={
                    formData.camera_location
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Enter location"
                  required
                />

              </label>


              {/* TYPE + STATUS */}

              <div className="modal-row">


                <label>

                  Camera Type

                  <select
                    name="camera_type"
                    value={
                      formData.camera_type
                    }
                    onChange={
                      handleInputChange
                    }
                  >

                    <option value="Indoor">
                      Indoor
                    </option>

                    <option value="Outdoor">
                      Outdoor
                    </option>

                    <option value="Ceiling">
                      Ceiling
                    </option>

                    <option value="Entrance">
                      Entrance
                    </option>

                    <option value="Other">
                      Other
                    </option>

                    <option value="CCTV">
                      CCTV
                    </option>

                  </select>

                </label>


                <label>

                  Status

                  <select
                    name="camera_status"
                    value={
                      formData.camera_status
                    }
                    onChange={
                      handleInputChange
                    }
                  >

                    <option value="Online">
                      Online
                    </option>

                    <option value="Offline">
                      Offline
                    </option>

                  </select>

                </label>


              </div>


              {/* STORE + ZONE */}

              <div className="modal-row">


                <label>

                  Store ID

                  <input
                    type="text"
                    name="store_id"
                    value={
                      formData.store_id
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="Store ID"
                  />

                </label>


                <label>

                  Zone ID

                  <input
                    type="text"
                    name="zone_id"
                    value={
                      formData.zone_id
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="Zone ID"
                  />

                </label>


              </div>


              {/* SHELF */}

              <label>

                Shelf ID

                <input
                  type="text"
                  name="shelf_id"
                  value={
                    formData.shelf_id
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Shelf ID"
                />

              </label>


              {/* ACTIONS */}

              <div className="modal-actions">


                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >

                  Cancel

                </button>


                <button
                  type="submit"
                  className="save-camera-button"
                  disabled={saving}
                >

                  <FiSave />

                  {
                    saving
                      ? "Saving..."
                      : "Save Camera"
                  }

                </button>


              </div>


            </form>

          </div>

        </div>

      )}

    </div>

  );

}


export default Camera;