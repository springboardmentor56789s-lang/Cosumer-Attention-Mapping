import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  FaUsers,
  FaShoppingBag,
  FaLayerGroup,
  FaBox,
  FaRoute,
  FaEye,
  FaBullhorn,
  FaChartLine,
  FaVideo,
  FaUserShield,
  FaServer,
  FaArrowRight,
  FaSyncAlt,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";

import {
  getAnalytics,
  getProfile,
  getStores,
  getProducts,
  getVideos,
  getCameras,
  getAdminUsers,
} from "../services/api";

import "../styles/Dashboard.css";


/* =========================================================
   ROLE LABELS
========================================================= */

const ROLE_LABELS = {

  "store manager":
    "Store Manager",

  "retail analyst":
    "Retail Analyst",

  "marketing manager":
    "Marketing Manager",

  administrator:
    "Administrator",

  admin:
    "Administrator",

};


/* =========================================================
   NORMALIZE ROLE
========================================================= */

const normalizeRole = (role) => {

  const value =
    String(role || "")
      .trim()
      .toLowerCase();

  return (
    ROLE_LABELS[value] ||
    "Store Manager"
  );

};


/* =========================================================
   SAFE NUMBER
========================================================= */

const number = (value) => {

  const n = Number(value);

  return Number.isFinite(n)
    ? n
    : 0;

};


/* =========================================================
   CLEAN LABEL
========================================================= */

const cleanLabel = (value) =>

  String(value || "")
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (c) => c.toUpperCase()
    );


