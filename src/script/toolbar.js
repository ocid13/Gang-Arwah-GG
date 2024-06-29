const openFormAddData = () => {
  $('#form-add-data').addClass('active')
  $('#product_name').focus()
}

const closeFormAddData = () => {
  $('#form-add-data').removeClass('active')
}

const customerOpenFormEditData = (req) => {
  fetch(`http://localhost:3001/customer/${req}`)
  .then(response => response.json())
  .then( data => {
      if (data.success) {
          $('#customer_name').val(data.data[0].nama_customer)
          $('#customer_kode').val(data.data[0].kode_customer)
          $('#id').val(data.data[0].id)
          $('#no_hp').val(data.data[0].no_hp)
          $('#form-add-data').addClass('active')
          $('#customer_name').focus()
      }
  })
 
}

const costumerSearch = () => {
  searchCustomer()
}

const customerNextPage = () =>{
  let page = parseInt($('#page-number').val())
  let totalPage = parseInt($('#total-pages').val())
  
  if (page < totalPage) {
    $('#page-number').val(page + 1)
    getCustomer()
  }
}

const customerPrevPage = () => {
  let page = parseInt($('#page-number').val())
  
  if (page > 1) {
    $('#page-number').val(page - 1)
    getCustomer()
  }
}


