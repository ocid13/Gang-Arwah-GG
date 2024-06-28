const openFormAddData = (req) => {
  if (req == null) {
    $('#form-add-data').addClass('active')
    $('#product_name').focus()
  }else{
     fetch(`http://localhost:3001/categories/${req}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      body: null
    }).then(response => response.json())
    .then(
      data => {
       if (data.success) {
        console.log(data.data[0]);
        $('#product_name').val(data.data[0].product_name)
        $('#product_price').val(data.data[0].selling_price)
        $('#product_cost').val(data.data[0].cost_of_product)
        $('#product_initial_qty').val(data.data[0].product_initial_qty)
        $('#product_barcode').val(data.data[0].barcode)
        $('#form-add-data').addClass('active')
        $('#product_name').focus()
       }
      }
    )
   
  }
 
}

const closeFormAddData = () => {
  $('#form-add-data').removeClass('active')
}
