// ======================================
// CURRENT INVOICE ITEMS
// ======================================

let invoiceItems = [];

// ======================================
// FORMATTERS
// ======================================

function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR"
    }).format(amount || 0);
}

// ======================================
// NUMBER TO WORDS
// ======================================

function numberToWords(num) {

    const ones = [
        "", "One", "Two", "Three", "Four",
        "Five", "Six", "Seven", "Eight",
        "Nine", "Ten", "Eleven", "Twelve",
        "Thirteen", "Fourteen", "Fifteen",
        "Sixteen", "Seventeen", "Eighteen",
        "Nineteen"
    ];

    const tens = [
        "", "", "Twenty", "Thirty",
        "Forty", "Fifty", "Sixty",
        "Seventy", "Eighty", "Ninety"
    ];

    function convert(n) {

        if (n < 20) {
            return ones[n];
        }

        if (n < 100) {
            return tens[Math.floor(n / 10)] +
                (n % 10 ? " " + ones[n % 10] : "");
        }

        if (n < 1000) {
            return ones[Math.floor(n / 100)] +
                " Hundred " +
                convert(n % 100);
        }

        if (n < 100000) {
            return convert(Math.floor(n / 1000)) +
                " Thousand " +
                convert(n % 1000);
        }

        if (n < 10000000) {
            return convert(Math.floor(n / 100000)) +
                " Lakh " +
                convert(n % 100000);
        }

        return "";
    }

    return convert(Math.floor(num)) + " Rupees Only";
}

// ======================================
// GST CALCULATION
// ======================================

function calculateInvoiceTotals() {

    let subtotal = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    invoiceItems.forEach(item => {

        const amount =
            item.qty * item.rate;

        subtotal += amount;

        const gstAmount =
            amount * item.gst / 100;

        cgst += gstAmount / 2;
        sgst += gstAmount / 2;
    });

    const total =
        subtotal + cgst + sgst + igst;

    return {
        subtotal,
        cgst,
        sgst,
        igst,
        total
    };
}

// ======================================
// UPDATE TOTALS UI
// ======================================

function updateTotalsUI() {

    const totals =
        calculateInvoiceTotals();

    document.getElementById("subtotal").innerText =
        formatCurrency(totals.subtotal);

    document.getElementById("cgst").innerText =
        formatCurrency(totals.cgst);

    document.getElementById("sgst").innerText =
        formatCurrency(totals.sgst);

    document.getElementById("grandTotal").innerText =
        formatCurrency(totals.total);
}

// ======================================
// ADD ITEM
// ======================================

function addInvoiceItem() {

    const description =
        document.getElementById("itemDescription").value.trim();

    const hsn =
        document.getElementById("itemHSN").value.trim();

    const qty =
        Number(
            document.getElementById("itemQty").value
        );

    const rate =
        Number(
            document.getElementById("itemRate").value
        );

    const gst =
        Number(
            document.getElementById("itemGST").value
        );

    if (!description) {
        alert("Enter item description");
        return;
    }

    if (qty <= 0 || rate <= 0) {
        alert("Invalid quantity or rate");
        return;
    }

    invoiceItems.push({
        description,
        hsn,
        qty,
        rate,
        gst
    });

    renderItems();

    document.getElementById("itemDescription").value = "";
    document.getElementById("itemQty").value = "";
    document.getElementById("itemRate").value = "";
}

// ======================================
// REMOVE ITEM
// ======================================

function removeInvoiceItem(index) {

    invoiceItems.splice(index, 1);

    renderItems();
}

// ======================================
// RENDER ITEMS
// ======================================

function renderItems() {

    const tbody =
        document.querySelector(
            "#itemsTable tbody"
        );

    tbody.innerHTML = "";

    invoiceItems.forEach((item, index) => {

        const amount =
            item.qty * item.rate;

        tbody.innerHTML += `
        <tr>
            <td>${index + 1}</td>
            <td>${item.description}</td>
            <td>${item.hsn}</td>
            <td>${item.qty}</td>
            <td>${item.rate.toFixed(2)}</td>
            <td>${amount.toFixed(2)}</td>
            <td>
                <button onclick="removeInvoiceItem(${index})">
                    Delete
                </button>
            </td>
        </tr>
        `;
    });

    updateTotalsUI();
}

// ======================================
// CLEAR INVOICE
// ======================================

