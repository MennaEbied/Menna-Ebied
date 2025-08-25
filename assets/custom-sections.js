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
document.addEventListener('DOMContentLoaded', async function() {
    const app = document.getElementById('tisso-vison-app');
    if (!app) return;

    const collectionHandle = app.dataset.collectionHandle;
    const grid = document.getElementById('product-grid');
    const card = document.getElementById('product-card');
    const closeButton = card.querySelector('.close'); 
    const overlay = document.querySelector('.overlay-bg');

    let allProducts = [];
    let selectedColor = null;
    let selectedSize = null;

    try {
        const res = await fetch(`/collections/${collectionHandle}/products.json`);
        if (!res.ok) throw new Error("collection not found");
        const data = await res.json();
        allProducts = data.products.slice(0, 6);
    } catch (err) {
        console.error('failed to load products', err);
        grid.innerHTML = `<p style="text-align:center">Error loading products</p>`;
        return;
    }

    function openCard(product) {
        const cardBody = card.querySelector('.card-body');
        cardBody.innerHTML = `
          <div class="top-card">
            <img src="${product.featured_image || product.images[0]?.src}" alt="${product.title}"/>
            <div class="top-right">
              <span class="product-title">${product.title}</span>
              <span class="product-price">$${(product.price / 100).toFixed(2)}</span>
              <p>${product.description || 'No description available.'}</p>
            </div>
          </div>
          <div class="middle-card">
            <div class="colors">Color</div>
            <div class="color-btns"></div>
            <div class="sizes">Size</div>
            <div class="sizes-dropdown">
              <div class="selected">
                <span class="placeholder">Choose your size</span>
                <i class="fa-solid fa-chevron-down"></i>
              </div>
              <ul class="dropdown-options"></ul>
            </div>
          </div>
          <div class="bottom-card">
            <button class="add-to-cart-btn"> ADD TO CART <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="svg-icon"><path d="M5 12H19M19 12L12 19M19 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
          </div>
        `;

        const colorContainer = cardBody.querySelector('.color-btns');
        const sizeDropdown = cardBody.querySelector('.sizes-dropdown');
        const placeholder = sizeDropdown.querySelector('.placeholder');
        const optionsList = sizeDropdown.querySelector('.dropdown-options');
        const colorsNames = [...new Set(product.variants.map(v => v.option1 || v.title))];
        colorContainer.innerHTML = '';
        colorsNames.forEach(color => {
            const btn = document.createElement('button');
            btn.textContent = color;
            btn.style.borderLeft = `7px solid ${getHexColor(color)}`;
            btn.addEventListener('click', () => {
                document.querySelectorAll('.color-btns button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedColor = color;
                updateSizes(product.variants, color, optionsList, placeholder, sizeDropdown);
            });
            colorContainer.appendChild(btn);
        });

        if (colorContainer.children.length > 0) {
            colorContainer.children[0].click();
        }

        sizeDropdown.querySelector('.selected').addEventListener('click', () => {
            sizeDropdown.classList.toggle('open');
        });

        document.addEventListener('click', (e) => {
            if (!sizeDropdown.contains(e.target)) {
                sizeDropdown.classList.remove('open');
            }
        });

        card.style.display = "block";
        overlay.style.display = "block";
        document.body.style.overflow = "hidden";
    }

    function updateSizes(variants, color, list, placeholder, sizeDropdown) {
        list.innerHTML = '';
        variants.filter(v => v.option1 === color).forEach(variant => {
            const size = variant.option2 || '';
            if (size) {
                const li = document.createElement('li');
                li.textContent = size;
                li.dataset.variantId = variant.id;
                li.addEventListener('click', () => {
                    placeholder.textContent = size;
                    selectedSize = size;
                    sizeDropdown.classList.remove('open');
                });
                list.appendChild(li);
            }
        });
    }

    function closeCard() {
        card.style.display = 'none';
        overlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    closeButton?.addEventListener('click', closeCard);
    overlay?.addEventListener('click', closeCard);

    grid.innerHTML = ''; 
    allProducts.forEach(product => {
        const productEl = document.createElement('div');
        productEl.className = 'product-item';
        const imgUrl = product.featured_image || product.images[0]?.src;
        productEl.innerHTML = `
          <img src="${imgUrl}" alt="${product.title}"/>
          <button class="quick-view-btn">+</button>
        `;
        productEl.querySelector('.quick-view-btn').addEventListener('click', () => openCard(product));
        grid.appendChild(productEl);
    });
});

// color names function 
function getHexColor(colorsNames) {
    const colorPalette = { 'Black':'#000', 'White':'#fff', 'Red':'#FF0000', 'Green':'#008000', 'Blue':'#1656AD', 'Gray':'#808080', 'Brown':'#401e12', 'Navy':'#000080' };
    return colorPalette[colorsNames] || '#ccc';
}