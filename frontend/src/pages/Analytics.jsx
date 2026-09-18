import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Analytics.css";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Video upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedVideoId, setUploadedVideoId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [analyzingVideo, setAnalyzingVideo] = useState(false);
  const [videoMessage, setVideoMessage] = useState("");
  const [videoError, setVideoError] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // =====================================================
  // FETCH ANALYTICS
  // =====================================================

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("Please login first.");
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/analytics`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;

      console.log("ANALYTICS API RESPONSE:", data);

      if (Array.isArray(data) && data.length > 0) {
        setAnalytics(data[0]);
      } else {
        setAnalytics(null);
      }

    } catch (err) {
      console.error("Analytics loading error:", err);

      setError(
        err.response?.data?.detail ||
        "Unable to load analytics."
      );

    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // VIDEO SELECT
  // =====================================================

  const handleVideoSelect = (event) => {
    const file = event.target.files?.[0] || null;

    setSelectedFile(file);
    setUploadedVideoId("");
    setVideoMessage("");
    setVideoError("");
  };


  // =====================================================
  // VIDEO UPLOAD
  // =====================================================

  const handleUploadVideo = async () => {

    if (!selectedFile) {
      setVideoError("Please select a video first.");
      return;
    }

    const allowedExtensions = [
      ".mp4",
      ".avi",
      ".mov",
      ".mkv",
      ".webm"
    ];

    const extension =
      selectedFile.name
        .substring(
          selectedFile.name.lastIndexOf(".")
        )
        .toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      setVideoError(
        "Unsupported format. Use MP4, AVI, MOV, MKV or WEBM."
      );
      return;
    }

    try {

      setUploading(true);

      setVideoMessage("");
      setVideoError("");

      const token =
        localStorage.getItem("access_token") ||
        localStorage.getItem("token") ||
        "";

      if (!token) {
        setVideoError("Please login first.");
        return;
      }

      const formData = new FormData();

      formData.append(
        "video",
        selectedFile
      );

      const response = await axios.post(
        `${API_BASE_URL}/upload-video`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const videoId =
        response.data?.video_id ||
        response.data?.id ||
        response.data?._id;

      if (!videoId) {
        throw new Error(
          "Video uploaded but no video ID returned."
        );
      }

      setUploadedVideoId(
        String(videoId)
      );

      setVideoMessage(
        "Video uploaded successfully. Click Analyze Video to start AI processing."
      );

    } catch (err) {

      console.error(
        "Video upload error:",
        err
      );

      setVideoError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Video upload failed."
      );

    } finally {

      setUploading(false);

    }
  };


  // =====================================================
  // ANALYZE VIDEO
  // =====================================================

  const handleAnalyzeVideo = async () => {

    if (!uploadedVideoId) {
      setVideoError(
        "Please upload a video before analysis."
      );
      return;
    }

    try {

      setAnalyzingVideo(true);

      setVideoMessage(
        "AI analysis is running. Please wait..."
      );

      setVideoError("");

      const token =
        localStorage.getItem("access_token") ||
        localStorage.getItem("token") ||
        "";

      if (!token) {
        setVideoError("Please login first.");
        return;
      }

      await axios.post(
        `${API_BASE_URL}/analytics/analyze/${uploadedVideoId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setVideoMessage(
        "Analysis completed successfully."
      );

      await fetchAnalytics();

    } catch (err) {

      console.error(
        "Video analysis error:",
        err
      );

      setVideoError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Video analysis failed."
      );

    } finally {

      setAnalyzingVideo(false);

    }
  };


  // =====================================================
  // VIDEO UPLOAD PANEL
  // =====================================================

  const renderVideoUploadPanel = () => (

    <div className="video-upload-card">

      <div className="video-upload-header">

        <div>

          <span className="section-label">
            VIDEO ANALYSIS
          </span>

          <h2>
            Upload & Analyze Video
          </h2>

          <p>
            Upload retail footage and generate
            AI-powered consumer analytics.
          </p>

        </div>


        <div className="video-upload-status">

          <span
            className={`status-dot ${
              analyzingVideo
                ? "processing"
                : ""
            }`}
          />

          {analyzingVideo
            ? "Processing"
            : uploadedVideoId
            ? "Ready"
            : "Waiting"}

        </div>

      </div>


      <div className="video-upload-controls">

        <label className="video-select-button">

          <input
            type="file"
            accept=".mp4,.avi,.mov,.mkv,.webm,video/*"
            onChange={handleVideoSelect}
            disabled={
              uploading ||
              analyzingVideo
            }
          />

          Choose Video

        </label>


        <div className="selected-file">

          {selectedFile
            ? selectedFile.name
            : "No video selected"}

        </div>


        <button
          className="upload-video-button"
          onClick={handleUploadVideo}
          disabled={
            !selectedFile ||
            uploading ||
            analyzingVideo
          }
        >

          {uploading
            ? "Uploading..."
            : "Upload Video"}

        </button>


        <button
          className="analyze-video-button"
          onClick={handleAnalyzeVideo}
          disabled={
            !uploadedVideoId ||
            uploading ||
            analyzingVideo
          }
        >

          {analyzingVideo
            ? "Analyzing..."
            : "Analyze Video"}

        </button>

      </div>


      {/* Processing Steps */}

      {analyzingVideo && (

        <div className="processing-steps">

          <div className="processing-step active">
            <span>1</span>
            Video Processing
          </div>

          <div className="processing-step active">
            <span>2</span>
            Shopper Tracking
          </div>

          <div className="processing-step active">
            <span>3</span>
            Behavior Analysis
          </div>

          <div className="processing-step active">
            <span>4</span>
            Generating Report
          </div>

        </div>

      )}


      {videoMessage && (

        <div className="video-message success">
          ✓ {videoMessage}
        </div>

      )}


      {videoError && (

        <div className="video-message error">
          ⚠ {videoError}
        </div>

      )}

    </div>
  );


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="analytics-page">

        <div className="analytics-loading">

          <div className="loading-content">

            <div className="loading-spinner"></div>

            <p>
              Loading AI analytics...
            </p>

          </div>

        </div>

      </div>

    );

  }


  // =====================================================
  // ERROR
  // =====================================================

  if (error) {

    return (

      <div className="analytics-page">

        <div className="analytics-error">

          <div className="error-icon">
            ⚠
          </div>

          <h3>
            Analytics Error
          </h3>

          <p>
            {error}
          </p>

          <button
            className="refresh-btn"
            onClick={fetchAnalytics}
          >
            Try Again
          </button>

        </div>

      </div>

    );

  }


  // =====================================================
  // NO DATA
  // =====================================================

  if (!analytics) {

    return (

      <div className="analytics-page">

        <div className="analytics-header">

          <div>

            <span className="page-label">
              RETAIL INTELLIGENCE
            </span>

            <h1>
              Consumer Analytics
            </h1>

            <p>
              AI-powered shopper behavior analysis
            </p>

          </div>


          <button
            className="refresh-btn"
            onClick={fetchAnalytics}
          >
            ↻ Refresh
          </button>

        </div>


        {renderVideoUploadPanel()}


        <div className="empty-analytics">

          <div className="empty-icon">
            📊
          </div>

          <h2>
            No Analytics Available
          </h2>

          <p>
            Upload a retail video and start AI
            analysis to generate your report.
          </p>

        </div>

      </div>

    );

  }


  // =====================================================
  // DATA
  // =====================================================

  const result = analytics.result || {};

  const tracking = result.tracking || {};

  const video =
    tracking.video_analysis || {};

  const dwell =
    tracking.dwell_analysis || {};

  const entryExit =
    tracking.entry_exit || {};

  const pathTracking =
    tracking.path_tracking || {};

  const gaze =
    tracking.gaze_analysis || {};

  const trackingVideo =
    tracking.tracking_video;


  const people =
    result.people || {};


  const behaviorSummary =
    result.behavior_summary || {};

  const shoppingPatterns =
    result.shopping_patterns || {};

  const consumerSegments =
    result.consumer_segments || {};

  const journeyAnalytics =
    result.journey_analytics || {};

  const gazeSummary =
    result.gaze_summary || {};


  const shelfZoneAnalysis =
    result.shelf_zone_analysis || {};

  const productAttractiveness =
    result.product_attractiveness || {};

  const attractivenessProducts =
    Array.isArray(
      productAttractiveness.products
    )
      ? productAttractiveness.products
      : [];


  const movementBehavior =
    behaviorSummary.movement_behavior ||
    result.movement_behavior ||
    {};


  const gazeDirections =
    gaze.gaze_directions ||
    gazeSummary.gaze_directions ||
    {};


  const knownGaze =
    Number(
      gaze.known_gaze_percentage ??
      gazeSummary.known_gaze_percentage ??
      0
    );


  const unknownGaze =
    Number(
      gaze.unknown_gaze_percentage ??
      gazeSummary.unknown_gaze_percentage ??
      0
    );


  const browsing =
    Number(
      shoppingPatterns.browsing || 0
    );

  const comparison =
    Number(
      shoppingPatterns.comparison || 0
    );

  const quickPurchase =
    Number(
      shoppingPatterns.quick_purchase || 0
    );


  const patternTotal =
    browsing +
    comparison +
    quickPurchase;


  // =====================================================
  // HELPERS
  // =====================================================

  const formatNumber = (value) => {

    const number = Number(value);

    if (Number.isNaN(number)) {
      return "0";
    }

    return number.toLocaleString();

  };


  const formatSeconds = (value) => {

    const number = Number(value);

    if (Number.isNaN(number)) {
      return "0 sec";
    }

    return `${number.toFixed(2)} sec`;

  };


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="analytics-page">


      {/* HEADER */}

      <div className="analytics-header">

        <div>

          <span className="page-label">
            RETAIL INTELLIGENCE
          </span>

          <h1>
            Consumer Analytics
          </h1>

          <p>
            AI-powered shopper behavior and
            attention intelligence
          </p>

        </div>


        <button
          className="refresh-btn"
          onClick={fetchAnalytics}
        >
          ↻ Refresh
        </button>

      </div>


      {renderVideoUploadPanel()}


      {/* VIDEO INFO */}

      <div className="video-info-card">

        <div>

          <span className="info-label">
            ANALYZED VIDEO
          </span>

          <h3>
            {analytics.filename ||
              result.filename ||
              "Unknown Video"}
          </h3>

        </div>


        <div className="video-info-right">

          <span>
            Frames
            <strong>
              {formatNumber(
                video.frames_processed
              )}
            </strong>
          </span>


          <span>
            FPS
            <strong>
              {video.fps || 0}
            </strong>
          </span>


          <span>
            Resolution
            <strong>
              {video.video_width || 0}
              ×
              {video.video_height || 0}
            </strong>
          </span>

        </div>

      </div>


      {/* KPI */}

      <div className="kpi-grid">


        <KPICard
          icon="👥"
          title="UNIQUE SHOPPERS"
          value={formatNumber(
            video.unique_people_tracked ??
            Object.keys(people).length
          )}
          description="People tracked"
        />


        <KPICard
          icon="🚪"
          title="ENTRIES"
          value={formatNumber(
            entryExit.entry_count
          )}
          description="Store entries"
        />


        <KPICard
          icon="🚶"
          title="CURRENT SHOPPERS"
          value={formatNumber(
            entryExit.current_shoppers
          )}
          description="Currently inside"
        />


        <KPICard
          icon="⏱"
          title="AVG DWELL TIME"
          value={formatSeconds(
            dwell.average_dwell_time_seconds
          )}
          description="Average shopper duration"
        />

      </div>


      <div className="kpi-grid">


        <KPICard
          icon="👁"
          title="KNOWN GAZE"
          value={`${knownGaze.toFixed(1)}%`}
          description="Reliable observations"
        />


        <KPICard
          icon="🛣"
          title="PATH POINTS"
          value={formatNumber(
            pathTracking.total_path_points
          )}
          description="Movement points"
        />


        <KPICard
          icon="📍"
          title="TRACKED JOURNEYS"
          value={formatNumber(
            pathTracking.people_with_paths
          )}
          description="People with paths"
        />


        <KPICard
          icon="🚪"
          title="EXITS"
          value={formatNumber(
            entryExit.exit_count
          )}
          description="Store exits"
        />

      </div>


      {/* MAIN GRID */}

      <div className="analytics-grid">


        {/* SHOPPING PATTERNS */}

        <div className="analytics-card">

          <CardHeader
            label="BEHAVIOR"
            title="Shopping Patterns"
          />

          <div className="pattern-chart">

            <PatternRow
              label="Browsing"
              value={browsing}
              total={patternTotal}
            />

            <PatternRow
              label="Comparison"
              value={comparison}
              total={patternTotal}
            />

            <PatternRow
              label="Quick Purchase"
              value={quickPurchase}
              total={patternTotal}
            />

          </div>

        </div>


        {/* SEGMENTS */}

        <div className="analytics-card">

          <CardHeader
            label="SEGMENTATION"
            title="Consumer Segments"
          />

          <div className="segment-list">

            <SegmentRow
              label="Explorers"
              value={consumerSegments.explorers || 0}
            />

            <SegmentRow
              label="Quick Buyers"
              value={consumerSegments.quick_buyers || 0}
            />

            <SegmentRow
              label="Comparison Shoppers"
              value={
                consumerSegments.comparison_shoppers || 0
              }
            />

            <SegmentRow
              label="Impulse Buyers"
              value={
                consumerSegments.impulse_buyers || 0
              }
            />

            <SegmentRow
              label="Brand Loyal"
              value={
                consumerSegments.brand_loyal_customers || 0
              }
            />

          </div>

        </div>


        {/* DWELL */}

        <div className="analytics-card">

          <CardHeader
            label="TIME ANALYSIS"
            title="Dwell Time"
          />

          <div className="dwell-grid">

            <StatBox
              label="Average"
              value={formatSeconds(
                dwell.average_dwell_time_seconds
              )}
            />

            <StatBox
              label="Maximum"
              value={formatSeconds(
                dwell.max_dwell_time_seconds
              )}
            />

            <StatBox
              label="Minimum"
              value={formatSeconds(
                dwell.min_dwell_time_seconds
              )}
            />

          </div>

        </div>


        {/* GAZE */}

        <div className="analytics-card">

          <CardHeader
            label="ATTENTION"
            title="Gaze Analysis"
          />

          <div className="gaze-grid">

            <GazeItem
              label="LEFT"
              value={gazeDirections.LEFT}
            />

            <GazeItem
              label="RIGHT"
              value={gazeDirections.RIGHT}
            />

            <GazeItem
              label="CENTER"
              value={gazeDirections.CENTER}
            />

            <GazeItem
              label="UP"
              value={gazeDirections.UP}
            />

            <GazeItem
              label="DOWN"
              value={gazeDirections.DOWN}
            />

            <GazeItem
              label="UNKNOWN"
              value={gazeDirections.UNKNOWN}
            />

          </div>


          <div className="gaze-summary">

            <div>

              <span>
                Known
              </span>

              <strong>
                {knownGaze.toFixed(1)}%
              </strong>

            </div>


            <div>

              <span>
                Unknown
              </span>

              <strong>
                {unknownGaze.toFixed(1)}%
              </strong>

            </div>

          </div>

        </div>

      </div>


      {/* MOVEMENT + JOURNEY */}

      <div className="analytics-grid">


        <div className="analytics-card">

          <CardHeader
            label="MOVEMENT"
            title="Movement Behavior"
          />

          <div className="movement-stats">

            <StatBox
              label="Shelves Visited"
              value={
                movementBehavior.shelves_visited ||
                shelfZoneAnalysis.zone_count ||
                0
              }
            />

            <StatBox
              label="Average Dwell"
              value={formatSeconds(
                movementBehavior.average_dwell_time_seconds ??
                dwell.average_dwell_time_seconds
              )}
            />

            <StatBox
              label="Average Distance"
              value={`${movementBehavior.average_distance_meters || 0} m`}
            />

          </div>

        </div>


        <div className="analytics-card">

          <CardHeader
            label="JOURNEY"
            title="Shopper Journey"
          />

          <div className="journey-list">

            <JourneyItem
              label="Entry"
              value={
                journeyAnalytics.entry ||
                "Not available"
              }
            />

            <JourneyItem
              label="First Area"
              value={
                journeyAnalytics.first_area ||
                "Not available"
              }
            />

            <JourneyItem
              label="Most Visited"
              value={
                journeyAnalytics.most_visited_area ||
                "Not available"
              }
            />

            <JourneyItem
              label="Exit"
              value={
                journeyAnalytics.exit ||
                "Not available"
              }
            />

          </div>

        </div>

      </div>


      {/* PRODUCT ATTRACTIVENESS */}

      <div className="analytics-card full-width-card">

        <div className="card-header">

          <div>

            <span className="section-label">
              PRODUCT INTELLIGENCE
            </span>

            <h2>
              Product Attractiveness
            </h2>

          </div>


          <span className="people-count">

            Top:
            {" "}
            {productAttractiveness.top_product ||
              "Unavailable"}

          </span>

        </div>


        {attractivenessProducts.length > 0 ? (

          <>

            <div className="attractiveness-summary">

              <div className="product-box">

                <span>
                  TOP PRODUCT
                </span>

                <strong>
                  {productAttractiveness.top_product}
                </strong>

              </div>


              <div className="product-box">

                <span>
                  ATTRACTIVENESS SCORE
                </span>

                <strong>
                  {productAttractiveness.top_product_score != null
                    ? `${Number(
                        productAttractiveness.top_product_score
                      ).toFixed(1)}/100`
                    : "Unavailable"}
                </strong>

              </div>


              <div className="product-box">

                <span>
                  STATUS
                </span>

                <strong>
                  {productAttractiveness.status ||
                    "Unavailable"}
                </strong>

              </div>

            </div>


            <div className="people-table-wrapper">

              <table className="people-table">

                <thead>

                  <tr>

                    <th>Product</th>
                    <th>Score</th>
                    <th>Attractiveness</th>
                    <th>Attention</th>
                    <th>Interaction</th>
                    <th>Pickup</th>
                    <th>Repeat</th>

                  </tr>

                </thead>


                <tbody>

                  {attractivenessProducts.map(
                    (item, index) => (

                      <tr
                        key={`${item?.product}-${index}`}
                      >

                        <td>
                          <strong>
                            {item?.product ||
                              "Unknown"}
                          </strong>
                        </td>


                        <td>
                          {item?.score != null
                            ? `${Number(
                                item.score
                              ).toFixed(1)}/100`
                            : "—"}
                        </td>


                        <td>

                          <span className="movement-badge stationary">

                            {item?.label ||
                              "Unavailable"}

                          </span>

                        </td>


                        <td>
                          {item?.attention_duration_seconds != null
                            ? `${Number(
                                item.attention_duration_seconds
                              ).toFixed(1)} sec`
                            : "—"}
                        </td>


                        <td>
                          {item?.interaction_frequency_score != null
                            ? `${Number(
                                item.interaction_frequency_score
                              ).toFixed(1)}%`
                            : "—"}
                        </td>


                        <td>
                          {item?.pickup_rate != null
                            ? `${Number(
                                item.pickup_rate
                              ).toFixed(1)}%`
                            : "—"}
                        </td>


                        <td>
                          {item?.repeat_engagement_rate != null
                            ? `${Number(
                                item.repeat_engagement_rate
                              ).toFixed(1)}%`
                            : "—"}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>


            <div className="scoring-model">

              <strong>
                AI Scoring Model
              </strong>

              <span>
                Attention Duration 35%
              </span>

              <span>
                Interaction Frequency 25%
              </span>

              <span>
                Pickup Rate 20%
              </span>

              <span>
                Repeat Engagement 20%
              </span>

            </div>

          </>

        ) : (

          <div className="media-empty">

            Product attractiveness data is
            not available for this analysis.

          </div>

        )}

      </div>


      {/* INDIVIDUAL SHOPPERS */}

      <div className="analytics-card full-width-card">

        <div className="card-header">

          <div>

            <span className="section-label">
              TRACKING
            </span>

            <h2>
              Individual Shoppers
            </h2>

          </div>


          <span className="people-count">

            {Object.keys(people).length}
            {" "}
            tracked

          </span>

        </div>


        <div className="people-table-wrapper">

          <table className="people-table">

            <thead>

              <tr>

                <th>ID</th>
                <th>Frames</th>
                <th>Dwell Time</th>
                <th>Movement</th>
                <th>Path Points</th>
                <th>Distance</th>
                <th>Gaze</th>

              </tr>

            </thead>


            <tbody>

              {Object.entries(people).map(
                ([personId, person]) => (

                  <tr key={personId}>

                    <td>

                      <span className="person-id">
                        #{personId}
                      </span>

                    </td>


                    <td>
                      {formatNumber(
                        person.frames_seen
                      )}
                    </td>


                    <td>
                      {formatSeconds(
                        person.dwell_time_seconds
                      )}
                    </td>


                    <td>

                      <span
                        className={`movement-badge ${
                          person.movement_status === "MOVING"
                            ? "moving"
                            : "stationary"
                        }`}
                      >

                        {person.movement_status ||
                          "UNKNOWN"}

                      </span>

                    </td>


                    <td>
                      {formatNumber(
                        person.path_point_count
                      )}
                    </td>


                    <td>
                      {person.path_distance_pixels ||
                        0}
                      {" "}
                      px
                    </td>


                    <td>
                      {person.gaze?.gaze ||
                        "UNKNOWN"}
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* TRACKING VIDEO */}

      <div className="analytics-card media-card">

        <CardHeader
          label="VISUALIZATION"
          title="AI Shopper Tracking Video"
        />

        {trackingVideo ? (

          <video
            className="tracking-video"
            controls
            src={
              trackingVideo.startsWith("http")
                ? trackingVideo
                : `${API_BASE_URL}${trackingVideo}`
            }
          />

        ) : (

          <div className="media-empty">

            Tracking video not available.

          </div>

        )}

      </div>


    </div>

  );

}


// =====================================================
// KPI CARD
// =====================================================

function KPICard({
  icon,
  title,
  value,
  description
}) {

  return (

    <div className="kpi-card">

      <div className="kpi-icon">
        {icon}
      </div>

      <div>

        <span className="kpi-title">
          {title}
        </span>

        <h2>
          {value}
        </h2>

        <p>
          {description}
        </p>

      </div>

    </div>

  );

}


// =====================================================
// CARD HEADER
// =====================================================

function CardHeader({
  label,
  title
}) {

  return (

    <div className="card-header">

      <div>

        <span className="section-label">
          {label}
        </span>

        <h2>
          {title}
        </h2>

      </div>

    </div>

  );

}


// =====================================================
// PATTERN ROW
// =====================================================

function PatternRow({
  label,
  value,
  total
}) {

  const percentage =
    total > 0
      ? (Number(value) / total) * 100
      : 0;

  return (

    <div className="pattern-row">

      <div className="pattern-name">
        {label}
      </div>

      <div className="pattern-bar-container">

        <div
          className="pattern-bar"
          style={{
            width: `${percentage}%`
          }}
        />

      </div>

      <strong>
        {value}
      </strong>

    </div>

  );

}


// =====================================================
// SEGMENT ROW
// =====================================================

function SegmentRow({
  label,
  value
}) {

  const percentage =
    getSafePercentage(value);

  return (

    <div className="segment-row">

      <div className="segment-label">
        {label}
      </div>

      <div className="segment-progress">

        <div
          className="segment-progress-fill"
          style={{
            width: `${percentage}%`
          }}
        />

      </div>

      <strong>
        {value || 0}%
      </strong>

    </div>

  );

}


// =====================================================
// STAT BOX
// =====================================================

function StatBox({
  label,
  value
}) {

  return (

    <div className="stat-box">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>

  );

}


// =====================================================
// GAZE ITEM
// =====================================================

function GazeItem({
  label,
  value
}) {

  return (

    <div className="gaze-item">

      <span>
        {label}
      </span>

      <strong>
        {value || 0}
      </strong>

    </div>

  );

}


// =====================================================
// JOURNEY ITEM
// =====================================================

function JourneyItem({
  label,
  value
}) {

  return (

    <div className="journey-item">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>

  );

}


// =====================================================
// SAFE PERCENTAGE
// =====================================================

function getSafePercentage(value) {

  const number =
    Number(value);

  if (Number.isNaN(number)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      100,
      number
    )
  );

}


export default Analytics;