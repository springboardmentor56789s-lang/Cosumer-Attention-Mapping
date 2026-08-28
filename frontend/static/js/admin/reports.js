const token = localStorage.getItem("access_token");
const REPORTS_API = "/api/production/reports";
const EXPORT_API = "/api/production/reports/export";

if (!token) {
	window.location.href = "/login";
}

let reports = [];
let selectedReportType = null;
let reportPrimaryChart = null;
let reportSecondaryChart = null;
const REPORT_CATALOG = [
	["consumer_attention", "Consumer Attention Report"],
	["product_engagement", "Product Engagement Report"],
	["shelf_performance", "Shelf Performance Report"],
	["conversion", "Conversion Report"],
	["marketing_effectiveness", "Marketing Effectiveness Report"],
].map(([report_type, report_name]) => ({ id: report_type, report_type, report_name }));

function authHeaders(extra = {}) {
	return {
		Authorization: `Bearer ${token}`,
		"Content-Type": "application/json",
		...extra,
	};
}

async function request(url, options = {}) {
	const response = await fetch(url, {
		headers: authHeaders(options.headers || {}),
		...options,
	});

	if (!response.ok) {
		const payload = await response.json().catch(() => ({}));
		throw new Error(payload.detail || "Request failed");
	}

	if (response.status === 204) {
		return null;
	}

	return response.json();
}

function openModal(id) {
	const modal = document.getElementById(id);
	if (modal) {
		modal.classList.add("open");
		modal.setAttribute("aria-hidden", "false");
	}
}

function closeModal(id) {
	const modal = document.getElementById(id);
	if (modal) {
		modal.classList.remove("open");
		modal.setAttribute("aria-hidden", "true");
	}
}

function formatDate(value) {
	if (!value) {
		return "-";
	}
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return "-";
	}
	return date.toLocaleString();
}

