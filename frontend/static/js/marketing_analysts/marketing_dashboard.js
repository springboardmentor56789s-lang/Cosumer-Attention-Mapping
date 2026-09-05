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

function setLiveStatus(message, failed = false) {
    const status = document.getElementById("liveStatus");
    if (!status) return;
    status.textContent = message;
    status.classList.remove("animate-pulse", "border-amber-100", "bg-amber-50", "text-amber-700", "border-red-100", "bg-red-50", "text-red-700");
    status.classList.add(failed ? "border-red-100" : "border-amber-100", failed ? "bg-red-50" : "bg-amber-50", failed ? "text-red-700" : "text-amber-700");
}

document.addEventListener("DOMContentLoaded", () => {
    const fullName = localStorage.getItem("full_name") || "Marketing Analyst";
    if (fullName) {
        const firstName = fullName.split(" ")[0];
        document.getElementById("welcomeText").textContent = `Welcome ${firstName} 👋`;
    }

    let chart;
    async function loadInsights() {
        setLiveStatus("Refreshing live insights…");
        const response = await fetch("/api/dashboard/live", { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) throw new Error("Unable to load live marketing insights");
        const payload = await response.json();
        const summary = payload && payload.summary && typeof payload.summary === "object" ? payload.summary : {};
        const series = payload && payload.series && typeof payload.series === "object" ? payload.series : {};
        const storeTraffic = Array.isArray(series.traffic_by_store)
            ? series.traffic_by_store.filter((row) => row)
            : [];

        setText("peakAudience", summary.most_viewed_shelf || "No shelf data");
        setText("engagementLift", `${Number(summary.avg_attention_score || 0).toFixed(1)}%`);
        setText("campaignReach", Number(summary.todays_visitors || 0).toLocaleString());
        setText("conversionTrend", Number(summary.current_visitors || 0).toLocaleString());
        setText("bestSegment", summary.most_viewed_product || "No product data");
        setText("recommendation", `Prioritize ${summary.most_viewed_product || "top products"} visibility`);

        const campaignTable = document.getElementById("campaignTable");
        if (campaignTable) campaignTable.innerHTML = storeTraffic.map((row) => `
            <tr class="border-b hover:bg-slate-50">
                <td class="p-3 font-medium">${row.name}</td>
                <td class="p-3">${Number(row.visitors || 0).toLocaleString()} visitors</td>
                <td class="p-3">${Number(summary.avg_attention_score || 0).toFixed(1)}% avg attention</td>
            </tr>
        `).join("") || `<tr><td colspan="3" class="p-3">No store analytics yet</td></tr>`;

        const chartCanvas = document.getElementById("trendChart");
        const chartCtx = getCanvasContext("trendChart");
        destroyCanvasChart(chartCanvas, chart);
        chart = null;
        const monthly = Array.isArray(series.monthly_visitors)
            ? series.monthly_visitors.filter((row) => row)
            : [];
        if (typeof Chart !== "undefined" && chartCtx) {
            chart = new Chart(chartCtx, {
                type: "bar",
                data: {
                    labels: monthly.map((row) => row.label),
                    datasets: [{
                        label: "Visitors",
                        data: monthly.map((row) => row.value),
                        backgroundColor: "#f59e0b",
                        borderRadius: 8
                    }]
                },
                options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
            });
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
    document.cookie = "access_token=; Max-Age=0; Path=/; SameSite=Lax";
    window.location.href = "/login";
});
