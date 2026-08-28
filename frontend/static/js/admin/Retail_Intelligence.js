const token = localStorage.getItem("access_token");

if (!token) {
    window.location.href = "/login";
}

if (localStorage.getItem("role") !== "admin") {
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
    if (chartInstance && typeof chartInstance.destroy === "function") {
        chartInstance.destroy();
    }

    if (
        typeof Chart !== "undefined" &&
        typeof Chart.getChart === "function" &&
        canvas
    ) {
        const existing = Chart.getChart(canvas);

        if (existing && existing !== chartInstance) {
            existing.destroy();
        }
    }
}


// ============================================================
// LIVE STATUS
// ============================================================

function setLiveStatus(message, failed = false) {
    const status = document.getElementById("liveStatus");

    if (!status) return;

    status.textContent = message;

    status.classList.remove(
        "border-blue-200",
        "bg-blue-50",
        "text-blue-700",
        "border-red-200",
        "bg-red-50",
        "text-red-700"
    );

    status.classList.add(
        failed ? "border-red-200" : "border-blue-200",
        failed ? "bg-red-50" : "bg-blue-50",
        failed ? "text-red-700" : "text-blue-700"
    );
}


// ============================================================
// CHART INSTANCES
// ============================================================

let salesAttentionChart;
let opportunityMatrixChart;


// ============================================================
// HELPERS
// ============================================================

function median(values) {
    const sorted = values
        .filter(Number.isFinite)
        .sort((left, right) => left - right);

    if (!sorted.length) return 0;

    const middle = Math.floor(sorted.length / 2);

    return sorted.length % 2
        ? sorted[middle]
        : (sorted[middle - 1] + sorted[middle]) / 2;
}


function addCell(row, value, className = "") {
    const cell = document.createElement("td");

    cell.className = `p-3 ${className}`;
    cell.textContent = value;

    row.appendChild(cell);
}


function renderEmptyRow(tableId, columnCount, message) {
    const table = document.getElementById(tableId);

    if (!table) return;

    table.replaceChildren();

    const row = document.createElement("tr");

    const cell = document.createElement("td");

    cell.colSpan = columnCount;
    cell.className = "p-4 text-center text-slate-500";
    cell.textContent = message;

    row.appendChild(cell);
    table.appendChild(row);
}


// ============================================================
// GENERIC TABLE
// ============================================================

function renderRows(tableId, rows, emptyMessage) {
    const table = document.getElementById(tableId);

    if (!table) return;

    table.replaceChildren();

    if (!rows.length) {
        renderEmptyRow(tableId, 3, emptyMessage);
        return;
    }

    rows.forEach((entry) => {
        const row = document.createElement("tr");

        addCell(row, entry.name, "font-medium text-slate-900");
        addCell(row, entry.signal);
        addCell(row, entry.decision, "text-slate-600");

        table.appendChild(row);
    });
}


// ============================================================
// OPPORTUNITIES
// ============================================================

function renderOpportunities(rows) {
    const table = document.getElementById("opportunityTable");

    if (!table) return;

    table.replaceChildren();

    if (!rows.length) {
        renderEmptyRow(
            "opportunityTable",
            4,
            "No attention-to-sales opportunities need action."
        );

        return;
    }

    rows.forEach((entry) => {
        const row = document.createElement("tr");

        addCell(row, entry.name, "font-medium text-slate-900");
        addCell(row, entry.opportunity);
        addCell(row, entry.reason, "text-slate-600");
        addCell(row, entry.direction, "text-slate-600");

        table.appendChild(row);
    });
}


// ============================================================
// LIST RENDERING
// ============================================================

function renderList(listId, items, ordered = false) {
    const list = document.getElementById(listId);

    if (!list) return;

    list.replaceChildren();

    items.forEach((item, index) => {
        const entry = document.createElement("li");

        entry.className = ordered
            ? "flex gap-3 border-b border-slate-100 pb-3 last:border-0"
            : "border-b border-slate-100 pb-3 last:border-0";

        if (ordered) {
            const priority = document.createElement("span");

            priority.className =
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700";

            priority.textContent = String(index + 1);

            entry.appendChild(priority);
        }

        const copy = document.createElement("span");

        copy.textContent = item;

        entry.appendChild(copy);

        list.appendChild(entry);
    });
}


