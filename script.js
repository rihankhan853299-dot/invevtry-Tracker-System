
// Get HTML Elements

const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("sidebarOverlay");

// Open and Close Sidebar

menuToggle.addEventListener("click", function () {

    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");

});

// Close Sidebar when clicking outside

overlay.addEventListener("click", function () {

    sidebar.classList.remove("active");
    overlay.classList.remove("active");

});

// Show Current Date

const currentDate = document.getElementById("currentDate");

const today = new Date();

currentDate.textContent = today.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
});

console.log("Dashboard Loaded Successfully!");




// =================================
// ADD NEW PRODUCT FUNCTIONALITY
// =================================

// Get Form

// =====================================
// INVENTRY TRACKER - PRODUCT MANAGEMENT
// =====================================

// 1. HTML Elements

const productForm = document.getElementById("productForm");

const productTableBody = document.getElementById("productTableBody");

const productModalElement = document.getElementById("addProductModal");

const productModal = bootstrap.Modal.getOrCreateInstance(
    productModalElement
);


// 2. Stored product data

const STORAGE_KEYS = {
    products: "inventoryTrackerProducts",
    sales: "inventoryTrackerSales",
    stockIn: "inventoryTrackerStockIn"
};

function loadStoredArray(key) {
    try {
        const storedValue = localStorage.getItem(key);
        const parsedValue = storedValue ? JSON.parse(storedValue) : [];
        return Array.isArray(parsedValue) ? parsedValue : [];
    } catch (error) {
        console.error("Could not read saved inventory data:", error);
        return [];
    }
}

function saveStoredArray(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error("Could not save inventory data:", error);
        alert("This change could not be saved. Please check browser storage settings.");
    }
}

const products = loadStoredArray(STORAGE_KEYS.products);


// 3. Get Products

function getProducts() {
    return products;
}


// 5. Calculate Product Status

function getProductStatus(product) {

    if (product.quantity <= 0) {

        return {
            text: "Out of Stock",
            className: "out"
        };

    }

    if (product.quantity <= product.lowStockLimit) {

        return {
            text: "Low Stock",
            className: "low"
        };

    }

    return {
        text: "Available",
        className: "available"
    };

}


// 6. Display Products In Table

let activeProductFilter = null;

function renderProducts(filter = activeProductFilter) {

    activeProductFilter = filter;
    const allProducts = getProducts();
    const products = filter ? allProducts.filter(filter) : allProducts;

    productTableBody.innerHTML = "";

    if (products.length === 0) {

        const row = document.createElement("tr");

        const cell = document.createElement("td");

        cell.colSpan = 5;

        cell.textContent = allProducts.length === 0
            ? "No products added yet."
            : "No products match this filter.";

        row.appendChild(cell);

        productTableBody.appendChild(row);

        return;

    }

    products.forEach(function(product) {

        const row = document.createElement("tr");

        const nameCell = document.createElement("td");

        const categoryCell = document.createElement("td");

        const stockCell = document.createElement("td");

        const statusCell = document.createElement("td");

        nameCell.textContent = product.name;

        categoryCell.textContent = product.category;

        stockCell.textContent =
            `${product.quantity} ${product.unit}`;

        const status = getProductStatus(product);

        const badge = document.createElement("span");

        badge.classList.add("status", status.className);

        badge.textContent = status.text;

        statusCell.appendChild(badge);

        const actionCell = document.createElement("td");
        actionCell.className = "text-end";

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "btn btn-outline-danger btn-sm";
        deleteButton.dataset.productId = product.id;
        deleteButton.innerHTML = '<i class="bi bi-trash"></i> Delete';
        actionCell.appendChild(deleteButton);

        row.append(
            nameCell,
            categoryCell,
            stockCell,
            statusCell,
            actionCell
        );

        productTableBody.appendChild(row);

    });

}


