function doGet(e) {
  // 1. SECURITY CHECK
  if (e.parameter.secret !== '************') { // Make sure this matches your secret
    return ContentService.createTextOutput("Error: Access Denied. Wrong Secret.")
      .setMimeType(ContentService.MimeType.TEXT);
  }

  // 2. FETCH DATA
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  
  // --- THE FIX ---
  // getValues() gets raw objects (Dates). 
  // getDisplayValues() gets the text exactly as it looks in the sheet ("06:20").
  var data = sheet.getDataRange().getDisplayValues(); 

  // 3. CONVERT TO CSV FORMAT
  var csvString = data.map(function(row) {
    return row.map(function(cell) {
      var cellText = cell.toString();
      cellText = cellText.replace(/"/g, '""'); // Escape double quotes
      if (cellText.search(/("|,|\n)/g) >= 0) {
        cellText = '"' + cellText + '"';
      }
      return cellText;
    }).join(",");
  }).join("\n");

  // 4. RETURN AS CSV
  return ContentService.createTextOutput(csvString)
    .setMimeType(ContentService.MimeType.CSV);
}