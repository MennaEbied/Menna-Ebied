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
     function openCard(productId) {
        const product = allProducts.find(p => p.id == productId);
        if (!product) return;
    
        const cardBody = card.querySelector('.card-body');
        const imageUrl = product.featured_image?.src || product.images[0]?.src;
        const descriptionHtml = product.body_html || '<p>No description available.</p>';
        
        // **FIX 3: Create a <select> dropdown for size in the HTML**
        cardBody.innerHTML = `
          <div class="card-info">
              <img src="${imageUrl}" alt="${product.title}" class="card-image" />
              <h3 class="card-title">${product.title}</h3>
              <p class="card-price">$${(product.price / 100).toFixed(2)}</p>
              <div class="card-description">${descriptionHtml.slice(0, 200)}</div>
              <div class="variant-selectors">
                  <div class="selector-group color-selector">
                      <label>Color</label>
                      <div class="color-options"></div>
                  </div>
                  <div class="selector-group size-selector">
                      <label>Size</label>
                      <select class="size-select"></select>
                  </div>
              </div>
              <button class="add-to-cart-btn">Add to cart <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="cart-svg-icon">
                  <path d="M5 12H19M19 12L12 19M19 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg></button>
          </div>
        `;
    
        const colorOptionsContainer = cardBody.querySelector('.color-options');
        const sizeSelect = cardBody.querySelector('.size-select');
        const colorSelector = cardBody.querySelector('.color-selector');
        const sizeSelector = cardBody.querySelector('.size-selector');
        const colorOptionInfo = product.options.find(opt => opt.name.toLowerCase() === 'color');
        const sizeOptionInfo = product.options.find(opt => opt.name.toLowerCase() === 'size');
    
        const optionsByColor = {};
        product.variants.forEach(variant => {
            const color = colorOptionInfo ? variant[ `option${colorOptionInfo.position}` ] : 'Default';
            const size = sizeOptionInfo ? variant[ `option${sizeOptionInfo.position}` ] : null;
            
            if (!optionsByColor[color]) optionsByColor[color] = [];
            if (size) optionsByColor[color].push({ size: size, id: variant.id, available: variant.available });
        });
    
        const availableColors = Object.keys(optionsByColor);
    
        if (colorOptionInfo && availableColors.length > 0 && availableColors[0] !== 'Default') {
            colorSelector.style.display = 'block';
            availableColors.forEach(color => {
                const el = document.createElement('div');
                el.className = 'color-option';
                el.textContent = color;
                el.addEventListener('click', () => {
                    document.querySelectorAll('.color-option').forEach(x => x.classList.remove('active'));
                    el.classList.add('active');
                    updateSizes(optionsByColor[color], sizeSelect);
                });
                colorOptionsContainer.appendChild(el);
            });
            colorOptionsContainer.children[0]?.click();
        } else {
            colorSelector.style.display = 'none';
            updateSizes(optionsByColor['Default'], sizeSelect);
        }
        
        if (!sizeOptionInfo) {
          sizeSelector.style.display = 'none';
        }
    
        card.style.display = 'flex';
    }
        
    function updateSizes(sizes, selectElement) {
        selectElement.innerHTML = '<option value="" disabled selected>Choose your size</option>';
        if (sizes && sizes.length > 0) {
            sizes.forEach(item => {
                const option = document.createElement('option');
                option.value = item.id;
                option.textContent = item.size;
                option.disabled = !item.available; // Disable unavailable sizes
                selectElement.appendChild(option);
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