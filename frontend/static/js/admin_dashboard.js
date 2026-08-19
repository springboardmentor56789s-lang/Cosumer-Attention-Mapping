const token = localStorage.getItem("access_token");

if (!token) {
    window.location.href = "/login";
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function getCanvasContext(id) {
    const canvas = document.getElementById(id);
    if (!canvas || typeof canvas.getContext !== "function") {
        return null;
    }
    return canvas.getContext("2d");
}

function destroyCanvasChart(canvas, chartInstance) {
    if (chartInstance && typeof chartInstance.destroy === "function") chartInstance.destroy();
    if (typeof Chart !== "undefined" && typeof Chart.getChart === "function" && canvas) {
        const existing = Chart.getChart(canvas);
        if (existing && existing !== chartInstance) existing.destroy();
    }
}

let visitorChart;
let cameraChart;

function buildCharts(summary, series) {
    if (typeof Chart === "undefined") {
        return;
    }

    summary = summary && typeof summary === "object" ? summary : {};
    series = series && typeof series === "object" ? series : {};
    const visitorCanvas = document.getElementById("visitorChart");
    const cameraCanvas = document.getElementById("cameraChart");
    const visitorCtx = getCanvasContext("visitorChart");
    const cameraCtx = getCanvasContext("cameraChart");

    destroyCanvasChart(visitorCanvas, visitorChart);
    visitorChart = null;
    destroyCanvasChart(cameraCanvas, cameraChart);
    cameraChart = null;

    if (visitorCtx) {
        const hourlyVisitors = Array.isArray(series.hourly_visitors)
                ? series.hourly_visitors.filter((row) => row)
                : [];
            const labels = hourlyVisitors.map((row) => row.label);
            const values = hourlyVisitors.map((row) => row.value);
        visitorChart = new Chart(visitorCtx, {
            type: "line",
            data: {
                labels,
                datasets: [{
                    label: "Visitors",
                    data: values,
                    borderColor: "#3b82f6",
                    backgroundColor: "rgba(59, 130, 246, 0.2)",
                    tension: 0.35,
                    fill: true,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });
    }

    if (cameraCtx) {
        cameraChart = new Chart(cameraCtx, {
            type: "doughnut",
            data: {
                labels: ["Online", "Offline"],
                datasets: [{
                    data: [summary.camera_status?.online || 0, summary.camera_status?.offline || 0],
                    backgroundColor: ["#22c55e", "#f59e0b"],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: "bottom" } }
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const fullName = localStorage.getItem("full_name");

    if (fullName) {
        const firstName = fullName.split(" ")[0];
        document.getElementById("welcomeText").textContent = `Welcome ${firstName} 👋`;
    }

    try {
        const response = await fetch("/api/dashboard/live", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to load dashboard data");
        }

        const payload = await response.json();
        const data = payload.summary || {};
        const series = payload.series || {};

        setText("totalUsers", data.total_users ?? "N/A");
        setText("totalStores", data.total_stores ?? "N/A");
        setText("totalCameras", data.total_cameras ?? "N/A");
        setText("totalProducts", data.total_products ?? "N/A");
        setText("totalShelves", data.total_shelves ?? "N/A");
        setText("totalVisitors", data.todays_visitors ?? "N/A");
        setText("averageDwellTime", `${data.avg_dwell_time_mins ?? 0} min`);
        setText("mostViewedProduct", data.most_viewed_product || "N/A");
        setText("activeAiCameras", data.active_ai_cameras || 0);
        setText("engagementScore", data.avg_attention_score ? `${data.avg_attention_score}%` : "N/A");
        setText("attentionFocus", data.attention_focus || "Medium");

        buildCharts(data, series);

    } catch (error) {
        console.error(error);
        setText("totalUsers", "N/A");
        setText("totalStores", "N/A");
        setText("totalCameras", "N/A");
        setText("totalProducts", "N/A");
        setText("totalShelves", "N/A");
        setText("totalVisitors", "N/A");
        setText("averageDwellTime", "N/A");
        setText("mostViewedProduct", "N/A");
    }

    try {
        const usersResponse = await fetch("/api/users", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!usersResponse.ok) {
            throw new Error("Failed to load users");
        }

        const usersPayload = await usersResponse.json();
        const users = Array.isArray(usersPayload) ? usersPayload.filter((user) => user && typeof user === "object") : [];
        const table = document.getElementById("userTable");
        if (!table) return;
        table.innerHTML = "";

        users.slice(0, 5).forEach((user) => {
            table.innerHTML += `
                <tr class="border-b hover:bg-gray-50">
                    <td class="p-3">${user.full_name || user.name || "N/A"}</td>
                    <td class="p-3">${user.email || "N/A"}</td>
                    <td class="p-3">${user.role || "N/A"}</td>
                    <td class="p-3">${user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error(error);
        document.getElementById("userTable").innerHTML = `
            <tr>
                <td colspan="4" class="p-3 text-center text-sm text-slate-500">No user data available</td>
            </tr>
        `;
    }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("full_name");
    localStorage.removeItem("role");
    window.location.href = "/login";
});
