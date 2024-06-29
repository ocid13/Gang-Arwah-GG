function openProductDataPage() {
  window.open('../templates/page/product.html', '_blank')
}

function openCostumerDataPage() {
  window.open('../templates/page/data_costumer.html', '_blank')
}


document.addEventListener('DOMContentLoaded', () => {
  const productDataLink = document.querySelector('a.menu-link[onClick="openProductDataPage()"]');
  const dataCostumerLink = document.querySelector('a.menu-link[onClick="openCostumerDataPage()"]');
  if(productDataLink) {
    productDataLink.addEventListener('click', (event) => {
      event.preventDefault();
      openProductDataPage();
    });
  }
  if(dataCostumerLink) {
    dataCostumerLink.addEventListener('click', (event) => {
      event.preventDefault();
      openCostumerDataPage();
    });
  }
});