productTableBody.addEventListener("click", function(event) {
    const deleteButton = event.target.closest("[data-product-id]");
    if (!deleteButton) return;

    const productId = String(deleteButton.dataset.productId);
    const product = getProducts().find(function(item) {
        return String(item.id) === productId;
    });
    if (!product) return;

    if (!confirm(`"${product.name}" ko delete karna hai?`)) return;

    const productIndex = products.findIndex(function(item) {
        return String(item.id) === productId;
    });
    if (productIndex !== -1) products.splice(productIndex, 1);

    if (typeof sales !== "undefined") {
        for (let index = sales.length - 1; index >= 0; index -= 1) {
            if (String(sales[index].productId) === productId) sales.splice(index, 1);
        }
        saveStoredArray(STORAGE_KEYS.sales, sales);
    }

    if (typeof stockInHistory !== "undefined") {
        for (let index = stockInHistory.length - 1; index >= 0; index -= 1) {
            if (String(stockInHistory[index].productId) === productId) stockInHistory.splice(index, 1);
        }
        saveStoredArray(STORAGE_KEYS.stockIn, stockInHistory);
    }

    saveStoredArray(STORAGE_KEYS.products, products);

    renderProducts();
    if (typeof renderSalesHistory === "function") renderSalesHistory();
    if (typeof renderStockInHistory === "function") renderStockInHistory();
    if (typeof loadSalesProducts === "function") loadSalesProducts();
    if (typeof loadStockInProducts === "function") loadStockInProducts();
    if (typeof updateDashboardStats === "function") updateDashboardStats();
    if (typeof renderReport === "function") renderReport();
});

const productsSection = document.getElementById("products");
const productsTableTitle = document.getElementById("productsTableTitle");
const productsTableDescription = document.getElementById("productsTableDescription");
const totalProductsCard = document.getElementById("totalProductsCard");
const availableProductsCard = document.getElementById("availableProductsCard");
const lowStockProductsCard = document.getElementById("lowStockProductsCard");
const outOfStockProductsCard = document.getElementById("outOfStockProductsCard");

function showProducts(filter, title, description) {
    renderProducts(filter);
    productsTableTitle.textContent = title;
    productsTableDescription.textContent = description;
    productsSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function addProductCardActivation(card, onActivate) {
    card.addEventListener("click", onActivate);
    card.addEventListener("keydown", function(event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onActivate();
        }
    });
}

addProductCardActivation(totalProductsCard, function() {
    showProducts(null, "All Products", "All inventory items");
});

addProductCardActivation(availableProductsCard, function() {
    showProducts(
        product => product.quantity > product.lowStockLimit,
        "Available Stock Products",
        "Products with stock above their low-stock alert limit"
    );
});

addProductCardActivation(lowStockProductsCard, function() {
    showProducts(
        product => product.quantity > 0 && product.quantity <= product.lowStockLimit,
        "Low Stock Products",
        "Products that need restocking"
    );
});

addProductCardActivation(outOfStockProductsCard, function() {
    showProducts(
        product => product.quantity === 0,
        "Out of Stock Products",
        "Products with no stock remaining"
    );
});


// 7. Add New Product

productForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const product = {

        id: Date.now(),

        name: document.getElementById("productName").value.trim(),

        category: document.getElementById("productCategory").value,

        purchasePrice: Number(
            document.getElementById("purchasePrice").value
        ),

        sellingPrice: Number(
            document.getElementById("sellingPrice").value
        ),

        quantity: Number(
            document.getElementById("productQuantity").value
        ),

        unit: document.getElementById("productUnit").value,

        lowStockLimit: Number(
            document.getElementById("lowStockLimit").value
        )

    };

    if (!product.name || !product.category || !product.unit ||
        !Number.isFinite(product.purchasePrice) || product.purchasePrice < 0 ||
        !Number.isFinite(product.sellingPrice) || product.sellingPrice < 0 ||
        !Number.isFinite(product.quantity) || product.quantity < 0 ||
        !Number.isFinite(product.lowStockLimit) || product.lowStockLimit < 0) {
        alert("Please enter valid product details.");
        return;
    }


    // Get Existing Products

    const products = getProducts();


    // Add New Product

    products.push(product);
    saveStoredArray(STORAGE_KEYS.products, products);


// Update Table
renderProducts();
loadSalesProducts();
loadStockInProducts();
updateDashboardStats();
renderReport();
// Reset Form
productForm.reset();


    // Close Modal

    productModal.hide();


    alert("Product Added Successfully!");

});


