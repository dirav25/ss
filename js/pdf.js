// ======================================
// PRINT INVOICE
// ======================================

function printInvoice(invoice) {

    const printArea =
        document.getElementById(
            "invoicePrintArea"
        );

    printArea.innerHTML =
        generateInvoiceHTML(invoice);

    window.print();
}

// ======================================
// PRINT CURRENT FORM
// ======================================

function printCurrentInvoice() {

    if (invoiceItems.length === 0) {
        alert("Add at least one item");
        return;
    }

    const invoice =
        previewInvoiceObject();

    printInvoice(invoice);
}

// ======================================
// PREVIEW OBJECT
// SAVE NAHI KARTA
// ======================================

function previewInvoiceObject() {

    const totals =
        calculateInvoiceTotals();

    return {

        invoiceNo:
            document.getElementById(
                "invoiceNo"
            ).value,

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

        items:
            [...invoiceItems],

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
// PROFESSIONAL PDF
// ======================================

async function downloadInvoicePDF(invoice) {

    const { jsPDF } = window.jspdf;

    const pdf =
        new jsPDF(
            "p",
            "mm",
            "a4"
        );

    let y = 15;

    // ==================================
    // HEADER
    // ==================================

    pdf.setFontSize(18);
    pdf.text(
        "S S TEXTILE",
        105,
        y,
        { align: "center" }
    );

    y += 8;

    pdf.setFontSize(11);

    pdf.text(
        "GST TAX INVOICE",
        105,
        y,
        { align: "center" }
    );

    y += 10;

    pdf.line(10, y, 200, y);

    y += 8;

    // ==================================
    // CUSTOMER
    // ==================================

    pdf.setFontSize(10);

    pdf.text(
        `Invoice No : ${invoice.invoiceNo}`,
        10,
        y
    );

    pdf.text(
        `Date : ${invoice.date}`,
        150,
        y
    );

    y += 8;

    pdf.text(
        `Customer : ${invoice.customerName}`,
        10,
        y
    );

    y += 6;

    pdf.text(
        `Mobile : ${invoice.customerMobile}`,
        10,
        y
    );

    y += 6;

    pdf.text(
        `GSTIN : ${invoice.customerGST || "N/A"}`,
        10,
        y
    );

    y += 6;

    const address =
        invoice.customerAddress || "";

    const splitAddress =
        pdf.splitTextToSize(
            address,
            180
        );

    pdf.text(
        splitAddress,
        10,
        y
    );

    y +=
        splitAddress.length * 5 + 5;

    // ==================================
    // ITEMS TABLE
    // ==================================

    const rows =
        invoice.items.map(item => {

            const amount =
                item.qty * item.rate;

            return [
                item.description,
                item.hsn,
                item.qty,
                item.rate.toFixed(2),
                amount.toFixed(2)
            ];
        });

    pdf.autoTable({

        startY: y,

        head: [[
            "Description",
            "HSN",
            "Qty",
            "Rate",
            "Amount"
        ]],

        body: rows,

        theme: "grid",

        styles: {
            fontSize: 9
        },

        headStyles: {
            fillColor: [30, 64, 175]
        }
    });

    y =
        pdf.lastAutoTable.finalY + 10;

    // ==================================
    // TOTALS
    // ==================================

    pdf.text(
        `Subtotal : ₹${invoice.subtotal.toFixed(2)}`,
        130,
        y
    );

    y += 6;

    pdf.text(
        `CGST : ₹${invoice.cgst.toFixed(2)}`,
        130,
        y
    );

    y += 6;

    pdf.text(
        `SGST : ₹${invoice.sgst.toFixed(2)}`,
        130,
        y
    );

    y += 6;

    pdf.setFontSize(11);

    pdf.text(
        `TOTAL : ₹${invoice.total.toFixed(2)}`,
        130,
        y
    );

    y += 10;

    // ==================================
    // AMOUNT IN WORDS
    // ==================================

    pdf.setFontSize(10);

    pdf.text(
        "Amount In Words:",
        10,
        y
    );

    y += 5;

    const amountWords =
        numberToWords(
            invoice.total
        );

    const amountLines =
        pdf.splitTextToSize(
            amountWords,
            180
        );

    pdf.text(
        amountLines,
        10,
        y
    );

    y +=
        amountLines.length * 5 + 8;

    // ==================================
    // BANK DETAILS
    // ==================================

    pdf.text(
        "Bank Details",
        10,
        y
    );

    y += 6;

    pdf.text(
        "Bank : HDFC Bank",
        10,
        y
    );

    y += 5;

    pdf.text(
        "A/C No : 50200087857010",
        10,
        y
    );

    y += 5;

    pdf.text(
        "IFSC : HDFC000095",
        10,
        y
    );

    // ==================================
    // SIGNATURE
    // ==================================

    pdf.text(
        "For S S Textile",
        145,
        y - 10
    );

    pdf.line(
        140,
        y + 12,
        195,
        y + 12
    );

    pdf.text(
        "Authorized Signatory",
        145,
        y + 18
    );

    // ==================================
    // SAVE PDF
    // ==================================

    pdf.save(
        `${invoice.invoiceNo}.pdf`
    );
}

// ======================================
// DOWNLOAD CURRENT PDF
// ======================================

function downloadCurrentPDF() {

    if (invoiceItems.length === 0) {

        alert(
            "Add at least one item"
        );

        return;
    }

    const invoice =
        previewInvoiceObject();

    downloadInvoicePDF(invoice);
}

// ======================================
// WHATSAPP SHARE
// ======================================

function shareInvoiceWhatsApp(invoice) {

    let phone =
        (invoice.customerMobile || "")
        .replace(/\D/g, "");

    if (
        phone.length === 10
    ) {
        phone = "91" + phone;
    }

    const message =

`GST Invoice

Invoice No: ${invoice.invoiceNo}

Customer: ${invoice.customerName}

Amount: ₹${invoice.total.toFixed(2)}

Thank you for doing business with S S Textile.`;

    window.open(
        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
        "_blank"
    );
}

// ======================================
// CURRENT WHATSAPP
// ======================================

function shareCurrentInvoice() {

    if (invoiceItems.length === 0) {

        alert(
            "Add at least one item"
        );

        return;
    }

    const invoice =
        previewInvoiceObject();

    shareInvoiceWhatsApp(invoice);
}
