import ExcelJS from "exceljs";



async function getFileFromUrl(url, name, defaultType = "image/png") {
  const response = await fetch(url);
  const data = await response.blob();
  return new File([data], name, {
    type: data.type || defaultType,
  });
}

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

const exportExcelFile = async (invoiceData, billData, invoice_db_id) => {
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
  
    let afterBillTableRowNumber = 21;
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
  
    // CONTACT TABLE HEADING
    addHeader(
      sheet,
      "A10:D10",
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
      "E10:H10",
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
  
    // CONTACT TABLE
    for (let i = 11; i <= 16; i++) {
      let row = sheet.getRow(i);
  
      if (contactDetails.vendor[i - 11])
        addHeader(
          sheet,
          `A${i}:D${i}`,
          {
            richText: [
              {
                font: { bold: true },
                text: contactDetails.vendorConstants[i - 11],
              },
              { text: contactDetails.vendor[i - 11] },
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
          `E${i}:H${i}`,
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
      if (contactDetails.customer[i - 11])
        addHeader(
          sheet,
          `E${i}:H${i}`,
          {
            richText: [
              {
                font: { bold: true },
                text: contactDetails.customerConstants[i - 11],
              },
              { text: contactDetails.customer[i - 11] },
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
          `E${i}:H${i}`,
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
  
      // if (contactDetails.customerConstants[i - 11]?.trim() === "Address:") row.height = 25
    }
  
    sheet.addConditionalFormatting({
      ref: `A${16}:H${16}`,
      rules: [
        {
          type: "expression",
          formulae: ["true"],
          style: {
            border: {
              left: { style: "thin", color: { argb: "000000" } },
              right: { style: "thin", color: { argb: "000000" } },
              bottom: { style: "thin", color: { argb: "000000" } },
            },
          },
        },
      ],
    });
    sheet.addConditionalFormatting({
      ref: `A${10}:H${10}`,
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
    sheet.addConditionalFormatting({
      ref: `A${11}:H${16}`,
      rules: [
        {
          type: "expression",
          formulae: ["true"],
          style: {
            border: {
              left: { style: "thin", color: { argb: "000000" } },
              right: { style: "thin", color: { argb: "000000" } },
            },
          },
        },
      ],
    });
  
    addHeader(
      sheet,
      "A17:H17",
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
      "A19:B20",
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
      "C19:D20",
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
      "E19:E20",
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
      "F19:F20",
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
      "G19:H20",
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
      index += 21;
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
        formula: `SUM(E${21}:E${afterBillTableRowNumber - 1})`,
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
        formula: `SUM(G${21}:H${afterBillTableRowNumber - 1})`,
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
    ).numFmt = `${'"' + currencySymbol + '"'}#,##0.00;[Red]\-"AUD"#,##0.00`;
  
    // Write the workbook to a Blob and create a download link
    const fileName = `invoice_studioclickhouse_${invoice_db_id}.xlsx`
    const data = await workbook.xlsx.writeBuffer();
    const blob = new Blob([data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      
    });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    window.URL.revokeObjectURL(url);
    return new File([blob], fileName, { type: blob.type })
    
  } catch {e => {
    return false
  }}
};

export default exportExcelFile;