// 8. Load Products When Page Opens

renderProducts();




// =====================================
// SALES ENTRY SYSTEM
// =====================================

// 1. HTML Elements

const salesForm = document.getElementById("salesForm");

const saleProduct = document.getElementById("saleProduct");

const saleQuantity = document.getElementById("saleQuantity");

const availableStock = document.getElementById("availableStock");

const saleDate = document.getElementById("saleDate");

const salesHistoryBody = document.getElementById("salesHistoryBody");


// 2. In-memory sales history

const sales = loadStoredArray(STORAGE_KEYS.sales);


// 3. Get Sales History

function getSales() {
    return sales;
}


// 5. Set Today's Date

function getLocalDate() {

    const today = new Date();

    const year = today.getFullYear();

    const month = String(today.getMonth() + 1).padStart(2, "0");

    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;

}

saleDate.value = getLocalDate();


// 6. Load Products Into Dropdown

function loadSalesProducts() {

    const products = getProducts();

    saleProduct.innerHTML = '<option value="">Select Product</option>';

    products.forEach(function(product) {

        const option = document.createElement("option");

        option.value = product.id;

        option.textContent = product.name;

        saleProduct.appendChild(option);

    });

}


// 7. Show Available Stock

saleProduct.addEventListener("change", function() {

    const products = getProducts();

    const selectedProduct = products.find(function(product) {

        return String(product.id) === saleProduct.value;

    });

    if (selectedProduct) {

        availableStock.value =
            `${selectedProduct.quantity} ${selectedProduct.unit}`;

        saleQuantity.max = selectedProduct.quantity;

    } else {

        availableStock.value = "";

        saleQuantity.removeAttribute("max");

    }

});


// 8. Save Sale

salesForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const products = getProducts();

    const selectedProduct = products.find(function(product) {

        return String(product.id) === saleProduct.value;

    });

    const quantity = Number(saleQuantity.value);

    const date = saleDate.value;


    // Check Product

    if (!selectedProduct) {

        alert("Please select a valid product!");

        return;

    }


    // Check Quantity

    if (!Number.isFinite(quantity) || quantity <= 0) {

        alert("Please enter a valid sale quantity!");

        return;

    }


    // Check Available Stock

    if (quantity > selectedProduct.quantity) {

        alert(
            `Insufficient Stock! Available stock is ${selectedProduct.quantity} ${selectedProduct.unit}.`
        );

        return;

    }


    // Update Stock

    selectedProduct.quantity =
        Number((selectedProduct.quantity - quantity).toFixed(3));
    saveStoredArray(STORAGE_KEYS.products, products);


    // Create Sale Record

    const sale = {

        id: Date.now(),

        productId: selectedProduct.id,

        productName: selectedProduct.name,

        quantity: quantity,

        unit: selectedProduct.unit,
        salePrice: selectedProduct.sellingPrice,
        purchasePrice: selectedProduct.purchasePrice,

        remainingStock: selectedProduct.quantity,

        date: date

    };


    // Add Sale History

    sales.unshift(sale);
    saveStoredArray(STORAGE_KEYS.sales, sales);


    // Update UI

    // Update UI
renderProducts();
renderSalesHistory();
loadSalesProducts();
updateDashboardStats();
renderReport();


    // Reset Form

    salesForm.reset();

    saleDate.value = getLocalDate();

    availableStock.value = "";


    // Show Success Message

    alert(
        `Sale Saved Successfully!\n\nProduct: ${selectedProduct.name}\nSold: ${quantity} ${selectedProduct.unit}\nRemaining Stock: ${selectedProduct.quantity} ${selectedProduct.unit}`
    );


    // Low Stock Alert

    if (selectedProduct.quantity <= selectedProduct.lowStockLimit) {

        alert(
            `LOW STOCK ALERT!\n\n${selectedProduct.name} ka stock ab sirf ${selectedProduct.quantity} ${selectedProduct.unit} reh gaya hai.`
        );

    }

});


// 9. Display Sales History

