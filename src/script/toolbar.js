const openFormAddData = () => {
  $('#form-add-data').addClass('active');
  $('#product_name').focus();
  editingProductId = null; // Reset editingProductId when adding a new product
}

const closeFormAddData = () => {
  $('#form-add-data').removeClass('active');
  editingProductId = null; // Reset editingProductId when closing the form
}

const openFormEditData = (id) => {
  fetch(`http://localhost:3001/products/${id}`)
    .then(response => response.json())
    .then(data => {
      if(data.success) {
        const product = data.data[0];
        $('#product_name').val(product.product_name);
        $('#product_category').val(product.category);
        AutoNumeric.getAutoNumericElement('#product_price').set(product.selling_price);
        AutoNumeric.getAutoNumericElement('#product_cost').set(product.cost_of_product);
        $('#product_initial_qty').val(product.product_initial_qty);
        $('#product_unit').val(product.unit);
        $('#product_barcode').val(product.barcode);
        $('#form-add-data').addClass('active');
        $('#product_name').focus();
        editingProductId = id; // Set editingProductId when editing a product
      } else {
        alert('Failed to fetch product');
      }
    })
    .catch(error => {
      console.error('Error fetching product:', error);
      alert('Error fetching product');
    });
}

const searchButton = () => {
  searchProducts()
}

const exportExcel = () => {
  exportTableToExcel('products-table', 'Products');
}

const exportPDF = () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.autoTable({
      html: '#products-table',
      theme: 'grid',
      headStyles: { fillColor: [105, 105, 105] }, // Dark gray
  });

  doc.save('products.pdf');
}

const printData = () => {
  const table = document.getElementById('products-table').cloneNode(true);

  const rows = table.rows;
  for (let i = 0; i < rows.length; i++) {
      rows[i].deleteCell(0); // Remove the first cell (checkbox)
      rows[i].deleteCell(-1); // Remove the last cell (action buttons)
  }

  const newWin = window.open("");
  newWin.document.write(`
      <html>
        <head>
          <title>Print Table</title>
          <style>
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid black;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
          </style>
        </head>
        <body>
          ${table.outerHTML}
        </body>
      </html>
  `);
  newWin.document.close();
  newWin.print();
  newWin.close();
}

document.getElementById('select-all-button').addEventListener('click', () => {
  const checkboxes = document.querySelectorAll('.data-checkbox');
  const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
  checkboxes.forEach(checkbox => checkbox.checked = !allChecked);
});

const firstPage = () => {
  currentPage = 1;
  renderTable();
}

document.getElementById('prev-page').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderTable();
  }
});

document.getElementById('next-page').addEventListener('click', () => {
  const totalPages = Math.ceil(allProducts.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderTable();
  }
});

document.getElementById('last-page').addEventListener('click', () => {
  currentPage = Math.ceil(allProducts.length / itemsPerPage);
  renderTable();
});

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('export-excel-button').addEventListener('click', exportExcel);
  document.getElementById('export-pdf-button').addEventListener('click', exportPDF);
  document.getElementById('print-button').addEventListener('click', printData);
  document.getElementById('first-page').addEventListener('click', firstPage);
});

// Cashier toolbar
function closeCashier() {
  window.location.href = '../index.html';
}
