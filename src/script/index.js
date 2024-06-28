function openProductDataPage() {
  window.open('../templates/page/product.html', '_blank')
}

document.addEventListener('DOMContentLoaded', () => {
  const productDataLink = document.querySelector('a.menu-link[onClick="openProductDataPage()"]');
  if(productDataLink) {
    productDataLink.addEventListener('click', (event) => {
      event.preventDefault();
      openProductDataPage();
    });
  }
});
