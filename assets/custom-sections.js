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
            if (!product || !product.variants || product.variants.length === 0) {
                console.error("Invalid product data for openCard", product);
                return;
            }
        
            const cardBody = card.querySelector('.card-body');
            const firstVariant = product.variants[0]; // Get the first variant for default info
            const imageUrl = product.featured_image || product.images[0]?.src;
            
            // **FIX for Description**: Use body_html and provide a fallback.
            const descriptionHtml = product.body_html || '<p>No description available.</p>';
        
            // **FIX for Price**: Use the variant's price, which is more reliable.
            cardBody.innerHTML = `
                <div class="top-card">
                    <img src="${imageUrl}" alt="${product.title}"  />
                </div>
                <div class="modal-content-column">
                    <h3 class="card-title">${product.title}</h3>
                    <p class="card-price">$${(firstVariant.price / 100).toFixed(2)}</p>
                    <div class="card-description">${descriptionHtml.replace(/<[^>]*>?/gm, '').slice(0, 150)}...</div>
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
                    <button class="add-to-cart-btn">Add to cart <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="cart-svg-icon"><path d="M5 12H19M19 12L12 19M19 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
                </div>
            `;
        
            const colorOptionsContainer = cardBody.querySelector('.color-options');
            const sizeSelect = cardBody.querySelector('.size-select');
            const colorSelector = cardBody.querySelector('.color-selector');
            const sizeSelector = cardBody.querySelector('.size-selector');
            
            // **FIX for Swapped Variants**: This new logic finds options by name ("Color", "Size")
            const colorOptionInfo = product.options.find(opt => opt.name.toLowerCase() === 'color');
            const sizeOptionInfo = product.options.find(opt => opt.name.toLowerCase() === 'size');
        
            const optionsByColor = {};
            product.variants.forEach(variant => {
                const color = colorOptionInfo ? variant[`option${colorOptionInfo.position}`] : 'Default';
                const size = sizeOptionInfo ? variant[`option${sizeOptionInfo.position}`] : null;
        
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
                if (colorOptionsContainer.children.length > 0) {
                    colorOptionsContainer.children[0].click();
                }
            } else {
                colorSelector.style.display = 'none';
                updateSizes(optionsByColor['Default'], sizeSelect);
            }
            
            if (!sizeOptionInfo) {
              sizeSelector.style.display = 'none';
            }
        
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