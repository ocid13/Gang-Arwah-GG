document.addEventListener('DOMContentLoaded', function() {
  // Initialize AutoNumeric for input fields
  const productPrice = new AutoNumeric('#product_price', { currencySymbol: 'Rp', decimalPlaces: 2 });
  const productCost = new AutoNumeric('#product_cost', { currencySymbol: 'Rp', decimalPlaces: 2 });

  // Menyembunyikan form tambah data saat halaman dimuat
  document.getElementById('form-add-data').classList.remove('active');

  // Fetch data from backend
  fetch('http://localhost:3001/products')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const tbody = document.getElementById('data');
        data.data.forEach(row => {
          const tr = document.createElement('tr');
          tr.setAttribute('data-id', row.id);

          // Format selling_price and cost_of_product using AutoNumeric
          const formattedSellingPrice = AutoNumeric.format(row.selling_price, { currencySymbol: 'Rp', decimalPlaces: 2 });
          const formattedCostOfProduct = AutoNumeric.format(row.cost_of_product, { currencySymbol: 'Rp', decimalPlaces: 2 });

          tr.innerHTML = `
            <td>${row.id}</td>
            <td>${row.product_name}</td>
            <td>${row.product_code}</td>
            <td>${row.barcode}</td>
            <td>${row.category}</td>
            <td>${row.unit}</td>
            <td>${formattedSellingPrice}</td>
            <td>${formattedCostOfProduct}</td>
            <td>${row.product_initial_qty}</td>
            <td>
              <button class="btn btn-sm btn-light btn-light-bordered"><i class="fa fa-edit"></i></button>
              <button class="btn btn-sm btn-danger"><i class="fa fa-trash"></i></button>
            </td>`;
          tbody.appendChild(tr);
        });
      } else {
        alert("Failed to fetch data");
      }
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      alert('Error fetching data');
    });
});

function insertProduct() {
  // Ambil nilai dari form input
  const productName = document.getElementById('product_name').value;
  const barcode = document.getElementById('product_barcode').value;
  const category = document.getElementById('product_category').value;
  const sellingPrice = AutoNumeric.getAutoNumericElement('#product_price').getNumber();
  const costOfProduct = AutoNumeric.getAutoNumericElement('#product_cost').getNumber();
  const productInitialQty = document.getElementById('product_initial_qty').value;
  const unit = document.getElementById('product_unit').value;

  // Validasi input
  if (!productName || !sellingPrice || !costOfProduct || !productInitialQty) {
    alert('All required fields must be filled');
    return;
  }

  // Generate product code based on the product name and current timestamp
  const productCode = generateProductCode(productName);

  // Buat objek data yang akan dikirim ke server
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

  // Kirim data ke server menggunakan fetch
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

      const newRow = `
        <tr data-id="${data.data.id}">
          <td>${data.data.id}</td>
          <td>${data.data.product_name}</td>
          <td>${data.data.product_code}</td>
          <td>${data.data.barcode}</td>
          <td>${data.data.category}</td>
          <td>${data.data.unit}</td>
          <td>${formattedSellingPrice}</td>
          <td>${formattedCostOfProduct}</td>
          <td>${data.data.product_initial_qty}</td>
          <td>
            <button class="btn btn-sm btn-light btn-light-bordered"><i class="fa fa-edit"></i></button>
            <button class="btn btn-sm btn-danger"><i class="fa fa-trash"></i></button>
          </td>
        </tr>`;
      document.getElementById('data').insertAdjacentHTML('beforeend', newRow);
      alert('Product added successfully');

      // Kosongkan nilai input setelah berhasil menambahkan data
      document.getElementById('product_name').value = '';
      document.getElementById('product_category').value = '';
      AutoNumeric.getAutoNumericElement('#product_price').clear();
      AutoNumeric.getAutoNumericElement('#product_cost').clear();
      document.getElementById('product_initial_qty').value = '';
      document.getElementById('product_unit').value = '';
      document.getElementById('product_barcode').value = '';

      closeFormAddData(); // Tutup form setelah berhasil menambahkan data
    } else {
      alert('Failed to add product');
    }
  })
  .catch(error => {
    console.error('Error adding product:', error);
    alert('Error adding product');
  });
}

// Function to generate a unique product code based on the product name and current timestamp
function generateProductCode(productName) {
  const timestamp = Date.now();
  const namePart = productName.replace(/\s+/g, '').toUpperCase().slice(0, 3);
  return `${namePart}-${timestamp}`;
}