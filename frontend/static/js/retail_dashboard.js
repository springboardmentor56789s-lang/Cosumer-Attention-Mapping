const token = localStorage.getItem("access_token");

if (!token) {
    window.location.href = "/login";
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

document.addEventListener("DOMContentLoaded", () => {
    const fullName = localStorage.getItem("full_name") || "Retail Analyst";
    if (fullName) {
        const firstName = fullName.split(" ")[0];
        document.getElementById("welcomeText").textContent = `Welcome ${firstName} 👋`;
    }

    let chart;
    const currency = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
    async function loadInsights() {
        const response = await fetch("/api/dashboard/superstore-insights", { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) throw new Error("Unable to load live sales insights");
        const data = await response.json();
        const summary = data.summary;
        setText("topProduct", summary.top_product);
        setText("engagementScore", `${Number(summary.profit_margin).toFixed(1)}%`);
        setText("avgDwellTime", currency(summary.average_order_value));
        setText("trackedCameras", Number(summary.total_orders).toLocaleString());
        setText("attentionZone", summary.top_region);
        setText("conversionSignal", currency(summary.total_profit));
        document.getElementById("insightTable").innerHTML = data.categories.map((row) => `<tr class="border-b hover:bg-slate-50"><td class="p-3 font-medium">${row.category}</td><td class="p-3">${currency(row.sales)}</td><td class="p-3">${currency(row.profit)}</td></tr>`).join("");
        if (chart) chart.destroy();
        chart = new Chart(document.getElementById("attentionChart"), { type: "line", data: { labels: data.monthly_sales.map((row) => row.month), datasets: [{ label: "Sales", data: data.monthly_sales.map((row) => row.sales), borderColor: "#8b5cf6", backgroundColor: "rgba(139, 92, 246, 0.15)", tension: 0.35, fill: true }] }, options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } } });
    }
    loadInsights().catch((error) => console.error(error));
    setInterval(() => loadInsights().catch((error) => console.error(error)), 30000);
});

document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("full_name");
    localStorage.removeItem("role");
    window.location.href = "/login";
});
