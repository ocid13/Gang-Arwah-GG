const openFormAddData = () => {
  $('#form-add-data').addClass('active')
  $('#product_name').focus()
}

const closeFormAddData = () => {
  $('#form-add-data').removeClass('active')
}

const printButton = document.getElementById('print-data');
printButton.addEventListener('click', function() {
  printTable();
});