// ============================================================
// PRODUCT ATTRACTIVENESS
// ============================================================

function calculateProductAttractiveness(products) {

    if (!products.length) {
        return [];
    }

    const maxViews = Math.max(
        ...products.map((product) => Number(product.views || 0)),
        1
    );

    const maxAttention = Math.max(
        ...products.map((product) => Number(product.attention || 0)),
        1
    );

    /*
     * The current dashboard API provides:
     *
     * - views
     * - attention
     *
     * If your backend later provides:
     * - dwell_time
     * - engagement
     * - revisit_rate
     *
     * this function can directly use those values.
     *
     * For now, normalized product interaction signals are used
     * without inventing unsupported purchase behavior.
     */

    return products.map((product) => {

        const views = Number(product.views || 0);
        const attention = Number(product.attention || 0);

        // Attention normalized to 0-100
        const attentionScore = Math.min(
            100,
            (attention / maxAttention) * 100
        );

        // Interaction intensity normalized to 0-100
        const interactionScore = Math.min(
            100,
            (views / maxViews) * 100
        );

        /*
         * Current data does not expose real dwell/revisit values.
         *
         * Therefore:
         * - interactionScore is used as the available engagement signal
         * - revisit is kept as 0 until backend revisit data exists
         *
         * This avoids falsely claiming that revisit/dwell data exists.
         */

        const dwellScore = interactionScore;
        const engagementScore =
            (attentionScore * 0.6) +
            (interactionScore * 0.4);

        const revisitScore = 0;

        /*
         * Product attractiveness:
         *
         * Attention       = 40%
         * Dwell           = 20%
         * Engagement      = 30%
         * Revisit         = 10%
         */

        const attractivenessScore =
            (attentionScore * 0.40) +
            (dwellScore * 0.20) +
            (engagementScore * 0.30) +
            (revisitScore * 0.10);

        return {
            ...product,

            attentionScore,
            dwellScore,
            engagementScore,
            revisitScore,

            attractivenessScore: Math.max(
                0,
                Math.min(100, attractivenessScore)
            )
        };
    });
}


// ============================================================
// ATTRACTIVENESS LABEL
// ============================================================

function getAttractivenessLabel(score) {

    if (score >= 80) {
        return {
            label: "Highly Attractive",
            className: "bg-emerald-50 text-emerald-700"
        };
    }

    if (score >= 60) {
        return {
            label: "Attractive",
            className: "bg-blue-50 text-blue-700"
        };
    }

    if (score >= 40) {
        return {
            label: "Moderate",
            className: "bg-amber-50 text-amber-700"
        };
    }

    return {
        label: "Low",
        className: "bg-rose-50 text-rose-700"
    };
}


// ============================================================
// RENDER PRODUCT ATTRACTIVENESS TABLE
// ============================================================