function reportTypeLabel(type) {
	return String(type || "-").replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function applyFilters() {
	return reports.filter((report) => report && typeof report === "object");
}

function renderTable() {
	const filtered = applyFilters().filter((report) => report && report.id);
	const body = document.getElementById("reportTableBody");

	if (!filtered.length) {
		body.innerHTML = '<tr><td colspan="2" class="empty-state">No reports available.</td></tr>';
		return;
	}

	body.innerHTML = filtered.map((report) => {
		return `
			<tr>
				<td>${report.report_name || "-"}</td>
				<td>
					<div class="row-actions">
						<button class="btn btn-muted" data-action="view" data-id="${report.id}">View</button>
						<button class="btn btn-secondary" data-action="export" data-id="${report.id}">Export</button>
					</div>
				</td>
			</tr>
		`;
	}).join("");
}

async function loadReports() {
	reports = REPORT_CATALOG;
	renderTable();
	try {
		const response = await request(REPORTS_API);
		reports = Array.isArray(response) && response.length
			? response.filter((report) => report && typeof report === "object")
			: REPORT_CATALOG;
		renderTable();
	} catch (error) {
		console.error("Unable to refresh the report catalog:", error);
	}
}

function destroyReportCharts() {
	[reportPrimaryChart, reportSecondaryChart].forEach((chart) => {
		if (chart && typeof chart.destroy === "function") chart.destroy();
	});
	reportPrimaryChart = null;
	reportSecondaryChart = null;
	if (typeof Chart !== "undefined" && typeof Chart.getChart === "function") {
		["reportPrimaryChart", "reportSecondaryChart"].forEach((id) => {
			const canvas = document.getElementById(id);
			const chart = canvas && Chart.getChart(canvas);
			if (chart) chart.destroy();
		});
	}
}

function renderReportCharts(data) {
	destroyReportCharts();
	if (typeof Chart === "undefined") return;
	const charts = data && data.charts && typeof data.charts === "object" ? data.charts : {};
	const labels = Array.isArray(charts.labels) && charts.labels.length ? charts.labels : ["No data"];
	const datasets = Array.isArray(charts.datasets) ? charts.datasets : [];
	const primaryCanvas = document.getElementById("reportPrimaryChart");
	const secondaryCanvas = document.getElementById("reportSecondaryChart");
	if (primaryCanvas && datasets[0]) {
		reportPrimaryChart = new Chart(primaryCanvas.getContext("2d"), {
			type: datasets[0].kind || "bar", data: { labels, datasets: [{ label: datasets[0].label, data: datasets[0].data || [], backgroundColor: "rgba(32,94,219,.35)", borderColor: "#205edb", borderWidth: 2 }] },
			options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
		});
	}
	if (secondaryCanvas && datasets[1]) {
		reportSecondaryChart = new Chart(secondaryCanvas.getContext("2d"), {
			type: datasets[1].kind || "bar", data: { labels, datasets: [{ label: datasets[1].label, data: datasets[1].data || [], backgroundColor: "rgba(42,156,107,.45)", borderColor: "#2a9c6b", borderWidth: 2 }] },
			options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
		});
	}
}

function renderViewModal(report) {
    const container = document.getElementById("viewReportContent");

    if (!container || !report) {
        return;
    }

	const rows = Array.isArray(report.data?.rows) ? report.data.rows : [];
	if (!rows.length) {
		container.innerHTML = '<div class="empty-state">No analyzed data is available for this report.</div>';
		return;
	}

	const columns = Object.keys(rows[0]);
	container.innerHTML = `
		<div class="report-table-container">
			<table class="report-data-table">
				<thead><tr>${columns.map((column) => `<th>${formatColumnName(column)}</th>`).join("")}</tr></thead>
				<tbody>${rows.map((row) => `<tr>${columns.map((column) => `<td>${row[column] ?? "-"}</td>`).join("")}</tr>`).join("")}</tbody>
			</table>
		</div>
	`;
}

function formatColumnName(column) {
    return String(column)
        .replace(/_/g, " ")
        .replace(/\b\w/g, char => char.toUpperCase());
}

function selectedStoreId() {
	const value = document.getElementById("storeScopeId").value;
	return value ? Number(value) : null;
}

function reportUrl(path, reportType) {
	const params = new URLSearchParams();
	const storeId = selectedStoreId();
	if (storeId) params.set("store_id", String(storeId));
	return `${path}/${encodeURIComponent(reportType)}${params.size ? `?${params}` : ""}`;
}

async function exportReport(format, reportType) {
	if (!reportType) throw new Error("Select a report before exporting it");
	const params = new URLSearchParams({ report_type: reportType, format });
	const storeId = selectedStoreId();
	if (storeId) params.set("store_id", String(storeId));
	const response = await fetch(`${EXPORT_API}?${params}`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		const payload = await response.json().catch(() => ({}));
		throw new Error(payload.detail || "Export failed");
	}

	const blob = await response.blob();
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	const extension = format === "xlsx" ? "xlsx" : format;
	link.href = url;
	link.download = `${reportType}.${extension}`;
	document.body.appendChild(link);
	link.click();
	link.remove();
	URL.revokeObjectURL(url);
}

async function submitExport(event) {
	event.preventDefault();
	const format = document.getElementById("exportFormat").value;
	try {
		await exportReport(format, selectedReportType);
		closeModal("exportModal");
	} catch (error) {
		alert(error.message);
	}
}

function handleTableActions(event) {
	const button = event.target.closest("button[data-action]");
	if (!button) {
		return;
	}

	const action = button.getAttribute("data-action");
	const reportType = button.getAttribute("data-id");
	const report = reports.find((item) => item && item.id === reportType);
	if (!report) {
		return;
	}

	if (action === "view") {
		selectedReportType = report.report_type;
		request(reportUrl(`${REPORTS_API}/detail`, report.report_type)).then((detail) => {
			renderViewModal(detail);
			openModal("viewModal");
		}).catch((error) => alert(error.message));
		return;
	}

	if (action === "export") {
		selectedReportType = report.report_type;
		openModal("exportModal");
	}
}

function setupEvents() {
	const storedStoreId = localStorage.getItem("reports_store_id");
	if (storedStoreId && /^\d+$/.test(storedStoreId)) {
		document.getElementById("storeScopeId").value = storedStoreId;
	}
	document.getElementById("exportForm").addEventListener("submit", submitExport);
	document.getElementById("reportTableBody").addEventListener("click", handleTableActions);

	document.querySelectorAll("[data-close]").forEach((button) => {
		button.addEventListener("click", () => closeModal(button.getAttribute("data-close")));
	});

	document.querySelectorAll(".modal").forEach((modal) => {
		modal.addEventListener("click", (event) => {
			if (event.target === modal) {
				closeModal(modal.id);
			}
		});
	});
}

setupEvents();
loadReports();
