// DROPDOWN MENU

document.addEventListener('DOMContentLoaded', function(){
    const toggle = document.querySelector('.mobile-menu-toggle');
    const dropdown = document.getElementById('mobile-dropdown');

    if(toggle && dropdown){
        toggle.addEventListener('click', function(){
            this.classList.toggle('active');
            dropdown.style.display = dropdown.style.display === 'block'? 'none' : 'block';
        })
    }
})

// FETCHING PRODUCTS
document.addEventListener('DOMContentLoaded',async function(){
    const app = document.getElementById('tisso-vison-app')
    if(!app) return

    const collectionHandle = app.dataset.collectionHandle;
    const grid = document.getElementById('product-grid');
    const card = document.getElementById('product-card');
    const closeButton = document.querySelector('.close');

    let allProducts = []

    //fetching all products at once

    try{
        const res = await fetch(`/collections/${collectionHandle}/products.json`) 
        if(!res.ok) throw new Error("collection not found")
        const data = await res.json()
        allProducts = data.products
    }catch(err){
        console.error('failed to load products', err)
        grid.innerHTML= `<p style="text-align:center">Error loading products</p>`
        return
    }
     //open card
     function openCard(productId){
        const product = allProducts.find(p => p.id == productId)
        if(!product){
            alert('no product found ')
            return
        }
        if(!product.variants || product.variants.length ===0){
            alert("no variant available")
            return
        }
        const cardBody = card.querySelector('.card-body')
        const firstVariant = product.variants[0];
        const imageUrl = product.featured_image?.src || product.images[0]?.src 
        const descriptionHtml = product.body_html || '<p>No description available.</p>';
        cardBody.innerHTML = `
        <img src="${imageUrl}" alt="${product.title}" class="card-image" />
        <div class="card-info">
          <h3 class="card-title">${product.title}</h3>
          <p class="card-price">$${(firstVariant.price / 100).toFixed(2)}</p>
          <div class="card-description">${descriptionHtml.slice(0, 200)}</div>
          <div class="variant-selectors">
              <div class="selector-group color-selector">
                  <label>Color</label>
                  <div class="color-options"></div>
              </div>
              <div class="selector-group size-selector">
                  <label>Size</label>
                  <div class="size-options"></div>
              </div>
          </div>
          <button class="add-to-cart-btn">Add to cart <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="cart-svg-icon">
              <path d="M5 12H19M19 12L12 19M19 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg></button>
      </div>
    `;
    const colorOptionsContainer = cardBody.querySelector('.color-options');
    const sizeOptionsContainer = cardBody.querySelector('.size-options');
    const colorSelector = cardBody.querySelector('.color-selector');
    const sizeSelector = cardBody.querySelector('.size-selector');

    const options = {};
    product.variants.forEach(variant => {
        const color = variant.option1 || 'Default';
        const size = variant.option2;
        if (!options[color]) {
            options[color] = [];
        }
        if (size) {
            options[color].push(size);
        }
    });
        
    const colors = Object.keys(options);
    if (colors.length > 1 || (colors.length === 1 && colors[0] !== 'Default')) {
        colorSelector.style.display = 'block';
        colors.forEach(color => {
            const el = document.createElement('div');
            el.className = 'color-option';
            el.textContent = color;
            el.addEventListener('click', () => {
                document.querySelectorAll('.color-option').forEach(x => x.classList.remove('active'));
                el.classList.add('active');
                updateSizes(options[color], sizeOptionsContainer);
            });
            colorOptionsContainer.appendChild(el);
        });
        // Select first color by default
        if (colorOptionsContainer.children.length > 0) {
            colorOptionsContainer.children[0].click();
        }
        } else {
            colorSelector.style.display = 'none';
            updateSizes(options[colors[0]], sizeOptionsContainer);
        }

        if (options[colors[0]].length === 0) {
            sizeSelector.style.display = 'none';
        }

        card.style.display = 'flex'; 
}
    function updateSizes(sizes, container) {
        container.innerHTML = '';
        if (sizes && sizes.length > 0) {
            sizes.forEach(size => {
                const el = document.createElement('div');
                el.className = 'size-option';
                el.textContent = size;
                el.addEventListener('click', () => {
                    document.querySelectorAll('.size-option').forEach(x => x.classList.remove('active'));
                    el.classList.add('active');
                });
                container.appendChild(el);
            });
        }
    }

    //create grid
    allProducts.forEach(product => {
        const productEl = document.createElement('div')
        productEl.className = 'product-item'
        const imgUrl  = product.images[0]?.src
        productEl.innerHTML=`
        <img src="${imgUrl}" alt="${product.title}"/>
        <button class="quick-view-btn" data-id="${product.id}">+</button>
        `
        grid.appendChild(productEl)
    })
        // Open card on click
      document.querySelectorAll('.quick-view-btn').forEach(btn => {
        btn.addEventListener('click', () => openCard(btn.dataset.id));
    })

   // Close card
  closeButton?.addEventListener('click', () => card.style.display = 'none');
  window.addEventListener('click', e => e.target === card && (card.style.display = 'none'));

})