document.addEventListener('DOMContentLoaded', function() {
    const pageNumber = document.getElementById('page-number');
 

    pageNumber.value = '1';
    const rowPerPage = document.getElementById('row_per_page')

    rowPerPage.addEventListener('change', function(){
      getCustomer()                 
    })
    
    getCustomer()
});

function getCustomer(){
    fetch('http://localhost:3001/customer')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const tbody = document.getElementById('data');
                const pageNumber = document.getElementById('page-number');
                const totalPagesElem = document.getElementById('total-pages');
                const rowPerPage = document.getElementById('row_per_page');
            
                const itemsPerPage = parseInt(rowPerPage.value);
                const totalItems = data.data.length;
                const totalPages = Math.ceil(totalItems / itemsPerPage);
                totalPagesElem.value = totalPages;
               
                function showPage(page) {
                    tbody.innerHTML = ''; // Clear table content before adding new data

                    const startIndex = (page - 1) * itemsPerPage;
                    const endIndex = startIndex + itemsPerPage;
                    const currentPageData = data.data.slice(startIndex, endIndex);

                    currentPageData.forEach(row => {
                        const tr = document.createElement('tr');
                        tr.setAttribute('data-id', row.id);

                        tr.innerHTML = `
                            <td><input type="checkbox" class="data-checkbox" id="checkbox-${row.id}"></td>
                            <td>${row.nama_customer}</td>
                            <td>${row.kode_customer}</td>
                            <td>${row.no_hp}</td>
                            <td>
                                <button class="btn btn-sm btn-light btn-light-bordered" onClick="customerOpenFormEditData(${row.id})"><i class="fa fa-edit"></i></button>
                                <button class="btn btn-sm btn-danger delete-button"><i class="fa fa-trash"></i></button>
                            </td>`;

                        tbody.appendChild(tr);

                        // Add event listener for the new delete button
                        tr.querySelector('.delete-button').addEventListener('click', function() {
                            if (confirm('Are you sure you want to delete this product?')) {
                                deleteProduct(row.id, tr);
                            }
                        });
                    });
                }

                showPage(pageNumber.value);

                // Event listener for page number change
                
                // Event listener for select all checkbox if it exists
                const selectAllCheckbox = document.getElementById('select-all');
                if (selectAllCheckbox) {
                    selectAllCheckbox.addEventListener('change', function() {
                        const checkboxes = document.querySelectorAll('.data-checkbox');
                        checkboxes.forEach(checkbox => checkbox.checked = this.checked);
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
}

function searchCustomer(){
    const search = document.getElementById('search-data').value

    fetch(`http://localhost:3001/customer/search/${search}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const tbody = document.getElementById('data');
            const pageNumber = document.getElementById('page-number');
            const totalPagesElem = document.getElementById('total-pages');
            const rowPerPage = document.getElementById('row_per_page');
        
            const itemsPerPage = rowPerPage.value;
            const totalItems = data.data.length;
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            totalPagesElem.value = totalPages;
            function showPage(page) {
                tbody.innerHTML = ''; // Clear table content before adding new data

                const startIndex = (page - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const currentPageData = data.data.slice(startIndex, endIndex);

                currentPageData.forEach(row => {
                    const tr = document.createElement('tr');
                    tr.setAttribute('data-id', row.id);

                    tr.innerHTML = `
                        <td><input type="checkbox" class="data-checkbox" id="checkbox-${row.id}"></td>
                        <td>${row.nama_customer}</td>
                        <td>${row.kode_customer}</td>
                        <td>${row.no_hp}</td>
                        <td>
                            <button class="btn btn-sm btn-light btn-light-bordered" onClick="customerOpenFormEditData(${row.id})"><i class="fa fa-edit"></i></button>
                            <button class="btn btn-sm btn-danger delete-button"><i class="fa fa-trash"></i></button>
                        </td>`;

                    tbody.appendChild(tr);

                    // Add event listener for the new delete button
                    tr.querySelector('.delete-button').addEventListener('click', function() {
                        if (confirm('Are you sure you want to delete this product?')) {
                            deleteProduct(row.id, tr);
                        }
                    });
                });
            }

            showPage(pageNumber.value);
        }
    })
}

function editCustomer() {
    const customerName = document.getElementById('customer_name').value;
    const customerKode = document.getElementById('customer_kode').value;
    const noHp = document.getElementById('no_hp').value;
    const id = document.getElementById('id').value
    
    if (!customerName || !customerKode || !noHp) {
        alert('All required fields must be filled');
        return;
    }

    const data = {
        id: id,
        namaCustomer: customerName,
        kodeCostumer: customerKode,
        noHp: noHp,
    };

    fetch('http://localhost:3001/customer/edit', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            Swal.fire({
                title: 'Success!',
                text: 'Data Customer Berhasil Diubah.',
                icon: 'success',
                confirmButtonText: 'OK'
            }).then((result) => {
                if (result.isConfirmed) {
                    location.reload(); // Reload page after successful edit
                }
            });
        }
    });
}   

function deleteSelectedCostumer() {
    const selectedIds = Array.from(document.querySelectorAll('.data-checkbox:checked')).map(cb => cb.id.split('-')[1]);
    if (selectedIds.length === 0) {
      alert('No customer selected');
      return;
    }

    Swal.fire({
        title: 'Apakah Anda yakin?',
        text: "Anda tidak akan bisa mengembalikan ini!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, hapus itu!'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch('http://localhost:3001/customer/delete-multiple', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ids: selectedIds })
              })
              .then(response => response.json())
              .then(data => {
                if (data.success) {
                  selectedIds.forEach(id => {
                    const row = document.querySelector(`tr[data-id="${id}"]`);
                    if (row) row.remove();
                  });
                  Swal.fire({
                    title: 'Success!',
                    text: 'Data Customer Berhasil Diubah.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then((result) => {
                    if (result.isConfirmed) {
                        location.reload(); // Reload page after successful edit
                    }
                });
                } else {
                  alert('Failed to delete selected customer');
                }
              })
              .catch(error => {
                console.error('Error deleting products:', error);
                alert('Error deleting products');
              });
        }
    });
  }