function clearInvoiceForm() {

    invoiceItems = [];

    renderItems();

    document.getElementById("customerName").value = "";
    document.getElementById("customerMobile").value = "";
    document.getElementById("customerGST").value = "";
    document.getElementById("customerAddress").value = "";

    document.getElementById("invoiceNo").value =
        peekNextInvoiceNumber();

    document.getElementById("invoiceDate").value =
        new Date().toISOString().slice(0, 10);
}

// ======================================
// CREATE INVOICE OBJECT
// ======================================

function buildInvoiceObject() {

    const totals =
        calculateInvoiceTotals();

    return {

        id:
            "INV_" +
            Date.now(),

        invoiceNo:
            generateInvoiceNumber(),

        date:
            document.getElementById(
                "invoiceDate"
            ).value,

        customerName:
            document.getElementById(
                "customerName"
            ).value,

        customerMobile:
            document.getElementById(
                "customerMobile"
            ).value,

        customerGST:
            document.getElementById(
                "customerGST"
            ).value,

        customerAddress:
            document.getElementById(
                "customerAddress"
            ).value,

        paymentTerms:
            document.getElementById(
                "paymentTerms"
            ).value,

        deliveryType:
            document.getElementById(
                "deliveryType"
            ).value,

        items: [...invoiceItems],

        subtotal:
            totals.subtotal,

        cgst:
            totals.cgst,

        sgst:
            totals.sgst,

        igst:
            totals.igst,

        total:
            totals.total
    };
}

// ======================================
// PROFESSIONAL INVOICE HTML
// ======================================

function generateInvoiceHTML(invoice) {

    const itemRows =
        invoice.items.map((item, index) => {

            const amount =
                item.qty * item.rate;

            return `
            <tr>
                <td>${index + 1}</td>
                <td>${item.description}</td>
                <td>${item.hsn}</td>
                <td>${item.qty}</td>
                <td>${item.rate.toFixed(2)}</td>
                <td>${amount.toFixed(2)}</td>
            </tr>
            `;
        }).join("");

    return `
    <div class="invoice-page">

        <div class="invoice-header">

            <div class="invoice-company">
                S S TEXTILE
            </div>

            <div class="invoice-title">
                TAX INVOICE
            </div>

        </div>

        <div class="invoice-section">

            <div class="invoice-row">

                <div class="invoice-left">

                    <strong>Billing Address</strong>

                    <br><br>

                    ${invoice.customerName}

                    <br>

                    ${invoice.customerAddress}

                    <br>

                    GST:
                    ${invoice.customerGST || "N/A"}

                </div>

                <div class="invoice-right">

                    <strong>Invoice No:</strong>
                    ${invoice.invoiceNo}

                    <br><br>

                    <strong>Date:</strong>
                    ${invoice.date}

                    <br><br>

                    <strong>Payment:</strong>
                    ${invoice.paymentTerms}

                    <br><br>

                    <strong>Delivery:</strong>
                    ${invoice.deliveryType}

                </div>

            </div>

        </div>

        <table class="invoice-table">

            <thead>

            <tr>
                <th>S.No</th>
                <th>Description</th>
                <th>HSN</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Amount</th>
            </tr>

            </thead>

            <tbody>

                ${itemRows}

            </tbody>

        </table>

        <div class="invoice-summary">

            <p>
                Subtotal :
                ${invoice.subtotal.toFixed(2)}
            </p>

            <p>
                CGST :
                ${invoice.cgst.toFixed(2)}
            </p>

            <p>
                SGST :
                ${invoice.sgst.toFixed(2)}
            </p>

            <h3>
                Total :
                ${invoice.total.toFixed(2)}
            </h3>

            <br>

            <strong>
                Amount In Words:
            </strong>

            ${numberToWords(invoice.total)}

        </div>

        <div class="invoice-bank">

            <strong>Bank Details</strong>

            <br><br>

            HDFC Bank

            <br>

            A/C No:
            50200087857010

            <br>

            IFSC:
            HDFC000095

        </div>

        <div class="invoice-footer">

            <div class="invoice-footer-left">

                Declaration:

                <br><br>

                We declare that this invoice
                shows actual value of goods
                and services supplied.

            </div>

            <div class="invoice-footer-right">

                FOR S S TEXTILE

                <div class="sign-space"></div>

                Authorized Signatory

            </div>

        </div>

    </div>
    `;
}
