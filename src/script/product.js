let categories = {};
let units = {};
let allProducts = []; // Store all fetched products
let currentPage = 1;
let itemsPerPage = 15; // Default items per page
let editingProductId = null; // Variable to track the product being edited

document.addEventListener('DOMContentLoaded', function() {
  // Initialize AutoNumeric for input fields
  const productPrice = new AutoNumeric('#product_price', { currencySymbol: 'Rp', decimalPlaces: 2 });
  const productCost = new AutoNumeric('#product_cost', { currencySymbol: 'Rp', decimalPlaces: 2 });

  // Hide form on load
  document.getElementById('form-add-data').classList.remove('active');

  // Fetch categories from backend
  fetch('http://localhost:3001/categories')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const select = document.getElementById('product_category');
        data.data.forEach(category => {
          const option = document.createElement('option');
          option.value = category.id;
          option.textContent = category.category;
          select.appendChild(option);
          categories[category.id] = category.category; // Store category in the categories object
        });
        console.log('Categories fetched and displayed successfully', data.data);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch categories',
        });
      }
    })
    .catch(error => {
      console.error('Error fetching categories:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error fetching categories',
      });
    });

  // Fetch units from backend
  fetch('http://localhost:3001/units')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const select = document.getElementById('product_unit');
        data.data.forEach(unit => {
          const option = document.createElement('option');
          option.value = unit.id;
          option.textContent = unit.unit;
          select.appendChild(option);
          units[unit.id] = unit.unit; // Store unit in the units object
        });
        console.log('Units fetched and displayed successfully', data.data);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch units',
        });
      }
    })
    .catch(error => {
      console.error('Error fetching units:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error fetching units',
      });
    });

  // Fetch data from backend
  fetch('http://localhost:3001/products')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        allProducts = data.data;
        updatePagination();
        renderTable();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch data',
        });
      }
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error fetching data',
      });
    });

  document.getElementById('page-number').addEventListener('change', (event) => {
    const page = parseInt(event.target.value);
    const totalPages = Math.ceil(allProducts.length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
      renderTable();
    }
  });

  document.getElementById('row_per_page').addEventListener('change', (event) => {
    itemsPerPage = parseInt(event.target.value);
    currentPage = 1;
    updatePagination();
    renderTable();
    });
});

// Function to update pagination controls
function updatePagination() {
  const totalPages = Math.ceil(allProducts.length / itemsPerPage);
  document.getElementById('total-pages').value = totalPages;
  document.getElementById('page-number').max = totalPages; // Update the max attribute
}

// Function to render the table based on current page and items per page
function renderTable() {
  const tbody = document.getElementById('data');
  tbody.innerHTML = ''; // Clear table content before adding new data

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = allProducts.slice(startIndex, endIndex);

  currentPageData.forEach(row => {
    const tr = document.createElement('tr');
    tr.setAttribute('data-id', row.id);

    const formattedSellingPrice = AutoNumeric.format(row.selling_price, { currencySymbol: 'Rp', decimalPlaces: 2 });
    const formattedCostOfProduct = AutoNumeric.format(row.cost_of_product, { currencySymbol: 'Rp', decimalPlaces: 2 });

    // Map category ID to category name
    const categoryName = categories[row.category] || row.category;
    // Map unit ID to unit name
    const unitName = units[row.unit] || row.unit;

    tr.innerHTML = `
      <td><input type="checkbox" class="data-checkbox" id="checkbox-${row.id}"></td>
      <td>${row.product_name}</td>
      <td>${row.product_code}</td>
      <td>${row.barcode}</td>
      <td>${categoryName}</td>
      <td>${unitName}</td>
      <td>${formattedSellingPrice}</td>
      <td>${formattedCostOfProduct}</td>
      <td>${row.product_initial_qty}</td>
      <td>
        <button class="btn btn-sm btn-light btn-light-bordered edit-button" data-id="${row.id}"><i class="fa fa-edit"></i></button>
        <button class="btn btn-sm btn-danger delete-button" data-id="${row.id}"><i class="fa fa-trash"></i></button>
      </td>`;
    tbody.appendChild(tr);

    // Add event listener for the new delete button
    tr.querySelector('.delete-button').addEventListener('click', function() {
      const productId = this.getAttribute('data-id');
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
          deleteProducts([productId], () => {
            tr.remove();
            Swal.fire(
              'Deleted!',
              'Your product has been deleted.',
              'success'
            );
          });
        }
      });
    });

    // Add event listener for the edit button
    tr.querySelector('.edit-button').addEventListener('click', function() {
      const productId = this.getAttribute('data-id');
      openFormEditData(productId);
    });
  });

  // Update the pagination controls
  updatePagination();

  // Update the page number input
  document.getElementById('page-number').value = currentPage;
}

