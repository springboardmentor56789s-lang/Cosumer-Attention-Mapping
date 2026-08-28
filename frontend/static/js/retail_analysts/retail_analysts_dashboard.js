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
    if (!canvas || typeof canvas.getContext !== "function") return null;
    return canvas.getContext("2d");
}

function destroyCanvasChart(canvas, chartInstance) {
    if (chartInstance && typeof chartInstance.destroy === "function") chartInstance.destroy();
    if (typeof Chart !== "undefined" && typeof Chart.getChart === "function" && canvas) {
        const existing = Chart.getChart(canvas);
        if (existing && existing !== chartInstance) existing.destroy();
    }
}

function setLiveStatus(message, failed = false) {
    const status = document.getElementById("liveStatus");
    if (!status) return;
    status.textContent = message;
    status.classList.remove("animate-pulse", "border-violet-100", "bg-violet-50", "text-violet-700", "border-red-100", "bg-red-50", "text-red-700");
    status.classList.add(failed ? "border-red-100" : "border-violet-100", failed ? "bg-red-50" : "bg-violet-50", failed ? "text-red-700" : "text-violet-700");
}

document.addEventListener("DOMContentLoaded", () => {
    const fullName = localStorage.getItem("full_name") || "Retail Analyst";
    const welcomeText = document.getElementById("welcomeText");
    if (fullName && welcomeText) welcomeText.textContent = `Welcome ${fullName.split(" ")[0]} 👋`;

    let chart;
    async function loadInsights() {
        setLiveStatus("Refreshing live insights…");
        const response = await fetch("/api/dashboard/live", { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) throw new Error("Unable to load live sales insights");
        const payload = await response.json();
        const summary = payload && typeof payload.summary === "object" ? payload.summary : {};
        const series = payload && typeof payload.series === "object" ? payload.series : {};

        setText("topProduct", summary.most_viewed_product || "No activity");
        setText("engagementScore", `${Number(summary.avg_attention_score || 0).toFixed(1)}%`);
        setText("avgDwellTime", `${Number(summary.avg_dwell_time_mins || 0).toFixed(1)} min`);
        setText("trackedCameras", Number(summary.total_cameras || 0).toLocaleString());
        setText("attentionZone", summary.most_viewed_shelf || "No activity");
        setText("conversionSignal", `${Number(summary.current_visitors || 0).toLocaleString()} current visitors`);

        const products = Array.isArray(series.product_performance) ? series.product_performance.filter((row) => row) : [];
        const insightTable = document.getElementById("insightTable");
        if (insightTable) {
            insightTable.innerHTML = products.map((row) => `<tr class="border-b hover:bg-slate-50"><td class="p-3 font-medium">${row.name}</td><td class="p-3">${Number(row.views || 0).toLocaleString()}</td><td class="p-3">${Number(row.attention || 0).toFixed(1)}%</td></tr>`).join("") || `<tr><td colspan="3" class="p-3">No product analytics yet</td></tr>`;
        }

        const chartCanvas = document.getElementById("attentionChart");
        const chartCtx = getCanvasContext("attentionChart");
        destroyCanvasChart(chartCanvas, chart);
        chart = null;
        const hourly = Array.isArray(series.hourly_visitors) ? series.hourly_visitors.filter((row) => row) : [];
        if (typeof Chart !== "undefined" && chartCtx) {
            chart = new Chart(chartCtx, { type: "line", data: { labels: hourly.map((row) => row.label), datasets: [{ label: "Visitors", data: hourly.map((row) => row.value), borderColor: "#8b5cf6", backgroundColor: "rgba(139, 92, 246, 0.15)", tension: 0.35, fill: true }] }, options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } } });
        }
        setLiveStatus(`Live data · Updated ${new Date().toLocaleTimeString()}`);
    }

    loadInsights().catch((error) => { console.error(error); setLiveStatus("Live insights unavailable — please sign in again.", true); });
    setInterval(() => loadInsights().catch((error) => { console.error(error); setLiveStatus("Live insights unavailable — please sign in again.", true); }), 30000);
});

document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("full_name");
    localStorage.removeItem("role");
    window.location.href = "/login";
});