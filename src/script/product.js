let categories = {};
let units = {};

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
        alert("Failed to fetch categories");
      }
    })
    .catch(error => {
      console.error('Error fetching categories:', error);
      alert('Error fetching categories');
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
        alert("Failed to fetch units");
      }
    })
    .catch(error => {
      console.error('Error fetching units:', error);
      alert('Error fetching units');
    });

  // Fetch data from backend
  fetch('http://localhost:3001/products')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const tbody = document.getElementById('data');
        data.data.forEach(row => {
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
              <button class="btn btn-sm btn-light btn-light-bordered delete-button" data-id="${row.id}"><i class="fa fa-trash"></i></button>
            </td>`;
          tbody.appendChild(tr);

          // Add event listener for the new delete button
          tr.querySelector('.delete-button').addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this product?')) {
              deleteProducts([productId], () => tr.remove());
            }
          });
        });

        // Add event listener for select all button
        const selectAllButton = document.getElementById('select-all-button');
        if (selectAllButton) {
          selectAllButton.addEventListener('click', function() {
            const checkboxes = document.querySelectorAll('.data-checkbox');
            const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
            checkboxes.forEach(checkbox => checkbox.checked = !allChecked);
          });
        }

        // Add event listener for export to Excel button
        const exportExcelButton = document.getElementById('export-excel-button');
        if (exportExcelButton) {
          exportExcelButton.addEventListener('click', function() {
            exportTableToExcel('products-table', 'Products');
          });
        }
      } else {
        alert("Failed to fetch data");
      }
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      alert('Error fetching data');
    });
});

// Unified delete function
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
      alert('Failed to delete products');
    }
  })
  .catch(error => {
    console.error('Error deleting products:', error);
    alert('Error deleting products');
  });
}

function deleteSelectedProducts() {
  const selectedIds = Array.from(document.querySelectorAll('.data-checkbox:checked')).map(cb => cb.id.split('-')[1]);
  if (selectedIds.length === 0) {
    alert('No products selected');
    return;
  }

  if (confirm('Are you sure you want to delete the selected products?')) {
    deleteProducts(selectedIds, () => {
      selectedIds.forEach(id => {
        const row = document.querySelector(`tr[data-id="${id}"]`);
        if (row) row.remove();
      });
      alert('Products deleted successfully'); 
    });
  }
}

function insertProduct() {
  const productName = document.getElementById('product_name').value;
  const barcode = document.getElementById('product_barcode').value;
  const category = document.getElementById('product_category').value;
  const unit = document.getElementById('product_unit').value;
  const sellingPrice = AutoNumeric.getAutoNumericElement('#product_price').getNumber();
  const costOfProduct = AutoNumeric.getAutoNumericElement('#product_cost').getNumber();
  const productInitialQty = document.getElementById('product_initial_qty').value;

  if (!productName || !sellingPrice || !costOfProduct || !productInitialQty || !category || !unit) {
    alert('All required fields must be filled');
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
    cost_of_product: costOfProduct,
    product_initial_qty: productInitialQty,
  };

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
      const formattedSellingPrice = AutoNumeric.format(data.data.selling_price, { currencySymbol: 'Rp', decimalPlaces: 2 });
      const formattedCostOfProduct = AutoNumeric.format(data.data.cost_of_product, { currencySymbol: 'Rp', decimalPlaces: 2 });

      // Map category ID to category name
      const categoryName = categories[data.data.category] || data.data.category;
      // Map unit ID to unit name
      const unitName = units[data.data.unit] || data.data.unit;

      const newRow = `
        <tr data-id="${data.data.id}">
          <td><input type="checkbox" class="data-checkbox" id="checkbox-${data.data.id}"></td>
          <td>${data.data.product_name}</td>
          <td>${data.data.product_code}</td>
          <td>${data.data.barcode}</td>
          <td>${categoryName}</td>
          <td>${unitName}</td>
          <td>${formattedSellingPrice}</td>
          <td>${formattedCostOfProduct}</td>
          <td>${data.data.product_initial_qty}</td>
          <td>
            <button class="btn btn-sm btn-light btn-light-bordered delete-button" data-id="${data.data.id}"><i class="fa fa-trash"></i></button>
          </td>`;
      document.getElementById('data').insertAdjacentHTML('beforeend', newRow);
      alert('Product added successfully');

      document.getElementById('product_name').value = '';
      document.getElementById('product_category').value = '';
      AutoNumeric.getAutoNumericElement('#product_price').clear();
      AutoNumeric.getAutoNumericElement('#product_cost').clear();
      document.getElementById('product_initial_qty').value = '';
      document.getElementById('product_unit').value = '';
      document.getElementById('product_barcode').value = '';

      closeFormAddData();

      // Add event listener for the new delete button
      document.querySelector(`tr[data-id="${data.data.id}"] .delete-button`).addEventListener('click', function() {
        const tr = this.closest('tr');
        const productId = tr.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this product?')) {
          deleteProducts([productId], () => tr.remove());
        }
      });
    } else {
      alert('Failed to add product');
    }
  })
  .catch(error => {
    console.error('Error adding product:', error);
    alert('Error adding product');
  });
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
