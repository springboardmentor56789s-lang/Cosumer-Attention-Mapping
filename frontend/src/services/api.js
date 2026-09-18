import axios from "axios";

// =========================================================
// API BASE URL
// =========================================================

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";


// =========================================================
// AXIOS INSTANCE
// =========================================================

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


// =========================================================
// REQUEST INTERCEPTOR
// =========================================================

api.interceptors.request.use(
  (config) => {

    const token =
      localStorage.getItem("access_token");

    if (token) {

      config.headers = config.headers || {};

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


// =========================================================
// RESPONSE INTERCEPTOR
// =========================================================

api.interceptors.response.use(

  (response) => {
    return response;
  },

  (error) => {

    if (error?.response?.status === 401) {

      console.warn(
        "Unauthorized API request."
      );
    }

    return Promise.reject(error);
  }
);


// =========================================================
// ERROR MESSAGE
// =========================================================

export const getApiErrorMessage = (
  error,
  fallback = "Something went wrong."
) => {

  if (error?.response?.data?.detail) {

    const detail =
      error.response.data.detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail)) {

      return detail
        .map(
          (item) =>
            item?.msg ||
            String(item)
        )
        .join(", ");
    }

    return String(detail);
  }


  if (error?.response?.data?.message) {

    return error.response.data.message;
  }


  if (error?.message) {

    return error.message;
  }


  return fallback;
};


// =========================================================
// BACKWARD COMPATIBILITY
// =========================================================

export const getErrorMessage =
  getApiErrorMessage;


// =========================================================
// LOGIN
// =========================================================

export const loginUser = async (
  email,
  password
) => {

  const formData =
    new URLSearchParams();

  formData.append(
    "username",
    email
  );

  formData.append(
    "password",
    password
  );

  return api.post(
    "/login",
    formData,
    {
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
    }
  );
};


// =========================================================
// REGISTER
// =========================================================

export const registerUser = async (
  userData
) => {

  return api.post(
    "/register",
    userData
  );
};


// =========================================================
// USER PROFILE
// =========================================================

export const getProfile = async () => {

  return api.get(
    "/profile"
  );
};


// =========================================================
// ADMIN USER MANAGEMENT
// =========================================================

export const getUsers = async () => {

  return api.get(
    "/admin/users"
  );
};


export const getAdminUsers = async () => {

  return api.get(
    "/admin/users"
  );
};


// =========================================================
// STORES
// =========================================================

export const getStores = async () => {

  return api.get(
    "/stores"
  );
};


export const createStore = async (
  storeData
) => {

  return api.post(
    "/stores",
    storeData
  );
};


export const updateStore = async (
  storeId,
  storeData
) => {

  return api.put(
    `/stores/${storeId}`,
    storeData
  );
};


export const deleteStore = async (
  storeId
) => {

  return api.delete(
    `/stores/${storeId}`
  );
};


// =========================================================
// SHELVES
// =========================================================

export const getShelves = async () => {

  return api.get(
    "/shelves"
  );
};


export const createShelf = async (
  shelfData
) => {

  return api.post(
    "/shelves",
    shelfData
  );
};


export const updateShelf = async (
  shelfId,
  shelfData
) => {

  return api.put(
    `/shelves/${shelfId}`,
    shelfData
  );
};


export const deleteShelf = async (
  shelfId
) => {

  return api.delete(
    `/shelves/${shelfId}`
  );
};


// =========================================================
// PRODUCTS
// =========================================================

export const getProducts = async () => {

  return api.get(
    "/products"
  );
};


export const createProduct = async (
  productData
) => {

  return api.post(
    "/products",
    productData
  );
};


export const updateProduct = async (
  productId,
  productData
) => {

  return api.put(
    `/products/${productId}`,
    productData
  );
};


export const deleteProduct = async (
  productId
) => {

  return api.delete(
    `/products/${productId}`
  );
};


// =========================================================
// CAMERAS
// =========================================================

export const getCameras = async () => {

  return api.get(
    "/cameras"
  );
};


export const getCamera = async (
  cameraId
) => {

  return api.get(
    `/cameras/${cameraId}`
  );
};


export const createCamera = async (
  cameraData
) => {

  return api.post(
    "/cameras",
    cameraData
  );
};


export const updateCamera = async (
  cameraId,
  cameraData
) => {

  return api.put(
    `/cameras/${cameraId}`,
    cameraData
  );
};


export const deleteCamera = async (
  cameraId
) => {

  return api.delete(
    `/cameras/${cameraId}`
  );
};


// =========================================================
// VIDEOS
// =========================================================

export const getVideos = async () => {

  return api.get(
    "/videos"
  );
};


// =========================================================
// UPLOAD VIDEO
// =========================================================

export const uploadVideo = async (
  formData
) => {

  return api.post(
    "/upload-video",
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );
};


// =========================================================
// UPDATE VIDEO
// =========================================================

export const updateVideo = async (
  videoId,
  videoData
) => {

  return api.put(
    `/videos/${videoId}`,
    videoData
  );
};


// =========================================================
// DELETE VIDEO
// =========================================================

export const deleteVideo = async (
  videoId
) => {

  return api.delete(
    `/videos/${videoId}`
  );
};


// =========================================================
// ANALYTICS
// =========================================================

export const getAnalytics = async () => {

  return api.get(
    "/analytics"
  );
};


// =========================================================
// ANALYZE VIDEO
// =========================================================

export const analyzeVideo = async (
  videoId
) => {

  return api.post(
    `/analytics/analyze/${videoId}`
  );
};


// =========================================================
// SINGLE VIDEO ANALYTICS
// =========================================================

export const getVideoAnalytics = async (
  videoId
) => {

  return api.get(
    `/analytics/video/${videoId}`
  );
};


// =========================================================
// DETECTION FRAMES
// =========================================================

export const getDetectionFrames = async (
  videoId
) => {

  return api.get(
    `/analytics/detection-frames/${videoId}`
  );
};


// =========================================================
// DETECTION FRAME
// =========================================================

export const getDetectionFrameUrl = (
  videoId,
  filename
) => {

  if (!videoId || !filename) {
    return "";
  }

  return (
    `${API_BASE_URL}` +
    `/analytics/detection-frame/` +
    `${videoId}/${encodeURIComponent(filename)}`
  );
};


// =========================================================
// HEATMAP URL
// =========================================================

export const getHeatmapUrl = (
  heatmapPath
) => {

  if (!heatmapPath) {
    return "";
  }


  if (
    heatmapPath.startsWith("http://") ||
    heatmapPath.startsWith("https://")
  ) {

    return heatmapPath;
  }


  if (!heatmapPath.startsWith("/")) {

    heatmapPath =
      "/" + heatmapPath;
  }


  return (
    `${API_BASE_URL}${heatmapPath}`
  );
};


// =========================================================
// LATEST ANALYSIS
// =========================================================

export const getLatestAnalysis = () => {

  try {

    const savedAnalysis =
      localStorage.getItem(
        "latest_analysis"
      );

    if (!savedAnalysis) {
      return null;
    }

    return JSON.parse(
      savedAnalysis
    );

  } catch (error) {

    console.error(
      "Unable to read latest analysis:",
      error
    );

    return null;
  }
};


// =========================================================
// LATEST HEATMAP
// =========================================================

export const getLatestHeatmapUrl = () => {

  const analysis =
    getLatestAnalysis();

  if (!analysis) {
    return "";
  }


  const result =
    analysis?.analytics ||
    analysis?.result ||
    analysis;


  const heatmapPath =
    result?.heatmap ||
    analysis?.heatmap ||
    "";


  return getHeatmapUrl(
    heatmapPath
  );
};


// =========================================================
// SAVE LATEST ANALYSIS
// =========================================================

export const saveLatestAnalysis = (
  analysis
) => {

  try {

    localStorage.setItem(
      "latest_analysis",
      JSON.stringify(analysis)
    );

    return true;

  } catch (error) {

    console.error(
      "Unable to save latest analysis:",
      error
    );

    return false;
  }
};


// =========================================================
// NOTIFICATIONS
// =========================================================


// GET ALL NOTIFICATIONS

export const getNotifications = async () => {

  return api.get(
    "/notifications/"
  );
};


// GET UNREAD NOTIFICATION COUNT

export const getUnreadNotificationCount =
  async () => {

    return api.get(
      "/notifications/unread/count"
    );

  };


// MARK SINGLE NOTIFICATION AS READ

export const markNotificationAsRead =
  async (
    notificationId
  ) => {

    return api.put(
      `/notifications/${notificationId}/read`
    );

  };


// MARK ALL NOTIFICATIONS AS READ

export const markAllNotificationsAsRead =
  async () => {

    return api.put(
      "/notifications/read/all"
    );

  };


// DELETE NOTIFICATION

export const deleteNotification =
  async (
    notificationId
  ) => {

    return api.delete(
      `/notifications/${notificationId}`
    );

  };


// =========================================================
// LOGOUT
// =========================================================

export const logoutUser = () => {

  localStorage.removeItem(
    "access_token"
  );

  localStorage.removeItem(
    "token"
  );

  localStorage.removeItem(
    "user_email"
  );

  localStorage.removeItem(
    "user"
  );

  localStorage.removeItem(
    "role"
  );

  localStorage.removeItem(
    "latest_analysis"
  );
};


// =========================================================
// DEFAULT EXPORT
// =========================================================

export default api;