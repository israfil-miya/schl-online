import ExcelJS from "exceljs";

async function getFileFromUrl(url, name, defaultType = "image/png") {
  const response = await fetch(url);
  const data = await response.blob();
  return new File([data], name, {
    type: data.type || defaultType,
  });
}
const getTextWidth = (text, font) => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  context.font = font || getComputedStyle(document.body).font;

  return context.measureText(text).width;
};

async function addHeader(
  sheet,
  cell,
  value,
  font,
  alignment,
  borderStyle,
  fillType,
  fillOptions,
) {
  sheet.mergeCells(cell);

  if (font) sheet.getCell(cell).font = font;
  if (alignment) sheet.getCell(cell).alignment = alignment;
  if (value) sheet.getCell(cell).value = value;
  if (borderStyle) sheet.getCell(cell).border = borderStyle;

  if (fillType && fillOptions) {
    sheet.getCell(cell).fill = {
      type: fillType,
      ...fillOptions,
    };
  }
}

export default async function createInvoice(invoiceData, billData) {
  try {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("INVOICE", {
      properties: { tabColor: { argb: "FFC0000" } },
    });
    sheet.columns = [
      { width: 6.5 },
      { width: 6.5 },
      { width: 12.5 },
      { width: 28 },
      { width: 12 },
      { width: 13 },
      { width: 7 },
      { width: 5 },
    ];

    // VALUES
    const contactDetails = {
      vendor: [
        invoiceData.vendor.comapny_name,
        invoiceData.vendor.contact_person,
        invoiceData.vendor.street_address,
        invoiceData.vendor.city,
        invoiceData.vendor.contact_number,
        invoiceData.vendor.email,
      ],
      customer: [
        invoiceData.customer.client_name,
        invoiceData.customer.contact_person,
        invoiceData.customer.address,
        invoiceData.customer.contact_number,
        invoiceData.customer.email,
      ],

      vendorConstants: [
        "Company Name: ",
        "Contact Person: ",
        "Street Address: ",
        "City: ",
        "Phone: ",
        "Email: ",
      ],
      customerConstants: [
        "Company Name: ",
        "Contact Person: ",
        "Address: ",
        "Phone: ",
        "Email: ",
      ],
    };

    console.log("contactDetails", contactDetails);

    let totalFiles = 0;
    let subtotal = 0;
    const currencySymbol = invoiceData.customer.currency;
    const salesTax = 0;
    const discount = 0;
    const datetoday = new Date().toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const invoiceNo = invoiceData.customer.invoice_number;

    // ensure atleast 10 rows in bill
    if (billData.length <= 10) {
      for (let i = billData.length; i < 10; i++)
        billData.push({
          date: undefined,
          job_name: undefined,
          quantity: 0,
          total: () => 0,
          unit_price: 0,
        });
    }

    /* START OF EXCEL FILE MAIN SHEET DESIGN */

    // LOGO
    const logoCell = {
      tl: { col: 2, row: 0.5 },
      ext: { width: 210, height: 150 },
    };
    const file = await getFileFromUrl(
      "/images/NEW-SCH-logo-text-grey.png",
      "logo.png",
    );
    const logoDataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const imageId2 = workbook.addImage({
      base64: logoDataUrl,
      extension: "png",
    });
    sheet.addImage(imageId2, logoCell);

    // HEADING
    addHeader(
      sheet,
      "E2:H5",
      "INVOICE",
      {
        name: "Arial Black",
        size: 27,
        color: { argb: "595959" },
      },
      {
        vertical: "bottom",
        horizontal: "center",
      },
    );

    addHeader(
      sheet,
      "E6:H6",
      "DATE: " + datetoday,
      {
        name: "Arial",
        size: 10,
        bold: true,
      },
      {
        vertical: "middle",
        horizontal: "center",
      },
    );

    addHeader(
      sheet,
      "E7:H7",
      "INVOICE NO: " + invoiceNo,
      {
        name: "Arial",
        size: 10,
        bold: true,
      },
      {
        vertical: "middle",
        horizontal: "center",
      },
    );

    let contactTableHeadingRow = 10;
    // CONTACT TABLE HEADING
    addHeader(
      sheet,
      `A${contactTableHeadingRow}:D${contactTableHeadingRow}`,
      "VENDOR",
      {
        name: "Arial",
        size: 10,
        bold: true,
      },
      {
        vertical: "middle",
        horizontal: "center",
      },
      {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      },
      "gradient",
      {
        gradient: "angle",
        degree: 90,
        stops: [
          { position: 0, color: { argb: "D9D9D9" } },
          { position: 1, color: { argb: "FFFFFF" } },
        ],
      },
    );

    addHeader(
      sheet,
      `E${contactTableHeadingRow}:H${contactTableHeadingRow}`,
      "CUSTOMER",
      {
        name: "Arial",
        size: 10,
        bold: true,
      },
      {
        vertical: "middle",
        horizontal: "center",
      },
      {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      },
      "gradient",
      {
        gradient: "angle",
        degree: 90,
        stops: [
          { position: 0, color: { argb: "D9D9D9" } },
          { position: 1, color: { argb: "FFFFFF" } },
        ],
      },
    );
    sheet.addConditionalFormatting({
      ref: `A${contactTableHeadingRow}:H${contactTableHeadingRow}`,
      rules: [
        {
          type: "expression",
          formulae: ["true"],
          style: {
            border: {
              left: { style: "thin", color: { argb: "000000" } },
              right: { style: "thin", color: { argb: "000000" } },
              bottom: { style: "thin", color: { argb: "000000" } },
              top: { style: "thin", color: { argb: "000000" } },
            },
          },
        },
      ],
    });

    let contactTableLoopEndIndex = 0;

    let customerContactRowNeeded = [];

    let lastEnd = contactTableHeadingRow + 1;

    for (
      let i = 0;
      i <=
      (contactDetails.customer.length >= contactDetails.vendor.length
        ? contactDetails.customer.length - 1
        : contactDetails.vendor.length - 1);
      i++
    ) {
      let rowNeeded =
        Math.round(getTextWidth(contactDetails.customer?.[i]) / 210) || 1;

      contactTableLoopEndIndex += rowNeeded;
      console.log(rowNeeded, contactDetails.customer[i]);
      customerContactRowNeeded.push({
        start: lastEnd,
        end: lastEnd + rowNeeded - 1,
      });
      lastEnd += rowNeeded;
    }

    let afterContactTableRowNumber =
      contactTableHeadingRow +
      1 +
      (contactTableLoopEndIndex <= 5
        ? contactDetails.vendor.length
        : contactTableLoopEndIndex);
    let afterBillTableRowNumber = afterContactTableRowNumber + 5;

    console.log("customerContactRowNeeded", customerContactRowNeeded);
    console.log("contactTableLoopEndIndex", contactTableLoopEndIndex);

    //  // CONTACT TABLE
    for (
      let i = 0;
      i <=
      (contactTableLoopEndIndex >= contactDetails.vendor.length
        ? contactTableLoopEndIndex
        : contactDetails.vendor.length - 1);
      i++
    ) {
      let indexRow = i + contactTableHeadingRow + 1;

      console.log(i);

      console.log(
        `E${customerContactRowNeeded[i]?.start}:H${customerContactRowNeeded[i]?.end}`,
      );

      let row = sheet.getRow(indexRow);
      row.height = 17;

      if (contactDetails.vendor[i])
        addHeader(
          sheet,
          `A${indexRow}:D${indexRow}`,
          {
            richText: [
              {
                font: { bold: true },
                text: contactDetails.vendorConstants[i],
              },
              { text: contactDetails.vendor[i] },
            ],
          },
          {
            name: "Arial",
            size: 9,
          },
          {
            vertical: "middle",
            horizontal: "left",
            wrapText: true,
          },
        );
      else
        addHeader(
          sheet,
          `A${indexRow}:D${indexRow}`,
          undefined,
          {
            name: "Arial",
            size: 9,
          },
          {
            vertical: "middle",
            horizontal: "left",
            wrapText: true,
          },
        );
      if (contactDetails.customer[i] && customerContactRowNeeded[i])
        addHeader(
          sheet,
          `E${customerContactRowNeeded[i]?.start}:H${customerContactRowNeeded[i]?.end}`,
          {
            richText: [
              {
                font: { bold: true },
                text: contactDetails.customerConstants[i],
              },
              { text: contactDetails.customer[i] },
            ],
          },
          {
            name: "Arial",
            size: 9,
          },
          {
            vertical: "middle",
            horizontal: "left",
            wrapText: true,
          },
        );
      else if (customerContactRowNeeded[i])
        addHeader(
          sheet,
          `E${customerContactRowNeeded[i]?.start}:H${customerContactRowNeeded[i]?.end}`,
          undefined,
          {
            name: "Arial",
            size: 9,
          },
          {
            vertical: "middle",
            horizontal: "left",
            wrapText: true,
          },
        );
    }

    // Extra row, E - H column merge
    addHeader(
      sheet,
      `E${afterContactTableRowNumber}:H${afterContactTableRowNumber}`,
      undefined,
      {
        name: "Arial",
        size: 9,
      },
      {
        vertical: "middle",
        horizontal: "left",
        wrapText: true,
      },
      {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      },
    );
    sheet.addConditionalFormatting({
      ref: `A${contactTableHeadingRow}:H${afterContactTableRowNumber}`,
      rules: [
        {
          type: "expression",
          formulae: ["true"],
          style: {
            border: {
              left: { style: "thin", color: { argb: "000000" } },
              right: { style: "thin", color: { argb: "000000" } },
              top: { style: "thin", color: { argb: "000000" } },
              bottom: { style: "thin", color: { argb: "000000" } },
            },
          },
        },
      ],
    });

    // Contact table closing gradient
    addHeader(
      sheet,
      `A${afterContactTableRowNumber + 1}:H${afterContactTableRowNumber + 1}`,
      undefined,
      {
        name: "Arial",
        size: 10,
        bold: true,
      },
      {
        vertical: "middle",
        horizontal: "center",
      },
      {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      },
      "gradient",
      {
        gradient: "angle",
        degree: 90,
        stops: [
          { position: 0, color: { argb: "FFFFFF" } },
          { position: 1, color: { argb: "D9D9D9" } },
        ],
      },
    );

    // BILL TABLE HEADING
    addHeader(
      sheet,
      `A${afterBillTableRowNumber - 2}:B${afterBillTableRowNumber - 1}`,
      "DATE",
      {
        name: "Arial",
        size: 10,
        bold: true,
      },
      {
        vertical: "middle",
        horizontal: "center",
      },
      {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      },
      "gradient",
      {
        gradient: "angle",
        degree: 90,
        stops: [
          { position: 0, color: { argb: "D9D9D9" } },
          { position: 1, color: { argb: "FFFFFF" } },
        ],
      },
    );

    addHeader(
      sheet,
      `C${afterBillTableRowNumber - 2}:D${afterBillTableRowNumber - 1}`,
      "JOB NAME",
      {
        name: "Arial",
        size: 10,
        bold: true,
      },
      {
        vertical: "middle",
        horizontal: "center",
      },
      {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      },
      "gradient",
      {
        gradient: "angle",
        degree: 90,
        stops: [
          { position: 0, color: { argb: "D9D9D9" } },
          { position: 1, color: { argb: "FFFFFF" } },
        ],
      },
    );

    addHeader(
      sheet,
      `E${afterBillTableRowNumber - 2}:E${afterBillTableRowNumber - 1}`,
      "QUANTITY",
      {
        name: "Arial",
        size: 10,
        bold: true,
      },
      {
        vertical: "middle",
        horizontal: "center",
      },
      {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      },
      "gradient",
      {
        gradient: "angle",
        degree: 90,
        stops: [
          { position: 0, color: { argb: "D9D9D9" } },
          { position: 1, color: { argb: "FFFFFF" } },
        ],
      },
    );

    addHeader(
      sheet,
      `F${afterBillTableRowNumber - 2}:F${afterBillTableRowNumber - 1}`,
      "UNIT PRICE",
      {
        name: "Arial",
        size: 10,
        bold: true,
      },
      {
        vertical: "middle",
        horizontal: "center",
      },
      {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      },
      "gradient",
      {
        gradient: "angle",
        degree: 90,
        stops: [
          { position: 0, color: { argb: "D9D9D9" } },
          { position: 1, color: { argb: "FFFFFF" } },
        ],
      },
    );

    addHeader(
      sheet,
      `G${afterBillTableRowNumber - 2}:H${afterBillTableRowNumber - 1}`,
      "TOTAL",
      {
        name: "Arial",
        size: 10,
        bold: true,
      },
      {
        vertical: "middle",
        horizontal: "center",
      },
      {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      },
      "gradient",
      {
        gradient: "angle",
        degree: 90,
        stops: [
          { position: 0, color: { argb: "D9D9D9" } },
          { position: 1, color: { argb: "FFFFFF" } },
        ],
      },
    );

    billData.forEach((data, index) => {
      index = afterBillTableRowNumber;
      let row = sheet.getRow(index);
      row.height = 20;

      addHeader(
        sheet,
        `A${index}:B${index}`,
        data.date,
        {
          name: "Arial",
          size: 9,
        },
        {
          vertical: "middle",
          horizontal: "center",
        },
        {
          top: { style: "thin", color: { argb: "000000" } },
          left: { style: "thin", color: { argb: "000000" } },
          bottom: { style: "thin", color: { argb: "000000" } },
          right: { style: "thin", color: { argb: "000000" } },
        },
      );
      addHeader(
        sheet,
        `C${index}:D${index}`,
        data.job_name,
        {
          name: "Arial",
          size: 9,
        },
        {
          vertical: "middle",
          horizontal: "left",
          wrapText: true,
        },
        {
          top: { style: "thin", color: { argb: "000000" } },
          left: { style: "thin", color: { argb: "000000" } },
          bottom: { style: "thin", color: { argb: "000000" } },
          right: { style: "thin", color: { argb: "000000" } },
        },
      );
      addHeader(
        sheet,
        `E${index}`,
        data.quantity,
        {
          name: "Arial",
          size: 9,
        },
        {
          vertical: "middle",
          horizontal: "center",
        },
        {
          top: { style: "thin", color: { argb: "000000" } },
          left: { style: "thin", color: { argb: "000000" } },
          bottom: { style: "thin", color: { argb: "000000" } },
          right: { style: "thin", color: { argb: "000000" } },
        },
      );
      addHeader(
        sheet,
        `F${index}`,
        data.unit_price,
        {
          name: "Arial",
          size: 9,
        },
        {
          vertical: "middle",
          horizontal: "center",
        },
        {
          top: { style: "thin", color: { argb: "000000" } },
          left: { style: "thin", color: { argb: "000000" } },
          bottom: { style: "thin", color: { argb: "000000" } },
          right: { style: "thin", color: { argb: "000000" } },
        },
      );
      addHeader(
        sheet,
        `G${index}:H${index}`,
        { formula: `E${index}*F${index}`, result: data.total() },
        {
          name: "Arial",
          size: 9,
        },
        {
          vertical: "middle",
          horizontal: "center",
        },
        {
          top: { style: "thin", color: { argb: "000000" } },
          left: { style: "thin", color: { argb: "000000" } },
          bottom: { style: "thin", color: { argb: "000000" } },
          right: { style: "thin", color: { argb: "000000" } },
        },
      );

      sheet.getCell(`A${index}:B${index}`).numFmt = "dd/mm/yyyy";
      sheet.getCell(`F${index}`).numFmt = `${
        '"' + currencySymbol + '"'
      }#,##0.00;[Red]\-"AUD"#,##0.00`;
      sheet.getCell(`G${index}:H${index}`).numFmt = `${
        '"' + currencySymbol + '"'
      }#,##0.00;[Red]\-"AUD"#,##0.00`;

      totalFiles += data.quantity;
      subtotal += data.total();
      afterBillTableRowNumber++;
    });

    // Empty Bill Row
    addHeader(
      sheet,
      `A${afterBillTableRowNumber}:B${afterBillTableRowNumber}`,
      undefined,
      {
        name: "Arial",
        size: 9,
      },
      {
        vertical: "middle",
        horizontal: "left",
        wrapText: true,
      },
      {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      },
      "gradient",
      {
        gradient: "angle",
        degree: 90,
        stops: [
          { position: 0, color: { argb: "D9D9D9" } },
          { position: 1, color: { argb: "FFFFFF" } },
        ],
      },
    );
    addHeader(
      sheet,
      `C${afterBillTableRowNumber}:D${afterBillTableRowNumber}`,
      "TOTAL FILES",
      {
        name: "Arial",
        size: 9,
        bold: true,
      },
      {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      },
      {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      },
      "gradient",
      {
        gradient: "angle",
        degree: 90,
        stops: [
          { position: 0, color: { argb: "D9D9D9" } },
          { position: 1, color: { argb: "FFFFFF" } },
        ],
      },
    );
    addHeader(
      sheet,
      `E${afterBillTableRowNumber}`,
      {
        formula: `SUM(E${afterContactTableRowNumber + 5}:E${
          afterBillTableRowNumber - 1
        })`,
        result: totalFiles,
      },
      {
        name: "Arial",
        size: 9,
        bold: true,
      },
      {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      },
      {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      },
      "gradient",
      {
        gradient: "angle",
        degree: 90,
        stops: [
          { position: 0, color: { argb: "D9D9D9" } },
          { position: 1, color: { argb: "FFFFFF" } },
        ],
      },
    );
    addHeader(
      sheet,
      `F${afterBillTableRowNumber}`,
      undefined,
      {
        name: "Arial",
        size: 9,
      },
      {
        vertical: "middle",
        horizontal: "left",
        wrapText: true,
      },
      {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      },
      "gradient",
      {
        gradient: "angle",
        degree: 90,
        stops: [
          { position: 0, color: { argb: "D9D9D9" } },
          { position: 1, color: { argb: "FFFFFF" } },
        ],
      },
    );
    addHeader(
      sheet,
      `G${afterBillTableRowNumber}:H${afterBillTableRowNumber}`,
      undefined,
      {
        name: "Arial",
        size: 9,
      },
      {
        vertical: "middle",
        horizontal: "left",
        wrapText: true,
      },
      {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      },
      "gradient",
      {
        gradient: "angle",
        degree: 90,
        stops: [
          { position: 0, color: { argb: "D9D9D9" } },
          { position: 1, color: { argb: "FFFFFF" } },
        ],
      },
    );

    addHeader(
      sheet,
      `A${afterBillTableRowNumber + 2}:D${afterBillTableRowNumber + 4}`,
      "Please make the payment available within 5 business days from the receipt of this Invoice.",
      {
        name: "Arial",
        size: 9,
      },
      {
        vertical: "middle",
        horizontal: "left",
        wrapText: true,
      },
    );

    addHeader(
      sheet,
      `F${afterBillTableRowNumber + 1}`,
      "SUBTOTAL",
      {
        name: "Arial",
        size: 9,
        bold: true,
        color: { argb: "595959" },
      },
      {
        vertical: "middle",
        horizontal: "right",
      },
    );
    addHeader(
      sheet,
      `G${afterBillTableRowNumber + 1}:H${afterBillTableRowNumber + 1}`,
      {
        formula: `SUM(G${afterContactTableRowNumber + 5}:H${
          afterBillTableRowNumber - 1
        })`,
        result: subtotal,
      },
      {
        name: "Arial",
        size: 9,
      },
      {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      },
      {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      },
      "gradient",
      {
        gradient: "angle",
        degree: 90,
        stops: [
          { position: 0, color: { argb: "D9D9D9" } },
          { position: 1, color: { argb: "FFFFFF" } },
        ],
      },
    );
    sheet.getCell(
      `G${afterBillTableRowNumber + 1}:H${afterBillTableRowNumber + 1}`,
    ).numFmt = `${'"' + currencySymbol + '"'}#,##0.00;[Red]\-"AUD"#,##0.00`;

    addHeader(
      sheet,
      `F${afterBillTableRowNumber + 2}`,
      "DISCOUNT",
      {
        name: "Arial",
        size: 9,
        bold: true,
        color: { argb: "595959" },
      },
      {
        vertical: "middle",
        horizontal: "right",
      },
    );
    addHeader(
      sheet,
      `G${afterBillTableRowNumber + 2}:H${afterBillTableRowNumber + 2}`,
      {
        formula: `G${afterBillTableRowNumber + 1}*${discount}`,
        result: subtotal * discount,
      },
      {
        name: "Arial",
        size: 9,
      },
      {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      },
      {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      },
      "gradient",
      {
        gradient: "angle",
        degree: 90,
        stops: [
          { position: 0, color: { argb: "D9D9D9" } },
          { position: 1, color: { argb: "FFFFFF" } },
        ],
      },
    );
    sheet.getCell(
      `G${afterBillTableRowNumber + 2}:H${afterBillTableRowNumber + 2}`,
    ).numFmt = `${'"' + currencySymbol + '"'}#,##0.00;[Red]\-"AUD"#,##0.00`;

    addHeader(
      sheet,
      `F${afterBillTableRowNumber + 3}`,
      "SALES TAX.",
      {
        name: "Arial",
        size: 9,
        bold: true,
        color: { argb: "595959" },
      },
      {
        vertical: "middle",
        horizontal: "right",
      },
    );
    addHeader(
      sheet,
      `G${afterBillTableRowNumber + 3}:H${afterBillTableRowNumber + 3}`,
      {
        formula: `G${afterBillTableRowNumber + 1}*${salesTax}`,
        result: subtotal * salesTax,
      },
      {
        name: "Arial",
        size: 9,
      },
      {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      },
      {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      },
      "gradient",
      {
        gradient: "angle",
        degree: 90,
        stops: [
          { position: 0, color: { argb: "D9D9D9" } },
          { position: 1, color: { argb: "FFFFFF" } },
        ],
      },
    );
    sheet.getCell(
      `G${afterBillTableRowNumber + 3}:H${afterBillTableRowNumber + 3}`,
    ).numFmt = `${'"' + currencySymbol + '"'}#,##0.00;[Red]\-"AUD"#,##0.00`;

    addHeader(
      sheet,
      `F${afterBillTableRowNumber + 4}`,
      "GRAND TOTAL",
      {
        name: "Arial",
        size: 9,
        bold: true,
      },
      {
        vertical: "middle",
        horizontal: "right",
      },
    );
    addHeader(
      sheet,
      `G${afterBillTableRowNumber + 4}:H${afterBillTableRowNumber + 4}`,
      {
        formula: `(G${afterBillTableRowNumber + 1}-G${
          afterBillTableRowNumber + 2
        }+G${afterBillTableRowNumber + 3})`,
        result: salesTax * subtotal + subtotal - subtotal * discount,
      },
      {
        name: "Arial",
        size: 9,
        bold: true,
      },
      {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      },
      {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      },
      "gradient",
      {
        gradient: "angle",
        degree: 90,
        stops: [
          { position: 0, color: { argb: "D9D9D9" } },
          { position: 1, color: { argb: "FFFFFF" } },
        ],
      },
    );
    sheet.getCell(
      `G${afterBillTableRowNumber + 4}:H${afterBillTableRowNumber + 4}`,
    ).numFmt = `${'"' + currencySymbol + '"'}#,##0.00;[Red]\-${
      '"' + currencySymbol + '"'
    }#,##0.00`;

    // To visualize the toast.promise() function on generating the invoice
    // await new Promise((resolve) => {
    //   setTimeout(resolve, 5000);
    // });

    // Write the workbook to a Blob and create a download link
    const fileName = `invoice_studioclickhouse_${invoiceData.customer.invoice_number}.xlsx`;
    const data = await workbook.xlsx.writeBuffer();
    console.log(data);
    const blob = new Blob([data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    window.URL.revokeObjectURL(url);

    return new File([blob], fileName, { type: blob.type });
  } catch {
    (error) => {
      console.error("Error generating invoice: ", error);
      return false;
    };
  }
}
