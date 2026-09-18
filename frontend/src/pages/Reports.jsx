import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import "../styles/Reports.css";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

function Reports() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH ANALYTICS
  // =====================================================

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
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

      if (
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        setAnalytics(response.data[0]);
      } else {
        setAnalytics(null);
      }

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
        "Unable to load reports."
      );

    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // PREPARE REPORT DATA
  // =====================================================

  const getReportData = () => {
    if (!analytics) return [];

    const result = analytics.result || {};

    const tracking = result.tracking || {};

    const video =
      tracking.video_analysis || {};

    const dwell =
      tracking.dwell_analysis || {};

    const entryExit =
      tracking.entry_exit || {};

    const people =
      result.people || {};

    const shoppingPatterns =
      result.shopping_patterns || {};

    const consumerSegments =
      result.consumer_segments || {};

    const productPreferences =
      result.product_preferences || {};

    return [

      // =========================
      // VIDEO
      // =========================

      {
        Category: "Video",
        Metric: "Video Name",
        Value:
          analytics.filename ||
          result.filename ||
          "Unknown",
      },

      {
        Category: "Video",
        Metric: "Frames Processed",
        Value:
          video.frames_processed || 0,
      },

      {
        Category: "Video",
        Metric: "FPS",
        Value:
          video.fps || 0,
      },

      {
        Category: "Video",
        Metric: "Resolution",
        Value:
          `${video.video_width || 0} × ${
            video.video_height || 0
          }`,
      },


      // =========================
      // SHOPPERS
      // =========================

      {
        Category: "Shoppers",
        Metric: "Unique Shoppers",
        Value:
          video.unique_people_tracked ||
          Object.keys(people).length,
      },

      {
        Category: "Shoppers",
        Metric: "Entries",
        Value:
          entryExit.entry_count || 0,
      },

      {
        Category: "Shoppers",
        Metric: "Exits",
        Value:
          entryExit.exit_count || 0,
      },

      {
        Category: "Shoppers",
        Metric: "Current Shoppers",
        Value:
          entryExit.current_shoppers || 0,
      },


      // =========================
      // DWELL TIME
      // =========================

      {
        Category: "Dwell Time",
        Metric: "Average Dwell Time",
        Value:
          `${Number(
            dwell.average_dwell_time_seconds || 0
          ).toFixed(2)} sec`,
      },

      {
        Category: "Dwell Time",
        Metric: "Maximum Dwell Time",
        Value:
          `${Number(
            dwell.max_dwell_time_seconds || 0
          ).toFixed(2)} sec`,
      },

      {
        Category: "Dwell Time",
        Metric: "Minimum Dwell Time",
        Value:
          `${Number(
            dwell.min_dwell_time_seconds || 0
          ).toFixed(2)} sec`,
      },


      // =========================
      // SHOPPING PATTERNS
      // =========================

      {
        Category: "Shopping Pattern",
        Metric: "Browsing",
        Value:
          shoppingPatterns.browsing || 0,
      },

      {
        Category: "Shopping Pattern",
        Metric: "Comparison",
        Value:
          shoppingPatterns.comparison || 0,
      },

      {
        Category: "Shopping Pattern",
        Metric: "Quick Purchase",
        Value:
          shoppingPatterns.quick_purchase || 0,
      },


      // =========================
      // CONSUMER SEGMENTS
      // =========================

      {
        Category: "Consumer Segment",
        Metric: "Explorers",
        Value:
          consumerSegments.explorers || 0,
      },

      {
        Category: "Consumer Segment",
        Metric: "Quick Buyers",
        Value:
          consumerSegments.quick_buyers || 0,
      },

      {
        Category: "Consumer Segment",
        Metric: "Comparison Shoppers",
        Value:
          consumerSegments.comparison_shoppers || 0,
      },

      {
        Category: "Consumer Segment",
        Metric: "Impulse Buyers",
        Value:
          consumerSegments.impulse_buyers || 0,
      },

      {
        Category: "Consumer Segment",
        Metric: "Brand Loyal Customers",
        Value:
          consumerSegments.brand_loyal_customers || 0,
      },


      // =========================
      // PRODUCTS
      // =========================

      {
        Category: "Product",
        Metric: "Most Viewed Product",
        Value:
          productPreferences.most_viewed ||
          "Not Available",
      },

      {
        Category: "Product",
        Metric: "Highest Attention Product",
        Value:
          productPreferences.highest_attention ||
          "Not Available",
      },

    ];
  };


  // =====================================================
  // DOWNLOAD CSV
  // =====================================================

  const downloadCSV = () => {
    const reportData = getReportData();

    if (reportData.length === 0) {
      alert("No report data available.");
      return;
    }

    const headers = [
      "Category",
      "Metric",
      "Value",
    ];

    const csvRows = [];

    csvRows.push(headers.join(","));

    reportData.forEach((row) => {

      const values = [
        row.Category,
        row.Metric,
        row.Value,
      ];

      csvRows.push(
        values
          .map((value) =>
            `"${String(value).replace(/"/g, '""')}"`
          )
          .join(",")
      );

    });

    const csvContent =
      csvRows.join("\n");

    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "consumer_analytics_report.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };


  // =====================================================
  // DOWNLOAD EXCEL
  // =====================================================

  const downloadExcel = () => {

    const reportData =
      getReportData();

    if (reportData.length === 0) {
      alert("No report data available.");
      return;
    }

    const worksheet =
      XLSX.utils.json_to_sheet(
        reportData
      );

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Analytics Report"
    );

    XLSX.writeFile(
      workbook,
      "consumer_analytics_report.xlsx"
    );
  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="reports-page">

        <div className="reports-loading">

          Loading reports...

        </div>

      </div>

    );

  }


  // =====================================================
  // ERROR
  // =====================================================

  if (error) {

    return (

      <div className="reports-page">

        <div className="reports-error">

          <h2>
            Unable to Load Reports
          </h2>

          <p>
            {error}
          </p>

          <button
            onClick={fetchReports}
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

      <div className="reports-page">

        <div className="reports-header">

          <div>

            <span className="page-label">

              REPORT CENTER

            </span>

            <h1>

              Analytics Reports

            </h1>

            <p>

              Download and manage your consumer analytics reports.

            </p>

          </div>

        </div>


        <div className="empty-report">

          <div className="empty-icon">

            📊

          </div>

          <h2>

            No Reports Available

          </h2>

          <p>

            Analyze a video first to generate a report.

          </p>

        </div>

      </div>

    );

  }


  const reportData =
    getReportData();


  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (

    <div className="reports-page">


      {/* =============================================
          HEADER
      ============================================== */}

      <div className="reports-header">

        <div>

          <span className="page-label">

            REPORT CENTER

          </span>

          <h1>

            Analytics Reports

          </h1>

          <p>

            View, download and manage AI-generated
            consumer analytics reports.

          </p>

        </div>


        <button
          className="refresh-report-btn"
          onClick={fetchReports}
        >

          ↻ Refresh

        </button>

      </div>


      {/* =============================================
          REPORT SUMMARY
      ============================================== */}

      <div className="report-summary-card">

        <div>

          <span>

            ANALYZED VIDEO

          </span>

          <h3>

            {analytics.filename ||
              analytics.result?.filename ||
              "Unknown Video"}

          </h3>

        </div>


        <div className="report-status">

          <span className="status-dot"></span>

          Report Ready

        </div>

      </div>


      {/* =============================================
          DOWNLOAD CARDS
      ============================================== */}

      <div className="download-grid">


        {/* CSV */}

        <div className="download-card">

          <div className="download-icon">

            📄

          </div>

          <h2>

            CSV Report

          </h2>

          <p>

            Download analytics data in CSV format.
            Perfect for quick viewing and data analysis.

          </p>

          <button
            className="csv-button"
            onClick={downloadCSV}
          >

            ⬇ Download CSV

          </button>

        </div>


        {/* EXCEL */}

        <div className="download-card">

          <div className="download-icon">

            📊

          </div>

          <h2>

            Excel Report

          </h2>

          <p>

            Download a structured Excel report
            for business analysis and presentations.

          </p>

          <button
            className="excel-button"
            onClick={downloadExcel}
          >

            ⬇ Download Excel

          </button>

        </div>


      </div>


      {/* =============================================
          REPORT DATA
      ============================================== */}

      <div className="report-table-card">


        <div className="table-header">

          <div>

            <span className="section-label">

              REPORT PREVIEW

            </span>

            <h2>

              Analytics Summary

            </h2>

          </div>


          <span className="records-count">

            {reportData.length} records

          </span>

        </div>


        <div className="report-table-wrapper">

          <table className="report-table">

            <thead>

              <tr>

                <th>

                  Category

                </th>

                <th>

                  Metric

                </th>

                <th>

                  Value

                </th>

              </tr>

            </thead>


            <tbody>

              {reportData.map(
                (row, index) => (

                  <tr key={index}>

                    <td>

                      <span className="category-badge">

                        {row.Category}

                      </span>

                    </td>

                    <td>

                      {row.Metric}

                    </td>

                    <td>

                      <strong>

                        {row.Value}

                      </strong>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>


    </div>

  );

}

export default Reports;