function renderSalesHistory() {

    const sales = getSales();

    salesHistoryBody.innerHTML = "";

    if (sales.length === 0) {

        const row = document.createElement("tr");

        const cell = document.createElement("td");

        cell.colSpan = 4;

        cell.textContent = "No sales recorded yet.";

        row.appendChild(cell);

        salesHistoryBody.appendChild(row);

        return;

    }


    sales.forEach(function(sale) {

        const row = document.createElement("tr");

        const dateCell = document.createElement("td");

        const nameCell = document.createElement("td");

        const quantityCell = document.createElement("td");

        const remainingCell = document.createElement("td");


        dateCell.textContent = sale.date;

        nameCell.textContent = sale.productName;

        quantityCell.textContent =
            `${sale.quantity} ${sale.unit}`;

        remainingCell.textContent =
            `${sale.remainingStock} ${sale.unit}`;


        row.append(
            dateCell,
            nameCell,
            quantityCell,
            remainingCell
        );

        salesHistoryBody.appendChild(row);

    });

}


// 10. Initial Load

loadSalesProducts();

renderSalesHistory();

console.log("Sales Entry System Ready!");


// =================================
// DASHBOARD STATISTICS
// =================================

function updateDashboardStats() {

    const products = getProducts();

    // Calculate Statistics

    const total = products.length;

    const available = products.filter(product =>
        product.quantity > product.lowStockLimit
    ).length;

    const lowStock = products.filter(product =>
        product.quantity > 0 &&
        product.quantity <= product.lowStockLimit
    ).length;

    const outOfStock = products.filter(product =>
        product.quantity === 0
    ).length;


    // Update Dashboard Cards

    document.getElementById("totalProducts").textContent = total;

    document.getElementById("availableProducts").textContent = available;

    document.getElementById("lowStockProducts").textContent = lowStock;

    document.getElementById("outOfStockProducts").textContent = outOfStock;

    document.getElementById("overviewAvailable").textContent = available;
    document.getElementById("overviewLowStock").textContent = lowStock;
    document.getElementById("overviewOutOfStock").textContent = outOfStock;

    const percentage = function(value) {
        return total === 0 ? 0 : Number(((value / total) * 100).toFixed(1));
    };

    document.getElementById("availableProgress").style.width =
        `${percentage(available)}%`;
    document.getElementById("lowStockProgress").style.width =
        `${percentage(lowStock)}%`;
    document.getElementById("outOfStockProgress").style.width =
        `${percentage(outOfStock)}%`;

}


// Initial Dashboard Update
updateDashboardStats();




// =====================================
// STOCK IN / RESTOCK SYSTEM
// =====================================

// 1. HTML Elements

const stockInForm = document.getElementById("stockInForm");

const stockInProduct = document.getElementById("stockInProduct");

const currentStock = document.getElementById("currentStock");

const stockInQuantity = document.getElementById("stockInQuantity");

const stockInDate = document.getElementById("stockInDate");

const stockInHistoryBody = document.getElementById("stockInHistoryBody");


// 2. In-memory stock history

const stockInHistory = loadStoredArray(STORAGE_KEYS.stockIn);


// 3. Get Stock In History

function getStockInHistory() {
    return stockInHistory;
}


// 5. Load Products In Dropdown

function loadStockInProducts() {

    const products = getProducts();

    stockInProduct.innerHTML =
        '<option value="">Select Product</option>';

    products.forEach(function(product) {

        const option = document.createElement("option");

        option.value = product.id;

        option.textContent = product.name;

        stockInProduct.appendChild(option);

    });

}


// 6. Show Current Stock

stockInProduct.addEventListener("change", function() {

    const products = getProducts();

    const selectedProduct = products.find(function(product) {

        return String(product.id) === stockInProduct.value;

    });

    if (selectedProduct) {

        currentStock.value =
            `${selectedProduct.quantity} ${selectedProduct.unit}`;

    } else {

        currentStock.value = "";

    }

});


// 7. Set Purchase Date

stockInDate.value = getLocalDate();


// 8. Save Stock In

stockInForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const products = getProducts();

    const selectedProduct = products.find(function(product) {

        return String(product.id) === stockInProduct.value;

    });

    const addedQuantity = Number(stockInQuantity.value);

    const date = stockInDate.value;


    // Validate Product

    if (!selectedProduct) {

        alert("Please select a valid product!");

        return;

    }


    // Validate Quantity

    if (!Number.isFinite(addedQuantity) || addedQuantity <= 0) {

        alert("Please enter a valid quantity!");

        return;

    }


    // Store Previous Stock

    const previousStock = selectedProduct.quantity;


    // Increase Stock

    selectedProduct.quantity = Number(
        (selectedProduct.quantity + addedQuantity).toFixed(3)
    );
    saveStoredArray(STORAGE_KEYS.products, products);


    // Create Stock Record

    const stockRecord = {

        id: Date.now(),

        productId: selectedProduct.id,

        productName: selectedProduct.name,

        addedQuantity: addedQuantity,

        unit: selectedProduct.unit,

        previousStock: previousStock,

        newStock: selectedProduct.quantity,

        date: date

    };


    // Add Stock History

    stockInHistory.unshift(stockRecord);
    saveStoredArray(STORAGE_KEYS.stockIn, stockInHistory);


    // Update Dashboard

    renderProducts();

    loadSalesProducts();

    loadStockInProducts();

    updateDashboardStats();

    renderStockInHistory();
    renderReport();


    // Reset Form

    stockInForm.reset();

    currentStock.value = "";

    stockInDate.value = getLocalDate();


    // Success Message

    alert(
        `${selectedProduct.name} stock updated successfully!\n\nAdded: ${addedQuantity} ${selectedProduct.unit}\nNew Stock: ${selectedProduct.quantity} ${selectedProduct.unit}`
    );

});


// 9. Display Stock In History

function renderStockInHistory() {

    const history = getStockInHistory();

    stockInHistoryBody.innerHTML = "";

    if (history.length === 0) {

        const row = document.createElement("tr");

        const cell = document.createElement("td");

        cell.colSpan = 4;

        cell.textContent = "No stock purchases recorded yet.";

        row.appendChild(cell);

        stockInHistoryBody.appendChild(row);

        return;

    }


    history.forEach(function(record) {

        const row = document.createElement("tr");

        const dateCell = document.createElement("td");

        const productCell = document.createElement("td");

        const addedCell = document.createElement("td");

        const totalCell = document.createElement("td");


        dateCell.textContent = record.date;

        productCell.textContent = record.productName;

        addedCell.textContent =
            `+${record.addedQuantity} ${record.unit}`;

        totalCell.textContent =
            `${record.newStock} ${record.unit}`;


        row.append(
            dateCell,
            productCell,
            addedCell,
            totalCell
        );

        stockInHistoryBody.appendChild(row);

    });

}


// 10. Initial Load

loadStockInProducts();

renderStockInHistory();

console.log("Stock In System Ready!");


// =====================================
// REPORTS, NAVIGATION, AND SEARCH
// =====================================

