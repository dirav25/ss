// ===============================
// STORAGE KEYS
// ===============================

const STORAGE_KEYS = {
    CUSTOMERS: "sst_customers",
    INVOICES: "sst_invoices",
    META: "sst_meta"
};

// ===============================
// COMMON HELPERS
// ===============================

function loadData(key, defaultValue = []) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (err) {
        console.error(err);
        return defaultValue;
    }
}

function saveData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// ===============================
// INVOICE NUMBER SYSTEM
// FIXED VERSION
// ===============================

function getMeta() {
    return loadData(STORAGE_KEYS.META, {
        lastInvoiceNumber: 0
    });
}

function saveMeta(meta) {
    saveData(STORAGE_KEYS.META, meta);
}

// Sirf dikhane ke liye
function peekNextInvoiceNumber() {

    const meta = getMeta();

    return (
        "SST" +
        String(meta.lastInvoiceNumber + 1).padStart(5, "0")
    );
}

// Save karte waqt use karna
function generateInvoiceNumber() {

    const meta = getMeta();

    meta.lastInvoiceNumber++;

    saveMeta(meta);

    return (
        "SST" +
        String(meta.lastInvoiceNumber).padStart(5, "0")
    );
}

// ===============================
// CUSTOMER MASTER
// ===============================

function getCustomers() {
    return loadData(STORAGE_KEYS.CUSTOMERS, []);
}

function saveCustomer(customer) {

    let customers = getCustomers();

    const existingIndex = customers.findIndex(
        x => x.mobile === customer.mobile
    );

    if (existingIndex >= 0) {
        customers[existingIndex] = customer;
    } else {
        customers.unshift(customer);
    }

    saveData(
        STORAGE_KEYS.CUSTOMERS,
        customers
    );

    return true;
}

function deleteCustomer(mobile) {

    let customers = getCustomers();

    customers = customers.filter(
        x => x.mobile !== mobile
    );

    saveData(
        STORAGE_KEYS.CUSTOMERS,
        customers
    );
}

// ===============================
// INVOICE STORAGE
// ===============================

function getInvoices() {
    return loadData(STORAGE_KEYS.INVOICES, []);
}

function saveInvoice(invoice) {

    let invoices = getInvoices();

    invoices.unshift(invoice);

    saveData(
        STORAGE_KEYS.INVOICES,
        invoices
    );

    return true;
}

function updateInvoice(invoiceId, updatedData) {

    let invoices = getInvoices();

    const index = invoices.findIndex(
        x => x.id === invoiceId
    );

    if (index === -1) return false;

    invoices[index] = {
        ...invoices[index],
        ...updatedData
    };

    saveData(
        STORAGE_KEYS.INVOICES,
        invoices
    );

    return true;
}

function deleteInvoice(invoiceId) {

    let invoices = getInvoices();

    invoices = invoices.filter(
        x => x.id !== invoiceId
    );

    saveData(
        STORAGE_KEYS.INVOICES,
        invoices
    );

    return true;
}

function getInvoiceById(invoiceId) {

    const invoices = getInvoices();

    return invoices.find(
        x => x.id === invoiceId
    );
}

// ===============================
// DASHBOARD TOTALS
// ===============================

function getDashboardStats() {

    const invoices = getInvoices();

    let totalSales = 0;
    let totalGST = 0;

    invoices.forEach(inv => {

        totalSales += Number(inv.total || 0);

        totalGST +=
            Number(inv.cgst || 0) +
            Number(inv.sgst || 0) +
            Number(inv.igst || 0);
    });

    return {
        totalInvoices: invoices.length,
        totalCustomers: getCustomers().length,
        totalSales,
        totalGST
    };
}

// ===============================
// BACKUP SYSTEM
// ===============================

function createBackup() {

    const backup = {
        meta: getMeta(),
        customers: getCustomers(),
        invoices: getInvoices(),
        exportedAt: new Date().toISOString()
    };

    const blob = new Blob(
        [JSON.stringify(backup, null, 2)],
        {
            type: "application/json"
        }
    );

    const link =
        document.createElement("a");

    link.href =
        URL.createObjectURL(blob);

    link.download =
        `sst_backup_${
            new Date()
            .toISOString()
            .slice(0,10)
        }.json`;

    link.click();

    URL.revokeObjectURL(link.href);
}

// ===============================
// RESTORE SYSTEM
// ===============================

function restoreBackup(file) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = function(e) {

            try {

                const backup =
                    JSON.parse(e.target.result);

                saveData(
                    STORAGE_KEYS.META,
                    backup.meta || {
                        lastInvoiceNumber: 0
                    }
                );

                saveData(
                    STORAGE_KEYS.CUSTOMERS,
                    backup.customers || []
                );

                saveData(
                    STORAGE_KEYS.INVOICES,
                    backup.invoices || []
                );

                resolve(true);

            } catch (err) {

                reject(
                    "Invalid Backup File"
                );
            }
        };

        reader.readAsText(file);

    });
}

// ===============================
// INIT
// ===============================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const invoiceBox =
            document.getElementById(
                "invoiceNo"
            );

        if (invoiceBox) {
            invoiceBox.value =
                peekNextInvoiceNumber();
        }
    }
);
