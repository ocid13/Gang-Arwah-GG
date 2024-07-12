function openProductDataPage() {
  window.open('../templates/page/product.html', '_blank')
}

function openCashierPage() {
  window.open('../templates/page/cashier.html', '_blank')
}

document.addEventListener('DOMContentLoaded', () => {
  const productDataLink = document.querySelector('a.menu-link[onClick="openProductDataPage()"]');
  const cashierLink = document.querySelector('a.menu-link[onClick="openCashierPage()"]');
  if(productDataLink) {
    productDataLink.addEventListener('click', (event) => {
      event.preventDefault();
      openProductDataPage();
    });
  }
  if(cashierLink) {
    cashierLink.addEventListener('click', (event) => {
      event.preventDefault();
      openCashierPage();
    })
  }
});