function formatCurrency(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
        maximumFractionDigits: 2
    })}`;
}

const reportCharts = {};

function renderProductChart(canvasId, emptyStateId, label, data, color, isCurrency) {
    const canvas = document.getElementById(canvasId);
    const emptyState = document.getElementById(emptyStateId);

    if (data.length === 0) {
        canvas.hidden = true;
        emptyState.hidden = false;
        if (reportCharts[canvasId]) {
            reportCharts[canvasId].data.labels = [];
            reportCharts[canvasId].data.datasets[0].data = [];
            reportCharts[canvasId].update();
        }
        return;
    }

    canvas.hidden = false;
    emptyState.hidden = true;

    const labels = data.map(item => item.name);
    const values = data.map(item => item.value);
    const chart = reportCharts[canvasId];

    if (chart) {
        chart.data.labels = labels;
        chart.data.datasets[0].data = values;
        chart.resize();
        chart.update();
        return;
    }

    reportCharts[canvasId] = new Chart(canvas, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label,
                data: values,
                backgroundColor: color,
                borderRadius: 5
            }]
        },
        options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: context => isCurrency
                            ? `${label}: ${formatCurrency(context.parsed.x)}`
                            : `${label}: ${Number(context.parsed.x).toLocaleString("en-IN")}`
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => isCurrency ? formatCurrency(value) : value
                    }
                }
            }
        }
    });
}

function getReportProductSales(productList, saleList) {
    const salesByProduct = new Map();

    saleList.forEach(function(sale) {
        const soldProduct = productList.find(product =>
            String(product.id) === String(sale.productId)
        );
        const quantity = Number(sale.quantity) || 0;
        const salePrice = Number(sale.salePrice ?? (soldProduct ? soldProduct.sellingPrice : 0));
        const purchasePrice = Number(sale.purchasePrice ?? (soldProduct ? soldProduct.purchasePrice : 0));
        const key = String(sale.productId ?? sale.productName);
        const productSales = salesByProduct.get(key) || {
            productId: sale.productId ?? "",
            name: sale.productName || (soldProduct ? soldProduct.name : "Unknown Product"),
            category: soldProduct ? soldProduct.category : "",
            unit: sale.unit || (soldProduct ? soldProduct.unit : ""),
            revenue: 0,
            units: 0,
            profit: 0
        };

        productSales.revenue += quantity * salePrice;
        productSales.units += quantity;
        productSales.profit += quantity * (salePrice - purchasePrice);
        salesByProduct.set(key, productSales);
    });

    return Array.from(salesByProduct.values());
}

function renderReport() {
    const reportBody = document.getElementById("reportTableBody");
    if (!reportBody) return;

    const productList = getProducts();
    const saleList = getSales();
    const productSales = getReportProductSales(productList, saleList);
    const totalSalesValue = productSales.reduce((total, item) => total + item.revenue, 0);
    const totalUnitsSold = productSales.reduce((total, item) => total + item.units, 0);
    const totalProfit = productSales.reduce((total, item) => total + item.profit, 0);

    document.getElementById("totalSalesValue").textContent =
        formatCurrency(totalSalesValue);
    document.getElementById("totalUnitsSold").textContent =
        Number(totalUnitsSold.toFixed(3)).toLocaleString("en-IN");
    document.getElementById("totalProfit").textContent =
        formatCurrency(totalProfit);

    if (typeof Chart === "undefined") {
        console.error("Sales charts could not be rendered because Chart.js did not load.");
        ["revenueChart", "unitsChart", "profitChart"].forEach(function(chartId) {
            document.getElementById(chartId).hidden = true;
            document.getElementById(`${chartId}Empty`).textContent =
                "Chart unavailable. Check your internet connection and reload.";
            document.getElementById(`${chartId}Empty`).hidden = false;
        });
    } else {
        renderProductChart(
            "revenueChart", "revenueChartEmpty", "Revenue",
            productSales.map(item => ({ name: item.name, value: item.revenue })),
            "rgba(25, 135, 84, 0.75)", true
        );
        renderProductChart(
            "unitsChart", "unitsChartEmpty", "Sold Units",
            productSales.map(item => ({ name: item.name, value: item.units })),
            "rgba(54, 118, 219, 0.75)", false
        );
        renderProductChart(
            "profitChart", "profitChartEmpty", "Profit",
            productSales.map(item => ({ name: item.name, value: item.profit })),
            "rgba(233, 154, 34, 0.75)", true
        );
    }

    reportBody.innerHTML = "";

    if (productList.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 6;
        cell.textContent = "No inventory data available.";
        row.appendChild(cell);
        reportBody.appendChild(row);
        return;
    }

    productList.forEach(function(product) {
        const row = document.createElement("tr");
        const status = getProductStatus(product);
        const values = [
            product.name,
            product.category,
            `${product.quantity} ${product.unit}`,
            formatCurrency(product.purchasePrice),
            formatCurrency(product.sellingPrice),
            status.text
        ];

        values.forEach(function(value, index) {
            const cell = document.createElement("td");
            if (index === 5) {
                const badge = document.createElement("span");
                badge.className = `status ${status.className}`;
                badge.textContent = value;
                cell.appendChild(badge);
            } else {
                cell.textContent = value;
            }
            row.appendChild(cell);
        });

        reportBody.appendChild(row);
    });
}

document.querySelectorAll(".sidebar-menu .menu-link[href^='#']").forEach(function(link) {
    link.addEventListener("click", function(event) {
        const target = document.querySelector(link.getAttribute("href"));
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        document.querySelectorAll(".sidebar-menu .menu-link").forEach(function(item) {
            item.classList.remove("active");
        });
        link.classList.add("active");
        sidebar.classList.remove("active");
        overlay.classList.remove("active");
    });
});

const searchInput = document.querySelector(".search-box input");
if (searchInput) {
    searchInput.addEventListener("input", function() {
        const query = searchInput.value.trim().toLowerCase();
        Array.from(productTableBody.querySelectorAll("tr")).forEach(function(row) {
            row.style.display = row.textContent.toLowerCase().includes(query) ? "" : "none";
        });

        const reportBody = document.getElementById("reportTableBody");
        Array.from(reportBody ? reportBody.querySelectorAll("tr") : []).forEach(function(row) {
            row.style.display = row.textContent.toLowerCase().includes(query) ? "" : "none";
        });
    });
}

const downloadReport = document.getElementById("downloadReport");
if (downloadReport) {
    downloadReport.addEventListener("click", function() {
        const productList = getProducts();
        const saleList = getSales();
        const productSales = getReportProductSales(productList, saleList);
        const totalSalesValue = productSales.reduce((total, item) => total + item.revenue, 0);
        const totalUnitsSold = productSales.reduce((total, item) => total + item.units, 0);
        const totalProfit = productSales.reduce((total, item) => total + item.profit, 0);
        const headers = [
            "row_type",
            "product_id",
            "product",
            "category",
            "sales_revenue_inr",
            "sold_units",
            "unit",
            "profit_inr",
            "current_stock",
            "purchase_price_inr",
            "selling_price_inr",
            "stock_status"
        ];
        const salesByProductId = new Map();
        const salesByProductName = new Map();
        productSales.forEach(function(item) {
            if (item.productId !== "") {
                salesByProductId.set(String(item.productId), item);
            } else {
                salesByProductName.set(item.name, item);
            }
        });
        const includedSales = new Set();
        const rows = productList.map(function(product) {
            const sale = salesByProductId.get(String(product.id)) ||
                salesByProductName.get(product.name);
            if (sale) includedSales.add(sale);
            const status = getProductStatus(product);

            return [
                "product",
                product.id,
                product.name,
                product.category,
                sale ? Number(sale.revenue.toFixed(2)) : 0,
                sale ? Number(sale.units.toFixed(3)) : 0,
                product.unit,
                sale ? Number(sale.profit.toFixed(2)) : 0,
                product.quantity,
                product.purchasePrice,
                product.sellingPrice,
                status.text
            ];
        });

        productSales.forEach(function(sale) {
            if (includedSales.has(sale)) return;

            rows.push([
                "product",
                sale.productId,
                sale.name,
                sale.category,
                Number(sale.revenue.toFixed(2)),
                Number(sale.units.toFixed(3)),
                sale.unit,
                Number(sale.profit.toFixed(2)),
                "",
                "",
                "",
                "Not in inventory"
            ]);
        });

        rows.push([
            "TOTAL",
            "",
            "",
            "",
            Number(totalSalesValue.toFixed(2)),
            Number(totalUnitsSold.toFixed(3)),
            "",
            Number(totalProfit.toFixed(2)),
            "",
            "",
            "",
            ""
        ]);

        const escapeCsv = function(value) {
            if (value === null || value === undefined) return "";
            if (typeof value === "number") {
                return Number.isFinite(value) ? String(value) : "";
            }

            let text = String(value);
            if (/^[\t\r\n ]*[=+\-@]/.test(text)) {
                text = `'${text}`;
            }
            return /[",\r\n]/.test(text)
                ? `"${text.replace(/"/g, '""')}"`
                : text;
        };

        const csv = [headers, ...rows]
            .map(row => row.map(escapeCsv).join(","))
            .join("\r\n");

        const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `inventory-report-${getLocalDate()}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    });
}

renderReport();
