const token = localStorage.getItem("access_token");

if (!token) {
    window.location.href = "/login";
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

document.addEventListener("DOMContentLoaded", () => {
    const fullName = localStorage.getItem("full_name") || "Marketing Analyst";
    if (fullName) {
        const firstName = fullName.split(" ")[0];
        document.getElementById("welcomeText").textContent = `Welcome ${firstName} 👋`;
    }

    let chart;
    const currency = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
    async function loadInsights() {
        const response = await fetch("/api/dashboard/superstore-insights", { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) throw new Error("Unable to load live marketing insights");
        const data = await response.json();
        const summary = data.summary;
        setText("peakAudience", summary.top_segment);
        setText("engagementLift", `${Number(summary.profit_margin).toFixed(1)}%`);
        setText("campaignReach", Number(summary.total_customers).toLocaleString());
        setText("conversionTrend", Number(summary.total_orders).toLocaleString());
        setText("bestSegment", summary.top_segment);
        setText("recommendation", `Prioritize ${data.categories[0]?.category || "top"} campaigns`);
        document.getElementById("campaignTable").innerHTML = data.segments.map((row) => `<tr class="border-b hover:bg-slate-50"><td class="p-3 font-medium">${row.segment}</td><td class="p-3">${Number(row.customers).toLocaleString()} customers</td><td class="p-3">${currency(row.sales)}</td></tr>`).join("");
        if (chart) chart.destroy();
        chart = new Chart(document.getElementById("trendChart"), { type: "bar", data: { labels: data.monthly_sales.map((row) => row.month), datasets: [{ label: "Sales", data: data.monthly_sales.map((row) => row.sales), backgroundColor: "#f59e0b", borderRadius: 8 }] }, options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } } });
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