function deleteProducts(ids, callback) {
  fetch('http://localhost:3001/products/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ ids })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      callback();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete products',
      });
    }
  })
  .catch(error => {
    console.error('Error deleting products:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Error deleting products',
    });
  });
}

function deleteSelectedProducts() {
  const selectedIds = Array.from(document.querySelectorAll('.data-checkbox:checked')).map(cb => cb.id.split('-')[1]);
  if (selectedIds.length === 0) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No products selected',
    });
    return;
  }

  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      deleteProducts(selectedIds, () => {
        selectedIds.forEach(id => {
          const row = document.querySelector(`tr[data-id="${id}"]`);
          if (row) row.remove();
        });
        Swal.fire(
          'Deleted!',
          'Your selected products have been deleted.',
          'success'
        );
      });
    }
  });
}

function insertProduct() {
  const productName = document.getElementById('product_name').value;
  const barcode = document.getElementById('product_barcode').value;
  const category = document.getElementById('product_category').value;
  const unit = document.getElementById('product_unit').value;
  const sellingPrice = AutoNumeric.getAutoNumericElement('#product_price').getNumber();
  const cost_of_product = AutoNumeric.getAutoNumericElement('#product_cost').getNumber();
  const productInitialQty = document.getElementById('product_initial_qty').value;

  if (!productName || !sellingPrice || !cost_of_product || !productInitialQty || !category || !unit) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'All required fields must be filled',
    });
    return;
  }

  const productCode = generateProductCode(productName);

  const data = {
    product_name: productName,
    product_code: productCode,
    barcode: barcode,
    category: category,
    unit: unit,
    selling_price: sellingPrice,
    cost_of_product: cost_of_product,
    product_initial_qty: productInitialQty,
  };

  // Determine if adding a new product or editing an existing one
  if (editingProductId) {
    // Update existing product
    data.id = editingProductId;
    fetch('http://localhost:3001/products/edit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Update the product in the list
        const index = allProducts.findIndex(product => product.id === editingProductId);
        allProducts[index] = { ...allProducts[index], ...data.data };
        renderTable();
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Product updated successfully',
        }).then(() => {
          editingProductId = null; // Reset editingProductId
          closeFormAddData();
          location.reload(); // Reload the page after successful update
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to update product',
        });
      }
    })
    .catch(error => {
      console.error('Error updating product:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error updating product',
      });
    });
  } else {
    // Add new product
    fetch('http://localhost:3001/products/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        allProducts.push(data.data); // Add new product to the list
        updatePagination(); // Update pagination controls
        renderTable(); // Render the table with the new product

        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Product added successfully',
        });

        document.getElementById('product_name').value = '';
        document.getElementById('product_category').value = '';
        AutoNumeric.getAutoNumericElement('#product_price').clear();
        AutoNumeric.getAutoNumericElement('#product_cost').clear();
        document.getElementById('product_initial_qty').value = '';
        document.getElementById('product_unit').value = '';
        document.getElementById('product_barcode').value = '';

        closeFormAddData();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to add product',
        });
      }
    })
    .catch(error => {
      console.error('Error adding product:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error adding product',
      });
    });
  }
}

function generateProductCode(productName) {
  const timestamp = Date.now();
  const namePart = productName.replace(/\s+/g, '').toUpperCase().slice(0, 3);
  return `${namePart}-${timestamp}`;
}

function exportTableToExcel(tableID, filename = '') {
  const table = document.getElementById(tableID);
  const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

  function s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }

  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(new Blob([s2ab(wbout)], { type: "application/octet-stream" }));
  downloadLink.download = filename ? filename + '.xlsx' : 'excel_data.xlsx';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

function exportTableToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.autoTable({
    html: '#products-table',
    theme: 'grid',
    headStyles: { fillColor: [105, 105, 105] }, // Dark gray
  });

  doc.save('products.pdf');
}

function printTable() {
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

function searchProducts() {
  const search = document.getElementById('search-data').value;

  fetch(`http://localhost:3001/products/search/${search}`)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        allProducts = data.data;
        currentPage = 1; // Reset to first page
        updatePagination();
        renderTable();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch search results',
        });
      }
    })
    .catch(error => {
      console.error('Error fetching search results:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error fetching search results',
      });
    });
}