function renderProductAttractiveness(products) {

    const table = document.getElementById(
        "productAttractivenessTable"
    );

    if (!table) return;

    table.replaceChildren();

    if (!products.length) {

        const row = document.createElement("tr");

        const cell = document.createElement("td");

        cell.colSpan = 7;
        cell.className = "p-5 text-center text-slate-500";

        cell.textContent =
            "No product interaction data available for attractiveness scoring.";

        row.appendChild(cell);
        table.appendChild(row);

        return;
    }

    const rankedProducts = [...products]
        .sort(
            (left, right) =>
                right.attractivenessScore -
                left.attractivenessScore
        )
        .slice(0, 10);


    rankedProducts.forEach((product, index) => {

        const row = document.createElement("tr");

        row.className =
            "transition hover:bg-slate-50";


        // Rank
        addCell(
            row,
            `#${index + 1}`,
            "font-semibold text-slate-500"
        );


        // Product
        addCell(
            row,
            product.name || "Unknown Product",
            "font-medium text-slate-900"
        );


        // Attention
        addCell(
            row,
            `${product.attentionScore.toFixed(0)}%`
        );


        // Dwell
        addCell(
            row,
            `${product.dwellScore.toFixed(0)}`
        );


        // Engagement
        addCell(
            row,
            `${product.engagementScore.toFixed(0)}%`
        );


        // Revisit
        addCell(
            row,
            product.revisitScore > 0
                ? `${product.revisitScore.toFixed(0)}%`
                : "N/A"
        );


        // Score
        const scoreCell = document.createElement("td");

        scoreCell.className = "p-3";

        const wrapper = document.createElement("div");

        wrapper.className =
            "flex flex-wrap items-center gap-2";


        const score = document.createElement("span");

        score.className =
            "font-bold text-slate-900";

        score.textContent =
            `${product.attractivenessScore.toFixed(0)}/100`;


        const label = getAttractivenessLabel(
            product.attractivenessScore
        );

        const badge = document.createElement("span");

        badge.className =
            `rounded-full px-2 py-1 text-xs font-medium ${label.className}`;

        badge.textContent = label.label;


        wrapper.appendChild(score);
        wrapper.appendChild(badge);

        scoreCell.appendChild(wrapper);

        row.appendChild(scoreCell);


        table.appendChild(row);
    });
}


// ============================================================
// CHARTS
// ============================================================

function buildCharts(
    products,
    demandBaseline,
    attentionBaseline
) {

    if (typeof Chart === "undefined") return;

    const salesCanvas =
        document.getElementById("salesAttentionChart");

    const matrixCanvas =
        document.getElementById("opportunityMatrixChart");


    destroyCanvasChart(
        salesCanvas,
        salesAttentionChart
    );

    destroyCanvasChart(
        matrixCanvas,
        opportunityMatrixChart
    );


    const points = products.map((product) => ({
        x: product.views,
        y: product.attention,
        label: product.name
    }));


    const chartOptions = {

        responsive: true,

        plugins: {

            legend: {
                display: false
            },

            tooltip: {

                callbacks: {

                    label: (context) =>
                        `${context.raw.label}: ${context.raw.x} sales-performance signals, ${context.raw.y.toFixed(1)}% attention`

                }

            }

        },

        scales: {

            x: {
                title: {
                    display: true,
                    text: "Sales performance (recorded demand signals)"
                },

                beginAtZero: true
            },

            y: {

                title: {
                    display: true,
                    text: "Customer attention score"
                },

                beginAtZero: true,
                max: 100

            }

        }

    };


    // Sales × Attention
    const salesContext =
        getCanvasContext("salesAttentionChart");


    if (salesContext) {

        salesAttentionChart =
            new Chart(salesContext, {

                type: "scatter",

                data: {

                    datasets: [{

                        data: points,

                        backgroundColor: "#2563eb",

                        pointRadius: 6,

                        pointHoverRadius: 8

                    }]

                },

                options: chartOptions

            });

    }


    // Opportunity / Risk Matrix
    const matrixContext =
        getCanvasContext("opportunityMatrixChart");


    if (matrixContext) {

        opportunityMatrixChart =
            new Chart(matrixContext, {

                type: "scatter",

                data: {

                    datasets: [{

                        data: points.map((point) => ({

                            ...point,

                            backgroundColor:
                                point.x >= demandBaseline &&
                                point.y >= attentionBaseline

                                    ? "#16a34a"

                                    : point.x >= demandBaseline

                                        ? "#0284c7"

                                        : point.y >= attentionBaseline

                                            ? "#f59e0b"

                                            : "#dc2626"

                        })),

                        backgroundColor:
                            (context) =>
                                context.raw.backgroundColor,

                        pointRadius: 6,

                        pointHoverRadius: 8

                    }]

                },

                options: chartOptions

            });

    }

}


