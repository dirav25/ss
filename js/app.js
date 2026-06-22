// ======================================
// APP START
// ======================================

document.addEventListener(
    "DOMContentLoaded",
    initApp
);

// ======================================
// INIT
// ======================================

function initApp() {

    initializeDate();

    bindEvents();

    loadInvoiceHistory();

    updateTotalsUI();
}

// ======================================
// DATE
// ======================================

function initializeDate() {

    const dateBox =
        document.getElementById(
            "invoiceDate"
        );

    if (dateBox) {

        dateBox.value =
            new Date()
            .toISOString()
            .slice(0, 10);
    }
}

// ======================================
// EVENTS
// ======================================

function bindEvents() {

    // Item

    document
        .getElementById(
            "addItemBtn"
        )
        ?.addEventListener(
            "click",
            addInvoiceItem
        );

    // Save Invoice

    document
        .getElementById(
            "saveInvoiceBtn"
        )
        ?.addEventListener(
            "click",
            saveCurrentInvoice
        );

    // Print

    document
        .getElementById(
            "printInvoiceBtn"
        )
        ?.addEventListener(
            "click",
            printCurrentInvoice
        );

    // PDF

    document
        .getElementById(
            "pdfInvoiceBtn"
        )
        ?.addEventListener(
            "click",
            downloadCurrentPDF
        );

    // WhatsApp

    document
        .getElementById(
            "whatsappBtn"
        )
        ?.addEventListener(
            "click",
            shareCurrentInvoice
        );

    // New Invoice

    document
        .getElementById(
            "newInvoiceBtn"
        )
        ?.addEventListener(
            "click",
            clearInvoiceForm
        );

    // Save Customer

    document
        .getElementById(
            "saveCustomerBtn"
        )
        ?.addEventListener(
            "click",
            saveCurrentCustomer
        );

    // Backup

    document
        .getElementById(
            "backupBtn"
        )
        ?.addEventListener(
            "click",
            createBackup
        );

    // Restore

    document
        .getElementById(
            "restoreBtn"
        )
        ?.addEventListener(
            "click",
            triggerRestoreDialog
        );
}

// ======================================
// SAVE CUSTOMER
// ======================================

function saveCurrentCustomer() {

    const customer = {

        name:
            document
            .getElementById(
                "customerName"
            )
            .value
            .trim(),

        mobile:
            document
            .getElementById(
                "customerMobile"
            )
            .value
            .trim(),

        gst:
            document
            .getElementById(
                "customerGST"
            )
            .value
            .trim(),

        address:
            document
            .getElementById(
                "customerAddress"
            )
            .value
            .trim()
    };

    if (!customer.name) {

        alert(
            "Customer name required"
        );

        return;
    }

    saveCustomer(customer);

    alert(
        "Customer Saved"
    );
}

// ======================================
// SAVE INVOICE
// ======================================

function saveCurrentInvoice() {

    if (
        invoiceItems.length === 0
    ) {

        alert(
            "Add at least one item"
        );

        return;
    }

    const invoice =
        buildInvoiceObject();

    saveInvoice(invoice);

    alert(
        `Invoice ${invoice.invoiceNo} Saved`
    );

    loadInvoiceHistory();

    clearInvoiceForm();
}

// ======================================
// HISTORY
// ======================================

function loadInvoiceHistory() {

    const tbody =
        document.querySelector(
            "#historyTable tbody"
        );

    if (!tbody) return;

    tbody.innerHTML = "";

    const invoices =
        getInvoices();

    invoices.forEach(inv => {

        const tr =
            document.createElement(
                "tr"
            );

        tr.innerHTML = `
        <td>${inv.invoiceNo}</td>
        <td>${inv.date}</td>
        <td>${inv.customerName}</td>
        <td>${formatCurrency(inv.total)}</td>

        <td>

            <button
            onclick="viewInvoice('${inv.id}')">
            View
            </button>

            <button
            onclick="printSavedInvoice('${inv.id}')">
            Print
            </button>

            <button
            onclick="downloadSavedPDF('${inv.id}')">
            PDF
            </button>

            <button
            onclick="deleteSavedInvoice('${inv.id}')">
            Delete
            </button>

        </td>
        `;

        tbody.appendChild(tr);
    });
}

// ======================================
// VIEW
// ======================================

function viewInvoice(id) {

    const invoice =
        getInvoiceById(id);

    if (!invoice) return;

    const printArea =
        document.getElementById(
            "invoicePrintArea"
        );

    printArea.innerHTML =
        generateInvoiceHTML(
            invoice
        );

    printArea.style.display =
        "block";

    window.scrollTo({
        top:
            printArea.offsetTop,
        behavior:
            "smooth"
    });
}

// ======================================
// PRINT SAVED
// ======================================

function printSavedInvoice(id) {

    const invoice =
        getInvoiceById(id);

    if (!invoice) return;

    printInvoice(invoice);
}

// ======================================
// PDF SAVED
// ======================================

function downloadSavedPDF(id) {

    const invoice =
        getInvoiceById(id);

    if (!invoice) return;

    downloadInvoicePDF(invoice);
}

// ======================================
// DELETE
// ======================================

function deleteSavedInvoice(id) {

    const ok =
        confirm(
            "Delete invoice?"
        );

    if (!ok) return;

    deleteInvoice(id);

    loadInvoiceHistory();
}

// ======================================
// RESTORE
// ======================================

function triggerRestoreDialog() {

    const input =
        document.createElement(
            "input"
        );

    input.type = "file";

    input.accept =
        ".json";

    input.onchange =
        async function(e) {

        const file =
            e.target.files[0];

        if (!file)
            return;

        try {

            await restoreBackup(
                file
            );

            alert(
                "Backup Restored"
            );

            loadInvoiceHistory();

            document
            .getElementById(
                "invoiceNo"
            )
            .value =
            peekNextInvoiceNumber();

        }

        catch(err) {

            alert(err);
        }
    };

    input.click();
}

// ======================================
// GLOBAL FUNCTIONS
// ======================================

window.viewInvoice =
    viewInvoice;

window.printSavedInvoice =
    printSavedInvoice;

window.downloadSavedPDF =
    downloadSavedPDF;

window.deleteSavedInvoice =
    deleteSavedInvoice;