/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard() {


  /* =====================================================
     STATES
  ===================================================== */

  const [analysis, setAnalysis] =
    useState(null);


  const [profile, setProfile] =
    useState(null);


  const [counts, setCounts] =
    useState({

      stores: 0,

      products: 0,

      videos: 0,

      cameras: 0,

      users: 0,

    });


  const [adminUsers, setAdminUsers] =
    useState([]);


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState("");


  /* =====================================================
     LOAD DASHBOARD
  ===================================================== */

  const loadDashboard =
    async () => {

      try {

        setLoading(true);

        setError("");


        /* =============================================
           EXISTING API REQUESTS
        ============================================= */

        const requests = [

          getProfile(),

          getAnalytics(),

          getStores(),

          getProducts(),

          getVideos(),

          getCameras(),

        ];


        const results =
          await Promise.allSettled(
            requests
          );


        const [

          profileResult,

          analyticsResult,

          storesResult,

          productsResult,

          videosResult,

          camerasResult,

        ] = results;


        /* =============================================
           PROFILE
        ============================================= */

        const user =
          profileResult.status ===
          "fulfilled"

            ? profileResult.value?.data

            : null;


        setProfile(
          user || null
        );


        /* =============================================
           ANALYTICS
        ============================================= */

        const documents =

          analyticsResult.status ===
          "fulfilled"

            ? analyticsResult.value?.data

            : [];


        if (
          Array.isArray(documents) &&
          documents.length
        ) {

          setAnalysis(

            documents[0]?.result ||

            documents[0]?.analytics ||

            documents[0]

          );

        } else {

          setAnalysis(null);

        }


        /* =============================================
           PLATFORM COUNTS
        ============================================= */

        setCounts(
          (prev) => ({

            ...prev,


            stores:

              Array.isArray(
                storesResult.value?.data
              )

                ? storesResult.value.data.length

                : 0,


            products:

              Array.isArray(
                productsResult.value?.data
              )

                ? productsResult.value.data.length

                : 0,


            videos:

              Array.isArray(
                videosResult.value?.data
              )

                ? videosResult.value.data.length

                : 0,


            cameras:

              Array.isArray(
                camerasResult.value?.data
              )

                ? camerasResult.value.data.length

                : 0,

          })
        );


        /* =============================================
           ADMIN USERS
        ============================================= */

        if (

          user?.role &&

          normalizeRole(
            user.role
          ) === "Administrator"

        ) {

          try {

            const adminUsersResponse =
              await getAdminUsers();


            const list =
              adminUsersResponse?.data;


            setAdminUsers(

              Array.isArray(list)

                ? list

                : []

            );


            setCounts(

              (prev) => ({

                ...prev,


                users:

                  Array.isArray(list)

                    ? list.length

                    : 0,

              })

            );

          } catch (adminError) {

            console.warn(

              "Admin user list unavailable:",

              adminError

            );

          }

        }


      } catch (err) {

        console.error(

          "Dashboard loading error:",

          err

        );


        setError(

          err?.response?.data?.detail ||

          err?.message ||

          "Unable to load dashboard."

        );


      } finally {

        setLoading(false);

      }

    };


  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {

    loadDashboard();

  }, []);


  /* =====================================================
     USER ROLE
  ===================================================== */

  const role =

    normalizeRole(

      profile?.role ||

      localStorage.getItem(
        "user_role"
      )

    );


  /* =====================================================
     ANALYSIS DATA
  ===================================================== */

  const tracking =
    analysis?.tracking || {};


  const videoAnalysis =
    tracking?.video_analysis || {};


  const people =

    analysis?.people &&

    typeof analysis.people === "object" &&

    !Array.isArray(
      analysis.people
    )

      ? analysis.people

      : {};


  /* =====================================================
     TOTAL SHOPPERS
  ===================================================== */

  const totalShoppers =

    number(

      videoAnalysis?.unique_people_tracked ??

      Object.keys(
        people
      ).length

    );


  /* =====================================================
     PRODUCT PREFERENCES
  ===================================================== */

  const productPreferences =

    analysis?.product_preferences ||

    analysis?.product_preference_analysis ||

    {};


  const products =

    Array.isArray(
      productPreferences?.products
    )

      ? productPreferences.products

      : [];


  const topProduct =

    productPreferences?.most_viewed ||

    products[0]?.product ||

    "No product detected";


  /* =====================================================
     ZONE ANALYSIS
  ===================================================== */

  const zoneRows =

  useMemo(() => {

    const zones =

      analysis?.shelf_zone_analysis?.zones ||

      analysis?.shelf_zone_analysis ||

      {};

    if (

      !zones ||

      typeof zones !== "object" ||

      Array.isArray(zones)

    ) {

      return [];

    }

    return Object.entries(zones)

      .map(

        ([name, data]) => ({

          name,

          shoppers:

            number(

              data?.unique_shoppers ??

              data?.unique_people ??

              data?.shoppers_count ??

              data?.total_shoppers

            ),

        })

      )

      .sort(

        (a, b) =>

          b.shoppers -

          a.shoppers

      );

  }, [analysis]);

  /* =====================================================
     SHOPPING PATTERNS
  ===================================================== */

  const patterns =

    analysis?.shopping_patterns ||

    {};

  //const segments =

  //analysis?.consumer_segments ||

  //{};


  /* =====================================================
     JOURNEY ANALYTICS
  ===================================================== */

  const journey =

    analysis?.journey_analytics ||

    {};


  /* =====================================================
     GAZE DATA
  ===================================================== */

  const gaze =

    analysis?.gaze_summary ||

    {};


  /* =====================================================
     PRODUCT ATTRACTIVENESS
  ===================================================== */

  const attractiveness =

    analysis?.product_attractiveness ||

    {};


  const attractiveProducts =

    Array.isArray(
      attractiveness?.products
    )

      ? attractiveness.products

      : [];


  const topAttractive =
    attractiveProducts[0];


  /* =====================================================
     PATTERN COUNT
  ===================================================== */

  const getPatternCount = (
    source,
    key
  ) =>

    number(

      source?.[key] ??

      source?.[
        cleanLabel(key)
      ]?.count

    );


  /* =====================================================
     BEHAVIOR ITEMS
  ===================================================== */

  const behaviorItems = [

    [

      "Explorers",

      getPatternCount(
        patterns,
        "explorers"
      ),

    ],

    [

      "Quick Buyers",

      getPatternCount(
        patterns,
        "quick_buyers"
      ),

    ],

    [

      "Comparison Shoppers",

      getPatternCount(
        patterns,
        "comparison_shoppers"
      ),

    ],

    [

      "Impulse Buyers",

      getPatternCount(
        patterns,
        "impulse_buyers"
      ),

    ],

  ];


  /* =====================================================
     ATTENTION SCORE
  ===================================================== */

  const attentionScore =

    number(

      analysis?.attention_score ??

      analysis?.attention?.score

    );


  /* =====================================================
     AVERAGE DWELL
  ===================================================== */

  const avgDwell =

    number(

      analysis?.behavior_summary
        ?.average_dwell_time_seconds ??

      analysis?.dwell_analysis
        ?.average_dwell_time_seconds ??

      videoAnalysis
        ?.average_dwell_time_seconds

    );


  /* =====================================================
     CONVERSION
  ===================================================== */

  const conversionAvailable =

    Boolean(

      analysis?.conversion_metrics ||

      analysis?.purchase_conversion_rate

    );


  /* =====================================================
     STATUS
  ===================================================== */

  const latestStatus =

    analysis

      ? "Analysis available"

      : "Waiting for analysis";


  /* =====================================================
     RENDER METRIC
  ===================================================== */

  const renderMetric = (

    icon,

    label,

    value,

    description,

    className = ""

  ) => (

    <div
      className={`role-metric ${className}`}
    >

      <div className="role-metric-icon">

        {icon}

      </div>


      <div>

        <span>

          {label}

        </span>


        <strong>

          {value}

        </strong>


        <small>

          {description}

        </small>

      </div>

    </div>

  );


  /* =====================================================
     UNAVAILABLE MESSAGE
  ===================================================== */

  const renderUnavailable = (

    title,

    description

  ) => (

    <div className="unavailable-box">

      <FaExclamationCircle />


      <div>

        <strong>

          {title}

        </strong>


        <span>

          {description}

        </span>

      </div>

    </div>

  );


  /* =====================================================
     STORE MANAGER DASHBOARD
  ===================================================== */

  const StoreManagerDashboard =
    () => (

      <>


        {/* KPI */}

        <section className="role-kpi-grid">


          {renderMetric(

            <FaUsers />,

            "Store Traffic",

            totalShoppers,

            "Unique shoppers in latest analysis",

            "cyan"

          )}


          {renderMetric(

            <FaBox />,

            "Product Engagement",

            products.length,

            "Detected product categories",

            "orange"

          )}


          {renderMetric(

            <FaLayerGroup />,

            "Shelf Performance",

            zoneRows.filter(
              (z) => z.shoppers > 0
            ).length,

            "Active shopper zones",

            "green"

          )}


          {renderMetric(

            <FaChartLine />,

            "Conversion Metrics",

            conversionAvailable
              ? "Available"
              : "N/A",

            conversionAvailable
              ? "Transaction-linked metric"
              : "Requires POS / transaction data",

            "purple"

          )}


        </section>


        {/* TRAFFIC + SHELF */}

        <div className="role-two-column">


          <section className="dashboard-card">


            <div className="section-heading">

              <div>

                <span className="section-eyebrow">

                  STORE TRAFFIC

                </span>


                <h2>

                  Traffic Analytics

                </h2>


                <p>

                  Latest shopper activity
                  across the store.

                </p>

              </div>


              <div className="section-icon">

                <FaUsers />

              </div>

            </div>


            <div className="big-stat">

              <strong>

                {totalShoppers}

              </strong>


              <span>

                unique shoppers detected

              </span>

            </div>


            <div className="mini-stat-row">


              <div>

                <span>

                  Latest video

                </span>


                <strong>

                  {analysis?.filename ||
                    "No video analyzed"}

                </strong>

              </div>


              <div>

                <span>

                  Tracked videos

                </span>


                <strong>

                  {counts.videos}

                </strong>

              </div>


            </div>


          </section>


          <section className="dashboard-card">


            <div className="section-heading">

              <div>

                <span className="section-eyebrow">

                  SHELF PERFORMANCE

                </span>


                <h2>

                  Top Store Zones

                </h2>


                <p>

                  Zones with the highest
                  shopper activity.

                </p>

              </div>


              <div className="section-icon green-icon">

                <FaLayerGroup />

              </div>

            </div>


            <div className="compact-list">


              {zoneRows
                .slice(0, 5)
                .map(
                  (z, i) => (

                    <div
                      className="compact-row"
                      key={z.name}
                    >

                      <span>

                        {i + 1}.
                        {" "}
                        {cleanLabel(
                          z.name
                        )}

                      </span>


                      <strong>

                        {z.shoppers}

                      </strong>

                    </div>

                  )
                )}


              {!zoneRows.length && (

                <div className="no-data">

                  No zone analysis available.

                </div>

              )}


            </div>


          </section>


        </div>


        {/* PRODUCT ENGAGEMENT */}

        <section className="dashboard-card">


          <div className="section-heading">

            <div>

              <span className="section-eyebrow">

                PRODUCT ENGAGEMENT

              </span>


              <h2>

                Product Engagement Insights

              </h2>


              <p>

                Products receiving the most
                observed attention.

              </p>

            </div>


            <div className="section-icon orange-icon">

              <FaShoppingBag />

            </div>

          </div>


          <div className="product-dashboard-grid">


            {products
              .slice(0, 6)
              .map(
                (p, i) => (

                  <div
                    className="product-dashboard-card"
                    key={`${p.product}-${i}`}
                  >

                    <span>

                      #{i + 1}

                    </span>


                    <strong>

                      {cleanLabel(
                        p.product
                      )}

                    </strong>


                    <small>

                      {number(
                        p.detections
                      )}

                      {" "}
                      detections
                      {" · "}

                      {number(
                        p.unique_shoppers_near_product
                      )}

                      {" "}
                      nearby shoppers

                    </small>

                  </div>

                )
              )}


            {!products.length && (

              <div className="no-data">

                No product engagement data
                available.

              </div>

            )}


          </div>


        </section>


        {/* CONVERSION */}

        <section className="dashboard-card">


          <div className="section-heading">

            <div>

              <span className="section-eyebrow">

                CONVERSION

              </span>


              <h2>

                Conversion Metrics

              </h2>

            </div>


            <div className="section-icon purple-icon">

              <FaChartLine />

            </div>

          </div>


          {conversionAvailable ? (

            <div className="big-stat">

              <strong>

                {number(
                  analysis?.purchase_conversion_rate
                ).toFixed(1)}

                %

              </strong>


              <span>

                purchase conversion

              </span>

            </div>

          ) : (

            renderUnavailable(

              "Conversion data is not available yet",

              "Video analytics alone cannot verify purchases. Connect POS or transaction data to calculate conversion metrics."

            )

          )}


        </section>


      </>

    );


  /* =====================================================
     RETAIL ANALYST DASHBOARD
  ===================================================== */

  const RetailAnalystDashboard =
    () => (

      <>


        {/* KPI */}

        <section className="role-kpi-grid">


          {renderMetric(

            <FaUsers />,

            "Consumers",

            totalShoppers,

            "Unique shoppers analyzed",

            "cyan"

          )}


          {renderMetric(

            <FaShoppingBag />,

            "Shopping Patterns",

            behaviorItems.reduce(

              (sum, [, value]) =>
                sum + value,

              0

            ),

            "Classified behavior observations",

            "orange"

          )}


          {renderMetric(

            <FaRoute />,

            "Journeys",

            number(
              journey?.total_journeys ??
              totalShoppers
            ),

            "Customer journeys analyzed",

            "purple"

          )}


          {renderMetric(

            <FaBox />,

            "Top Product",

            cleanLabel(topProduct),

            "Most frequently detected",

            "green"

          )}


        </section>


        <div className="role-two-column">


          {/* BEHAVIOR */}

          <section className="dashboard-card">


            <div className="section-heading">

              <div>

                <span className="section-eyebrow">

                  BEHAVIOR INTELLIGENCE

                </span>


                <h2>

                  Consumer Behavior Analytics

                </h2>


                <p>

                  Observed shopping patterns
                  and segments.

                </p>

              </div>


              <div className="section-icon purple-icon">

                <FaShoppingBag />

              </div>

            </div>


            <div className="behavior-grid">


              {behaviorItems.map(

                ([name, value]) => (

                  <div
                    className="behavior-tile"
                    key={name}
                  >

                    <strong>

                      {value}

                    </strong>


                    <span>

                      {name}

                    </span>

                  </div>

                )

              )}


            </div>


          </section>


          {/* ATTENTION */}

          <section className="dashboard-card">


            <div className="section-heading">

              <div>

                <span className="section-eyebrow">

                  ATTENTION

                </span>


                <h2>

                  Attention Analysis

                </h2>


                <p>

                  Available attention indicators
                  from the latest video.

                </p>

              </div>


              <div className="section-icon cyan-icon">

                <FaEye />

              </div>

            </div>


            <div className="attention-summary">


              <div>

                <span>

                  Attention score

                </span>


                <strong>

                  {attentionScore

                    ? `${attentionScore.toFixed(1)}%`

                    : "N/A"}

                </strong>

              </div>


              <div>

                <span>

                  Average dwell

                </span>


                <strong>

                  {avgDwell

                    ? `${avgDwell.toFixed(2)} sec`

                    : "N/A"}

                </strong>

              </div>


              <div>

                <span>

                  Center gaze

                </span>


                <strong>

                  {number(
                    gaze?.CENTER_percentage
                  )}

                  %

                </strong>

              </div>


            </div>


            <Link
              className="dashboard-action"
              to="/heatmaps"
            >

              Open Attention Heatmaps

              <FaArrowRight />

            </Link>


          </section>


        </div>


        {/* PRODUCT + JOURNEY */}

        <div className="role-two-column">


          <section className="dashboard-card">


            <div className="section-heading">

              <div>

                <span className="section-eyebrow">

                  PRODUCT INTELLIGENCE

                </span>


                <h2>

                  Product Attractiveness

                </h2>


                <p>

                  Weighted product
                  attractiveness insights.

                </p>

              </div>


              <div className="section-icon orange-icon">

                <FaBox />

              </div>

            </div>


            {topAttractive ? (

              <div className="attractiveness-highlight">

                <strong>

                  {cleanLabel(
                    topAttractive.product
                  )}

                </strong>


                <span>

                  {number(
                    topAttractive.score
                  ).toFixed(1)}

                  {" / 100"}

                </span>


                <small>

                  Attention 35% ·
                  Interaction 25% ·
                  Pickup 20% ·
                  Repeat 20%

                </small>

              </div>

            ) : (

              <div className="no-data">

                No product attractiveness
                data available.

              </div>

            )}


          </section>


          <section className="dashboard-card">


            <div className="section-heading">

              <div>

                <span className="section-eyebrow">

                  CUSTOMER JOURNEY

                </span>


                <h2>

                  Journey Analytics

                </h2>


                <p>

                  Movement and journey-level
                  observations.

                </p>

              </div>


              <div className="section-icon purple-icon">

                <FaRoute />

              </div>

            </div>


            <div className="compact-list">


              {Object.entries(
                journey || {}
              )

                .filter(
                  ([, value]) =>
                    typeof value !== "object"
                )

                .slice(0, 5)

                .map(

                  ([key, value]) => (

                    <div
                      className="compact-row"
                      key={key}
                    >

                      <span>

                        {cleanLabel(key)}

                      </span>


                      <strong>

                        {String(value)}

                      </strong>

                    </div>

                  )

                )}


              {!Object.keys(
                journey || {}
              ).length && (

                <div className="no-data">

                  No journey analytics available.

                </div>

              )}


            </div>


          </section>


        </div>


      </>

    );


  /* =====================================================
     MARKETING MANAGER DASHBOARD
  ===================================================== */

  const MarketingManagerDashboard =
    () => (

      <>


        {/* KPI */}

        <section className="role-kpi-grid">


          {renderMetric(

            <FaBox />,

            "Product Visibility",

            products.length,

            "Detected product categories",

            "orange"

          )}


          {renderMetric(

            <FaUsers />,

            "Customer Engagement",

            totalShoppers,

            "Unique shoppers observed",

            "cyan"

          )}


          {renderMetric(

            <FaBullhorn />,

            "Campaign Effectiveness",

            "N/A",

            "Requires campaign data",

            "purple"

          )}


          {renderMetric(

            <FaChartLine />,

            "Promotional Performance",

            "N/A",

            "Requires promotion / sales data",

            "green"

          )}


        </section>


        <div className="role-two-column">


          {/* PRODUCT VISIBILITY */}

          <section className="dashboard-card">


            <div className="section-heading">

              <div>

                <span className="section-eyebrow">

                  PRODUCT VISIBILITY

                </span>


                <h2>

                  Product Visibility Analytics

                </h2>


                <p>

                  Which detected products
                  receive the most attention.

                </p>

              </div>


              <div className="section-icon orange-icon">

                <FaEye />

              </div>

            </div>


            <div className="big-stat">

              <strong>

                {cleanLabel(topProduct)}

              </strong>


              <span>

                top detected product

              </span>

            </div>


            <div className="compact-list">


              {products
                .slice(0, 5)
                .map(

                  (product) => (

                    <div
                      className="compact-row"
                      key={product.product}
                    >

                      <span>

                        {cleanLabel(
                          product.product
                        )}

                      </span>


                      <strong>

                        {number(
                          product.detections
                        )}

                        {" views"}

                      </strong>

                    </div>

                  )

                )}


            </div>


          </section>


          {/* CUSTOMER ENGAGEMENT */}

          <section className="dashboard-card">


            <div className="section-heading">

              <div>

                <span className="section-eyebrow">

                  CUSTOMER ENGAGEMENT

                </span>


                <h2>

                  Engagement Metrics

                </h2>


                <p>

                  Video-derived shopper
                  engagement indicators.

                </p>

              </div>


              <div className="section-icon cyan-icon">

                <FaUsers />

              </div>

            </div>


            <div className="attention-summary">


              <div>

                <span>

                  Shoppers

                </span>


                <strong>

                  {totalShoppers}

                </strong>

              </div>


              <div>

                <span>

                  Avg dwell

                </span>


                <strong>

                  {avgDwell

                    ? `${avgDwell.toFixed(2)}s`

                    : "N/A"}

                </strong>

              </div>


              <div>

                <span>

                  Products

                </span>


                <strong>

                  {products.length}

                </strong>

              </div>


            </div>


            {renderUnavailable(

              "Campaign-specific metrics are not connected",

              "Campaign effectiveness and promotional performance require campaign, promotion or sales-event data."

            )}


          </section>


        </div>


      </>

    );


  /* =====================================================
     ADMIN DASHBOARD
  ===================================================== */

  const AdminDashboard =
    () => (

      <>


        {/* KPI */}

        <section className="role-kpi-grid">


          {renderMetric(

            <FaUserShield />,

            "Users",

            counts.users,

            "Registered platform users",

            "cyan"

          )}


          {renderMetric(

            <FaStoreIcon />,

            "Stores",

            counts.stores,

            "Managed stores",

            "orange"

          )}


          {renderMetric(

            <FaVideo />,

            "Cameras",

            counts.cameras,

            "Configured cameras",

            "purple"

          )}


          {renderMetric(

            <FaServer />,

            "System",

            "Online",

            "Dashboard and API session active",

            "green"

          )}


        </section>


        <div className="role-two-column">


          {/* USERS */}

          <section className="dashboard-card">


            <div className="section-heading">

              <div>

                <span className="section-eyebrow">

                  USER MANAGEMENT

                </span>


                <h2>

                  Platform Users

                </h2>


                <p>

                  Current registered users
                  by role.

                </p>

              </div>


              <div className="section-icon cyan-icon">

                <FaUserShield />

              </div>

            </div>


            {adminUsers.length ? (

              <div className="compact-list">


                {adminUsers
                  .slice(0, 8)
                  .map(

                    (user) => (

                      <div
                        className="compact-row"
                        key={user.email}
                      >

                        <span>

                          {user.name ||
                            user.email}

                        </span>


                        <strong>

                          {normalizeRole(
                            user.role
                          )}

                        </strong>

                      </div>

                    )

                  )}


              </div>

            ) : (

              renderUnavailable(

                "User management data is unavailable",

                "The administrator user-list endpoint is not available or returned no users."

              )

            )}


          </section>


          {/* PLATFORM */}

          <section className="dashboard-card">


            <div className="section-heading">

              <div>

                <span className="section-eyebrow">

                  PLATFORM ANALYTICS

                </span>


                <h2>

                  System Overview

                </h2>


                <p>

                  Operational counts
                  from the platform.

                </p>

              </div>


              <div className="section-icon green-icon">

                <FaServer />

              </div>

            </div>


            <div className="admin-count-grid">


              <div>

                <strong>

                  {counts.stores}

                </strong>


                <span>

                  Stores

                </span>

              </div>


              <div>

                <strong>

                  {counts.products}

                </strong>


                <span>

                  Products

                </span>

              </div>


              <div>

                <strong>

                  {counts.videos}

                </strong>


                <span>

                  Videos

                </span>

              </div>


              <div>

                <strong>

                  {counts.cameras}

                </strong>


                <span>

                  Cameras

                </span>

              </div>


            </div>


          </section>


        </div>


        {/* CAMERA MANAGEMENT */}

        <section className="dashboard-card">


          <div className="section-heading">

            <div>

              <span className="section-eyebrow">

                CAMERA MANAGEMENT

              </span>


              <h2>

                Camera & System Monitoring

              </h2>


              <p>

                Manage configured cameras
                and monitor the latest
                platform activity.

              </p>

            </div>


            <div className="section-icon purple-icon">

              <FaVideo />

            </div>

          </div>


          <div className="monitor-grid">


            <div className="monitor-item">


              <FaCheckCircle />


              <div>

                <strong>

                  {counts.cameras}
                  {" "}
                  cameras configured

                </strong>


                <span>

                  Open Cameras to manage
                  devices and analysis settings.

                </span>

              </div>


              <Link to="/cameras">

                Manage Cameras

                <FaArrowRight />

              </Link>


            </div>


            <div className="monitor-item">


              <FaCheckCircle />


              <div>

                <strong>

                  {latestStatus}

                </strong>


                <span>

                  {analysis?.filename ||

                    "No analysis has been run yet."}

                </span>

              </div>


              <Link to="/analytics">

                Open Analytics

                <FaArrowRight />

              </Link>


            </div>


          </div>


        </section>


      </>

    );


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {

    return (

      <div className="dashboard-page">

        <div className="dashboard-loading">

          <div className="dashboard-spinner"></div>


          <p>

            Loading role-based dashboard...

          </p>

        </div>

      </div>

    );

  }


  /* =====================================================
     MAIN RENDER
  ===================================================== */

  return (

    <div className="dashboard-page">


      {/* HEADER */}

      <header className="dashboard-header">


        <div>

          <span className="dashboard-eyebrow">

            CONSUMER ATTENTION ANALYTICS

          </span>


          <h1>

            {role}
            {" "}
            Dashboard

          </h1>


          <p>

            Welcome

            {profile?.name

              ? `, ${profile.name}`

              : ""}

            .

            {" "}

            Your dashboard is focused on
            the insights and operational
            metrics relevant to your role.

          </p>


        </div>


        <button
          className="dashboard-refresh"
          onClick={loadDashboard}
        >

          <FaSyncAlt />

          Refresh

        </button>


      </header>


      {/* ERROR */}

      {error && (

        <div className="dashboard-alert">

          {error}

        </div>

      )}


      {/* ROLE STRIP */}

      <div className="dashboard-role-strip">

        <span className="role-dot"></span>


        <strong>

          {role}

        </strong>


        <span>

          Role-based retail intelligence

        </span>

      </div>


      {/* EMPTY STATE */}

      {!analysis && (

        <div className="dashboard-empty-state">


          <FaShoppingBag />


          <h2>

            No Analysis Available

          </h2>


          <p>

            Analyze a retail video to
            populate shopper intelligence.
            Platform and role information
            can still be managed from
            the navigation.

          </p>


          <Link
            className="dashboard-action"
            to="/analytics"
          >

            Open Analytics

            <FaArrowRight />

          </Link>


        </div>

      )}


      {/* =============================================
          ROLE DASHBOARDS
      ============================================= */}

      {role === "Store Manager" && (

        <StoreManagerDashboard />

      )}


      {role === "Retail Analyst" && (

        <RetailAnalystDashboard />

      )}


      {role === "Marketing Manager" && (

        <MarketingManagerDashboard />

      )}


      {role === "Administrator" && (

        <AdminDashboard />

      )}


      {/* STATUS */}

      <div className="dashboard-status">

        <span className="status-indicator"></span>


        <span>

          {latestStatus}

        </span>

      </div>


    </div>

  );

}


/* =========================================================
   STORE ICON
========================================================= */

function FaStoreIcon() {

  return (

    <FaLayerGroup />

  );

}


export default Dashboard;