// ============================================================
// MAIN DASHBOARD
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const fullName =
            localStorage.getItem("full_name") ||
            "Administrator";


        if (fullName) {

            const firstName =
                fullName.split(" ")[0];

            const welcome =
                document.getElementById("welcomeText");

            if (welcome) {
                welcome.textContent =
                    `Welcome, ${firstName}`;
            }

        }


        try {

            setLiveStatus(
                "Building retail decisions…"
            );


            const headers = {
                Authorization: `Bearer ${token}`
            };


            const [
                dashboardResponse,
                productsResponse
            ] = await Promise.all([

                fetch(
                    "/api/dashboard/live",
                    { headers }
                ),

                fetch(
                    "/api/products?page_size=100",
                    { headers }
                )

            ]);


            if (
                !dashboardResponse.ok ||
                !productsResponse.ok
            ) {

                throw new Error(
                    "Unable to load retail intelligence"
                );

            }


            const dashboard =
                await dashboardResponse.json();

            const catalog =
                await productsResponse.json();


            // ====================================================
            // PRODUCT PERFORMANCE
            // ====================================================

            const performance =
                Array.isArray(
                    dashboard.series?.product_performance
                )
                    ? dashboard.series.product_performance
                    : [];


            const productByName =
                new Map(

                    performance.map((item) => [

                        item.name,

                        {
                            views: Number(
                                item.views || 0
                            ),

                            attention: Number(
                                item.attention || 0
                            )
                        }

                    ])

                );


            const products =
                (
                    Array.isArray(catalog.items)
                        ? catalog.items
                        : []
                ).map((item) => ({

                    ...item,

                    ...(productByName.get(item.name) || {

                        views: 0,

                        attention: 0

                    })

                }));


            const observed =
                products.filter(
                    (product) =>
                        product.views > 0
                );


            // ====================================================
            // BASELINES
            // ====================================================

            const demandBaseline =
                median(
                    observed.map(
                        (product) =>
                            product.views
                    )
                );


            const attentionBaseline =
                median(
                    observed.map(
                        (product) =>
                            product.attention
                    )
                );


            // ====================================================
            // RISKS + OPPORTUNITIES
            // ====================================================

            const stockRisks =
                observed.filter(
                    (product) =>
                        Number(
                            product.stock_quantity || 0
                        ) <= 10
                );


            const opportunities =
                observed.filter(
                    (product) =>

                        product.views <
                            demandBaseline &&

                        product.attention >=
                            attentionBaseline
                );


            const weakPerformers =
                observed.filter(
                    (product) =>

                        product.views <
                            demandBaseline &&

                        product.attention <
                            attentionBaseline
                );


            // ====================================================
            // BUSINESS CALCULATIONS
            // ====================================================

            const demandAtRisk =
                stockRisks.reduce(
                    (sum, product) =>
                        sum +
                        product.views,
                    0
                );


            const totalDemand =
                observed.reduce(
                    (sum, product) =>
                        sum +
                        product.views,
                    0
                );


            const totalAttention =
                observed.reduce(
                    (sum, product) =>
                        sum +
                        product.attention,
                    0
                );


            const riskCount =
                stockRisks.length +
                weakPerformers.length;


            const healthScore =
                Math.max(

                    0,

                    Math.round(

                        100 -

                        (
                            (
                                opportunities.length +
                                riskCount
                            ) /
                            Math.max(
                                observed.length,
                                1
                            )
                        ) *

                        100

                    )

                );


            const efficiency =
                totalAttention
                    ? totalDemand /
                      totalAttention
                    : 0;


            // ====================================================
            // UPDATE KPIs
            // ====================================================

            setText(
                "businessHealth",
                `${healthScore}%`
            );


            setText(
                "salesPerformance",
                totalDemand.toLocaleString()
            );


            setText(
                "attentionSalesEfficiency",
                `${efficiency.toFixed(1)}x`
            );


            setText(
                "opportunityCount",
                opportunities.length.toLocaleString()
            );


            setText(
                "riskCount",
                riskCount.toLocaleString()
            );


            // ====================================================
            // BUILD EXISTING CHARTS
            // ====================================================

            buildCharts(
                observed,
                demandBaseline,
                attentionBaseline
            );


            // ====================================================
            // PRODUCT ATTRACTIVENESS
            // ====================================================

            const attractivenessProducts =
                calculateProductAttractiveness(
                    observed
                );


            renderProductAttractiveness(
                attractivenessProducts
            );


            // ====================================================
            // OPPORTUNITIES
            // ====================================================

            renderOpportunities(

                opportunities

                    .map((product) => ({

                        name:
                            product.name,

                        opportunity:
                            "High attention, low sales performance",

                        reason:
                            `${product.attention.toFixed(1)}% attention is not translating into demand (${product.views} signals).`,

                        direction:
                            "Review placement, pricing, and conversion messaging."

                    }))

                    .slice(0, 5)

            );


            // ====================================================
            // INVENTORY RISKS
            // ====================================================

            const risks =

                stockRisks

                    .sort(
                        (left, right) =>
                            right.views -
                            left.views
                    )

                    .map((product) => ({

                        name:
                            product.name,

                        signal:

                            product.stock_quantity === 0

                                ? `${product.views} demand views · out of stock`

                                : `${product.views} demand views · ${product.stock_quantity} units left`,

                        decision:

                            product.stock_quantity === 0

                                ? "Replenish or suppress promotion"

                                : "Review replenishment timing"

                    }))

                    .slice(0, 5);


            renderRows(

                "riskTable",

                risks,

                "No demand-linked inventory risks detected."

            );


            // ====================================================
            // INSIGHTS
            // ====================================================

            const topAttractiveProduct =
                attractivenessProducts.length
                    ? [...attractivenessProducts]
                        .sort(
                            (a, b) =>
                                b.attractivenessScore -
                                a.attractivenessScore
                        )[0]
                    : null;


            const insightItems = [

                `${opportunities.length} products attract above-baseline attention but have weak sales performance, indicating a conversion opportunity.`,

                `${stockRisks.length} inventory positions could interrupt observed demand, placing ${demandAtRisk} sales-performance signals at risk.`,

                `${weakPerformers.length} products have weak attention and weak sales performance, which may warrant an assortment review.`

            ];


            if (topAttractiveProduct) {

                insightItems.unshift(

                    `${topAttractiveProduct.name} currently has the highest observed product attractiveness score at ${topAttractiveProduct.attractivenessScore.toFixed(0)}/100.`

                );

            }


            renderList(
                "insightsList",
                insightItems
            );


            // ====================================================
            // RECOMMENDED ACTIONS
            // ====================================================

            const actions = [];


            if (stockRisks.length) {

                actions.push(

                    `High priority: replenish or pause promotion for ${stockRisks[0].name}, where availability conflicts with recorded demand.`

                );

            }


            if (opportunities.length) {

                actions.push(

                    `High priority: review ${opportunities[0].name} placement, pricing, and conversion strategy because customer attention is not becoming sales performance.`

                );

            }


            if (topAttractiveProduct) {

                actions.push(

                    `Monitor ${topAttractiveProduct.name} as the current highest-attractiveness product (${topAttractiveProduct.attractivenessScore.toFixed(0)}/100) and maintain its effective placement.`

                );

            }


            if (weakPerformers.length) {

                actions.push(

                    "Medium priority: investigate low-attention, low-sales products for an assortment or promotion intervention."

                );

            }


            if (!actions.length) {

                actions.push(

                    "Monitor for more recorded product interactions before changing assortment or merchandising decisions."

                );

            }


            renderList(
                "actionsList",
                actions,
                true
            );


            // ====================================================
            // FINAL STATUS
            // ====================================================

            setLiveStatus(
                `Decision view updated ${new Date().toLocaleTimeString()}`
            );


        } catch (error) {

            console.error(error);


            setLiveStatus(
                "Retail intelligence is unavailable. Please sign in again.",
                true
            );


            renderEmptyRow(
                "opportunityTable",
                4,
                "Unable to load decision signals."
            );


            renderEmptyRow(
                "riskTable",
                3,
                "Unable to load decision signals."
            );


            renderEmptyRow(
                "productAttractivenessTable",
                7,
                "Unable to load product attractiveness data."
            );

        }

    }
);