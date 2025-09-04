// DROPDOWN MENU

document.addEventListener('DOMContentLoaded', function(){ //this ensures that js doesn't try to find html elements before they exists
    const toggle = document.querySelector('.mobile-menu-toggle');
    const dropdown = document.getElementById('mobile-dropdown');

    if(toggle && dropdown){ //checks if toggle and dropdown are successfully found
        toggle.addEventListener('click', function(){
            this.classList.toggle('active');
            const isVisible = dropdown.style.display === 'block'
            dropdown.style.display = isVisible ? 'none' : 'block'
        })
    }
})

// FETCHING PRODUCTS
document.addEventListener('DOMContentLoaded', async function() {
    const app = document.getElementById('tisso-vison-app'); //finds the main container element
    if (!app) return;

    const collectionHandle = app.dataset.collectionHandle; //passing collection handle from liquid to js
    const grid = document.getElementById('product-grid');
    const card = document.getElementById('product-card');
    const closeButton = card.querySelector('.close'); 
    const overlay = document.querySelector('.overlay-bg');

    let allProducts = [];
    let selectedVariantId = null;


    try {
        const res = await fetch(`/collections/${collectionHandle}/products.json`);
        if (!res.ok) throw new Error("collection not found");
        const data = await res.json();
        allProducts = data.products.slice(0, 6); //returns the first 6 products
    } catch (err) {
        console.error('failed to load products', err);
        grid.innerHTML = `<p style="text-align:center">Error loading products</p>`;
        return;
    }
    function openCard(product) {
        if (!product || !product.variants || !product.variants.length === 0) {
            console.error("Invalid product data for openCard", product);
            return;
        }
    
        const cardBody = card.querySelector('.card-body');
        const firstVariant = product.variants[0];
        const imageUrl = product.featured_image || product.images[0]?.src;
        const descriptionHtml = product.body_html ? product.body_html.replace(/<[^>]*>?/gm, '') : 'No description available.'; //return plain text only
        
        cardBody.innerHTML = `
          <div class="top-card">
            <img src="${imageUrl}" alt="${product.title}"/>
            <div class="top-right">
              <span class="product-title">${product.title}</span>
              <span class="product-price">${firstVariant.price}&euro;</span>
              <p>${descriptionHtml.slice(0, 150)}</p>
            </div>
          </div>
          <div class="middle-card">
            <div class="colors-label">Color</div>
            <div class="color-btns"></div>
            <div class="sizes-label">Size</div>
            <div class="sizes-dropdown">
              <div class="selected">
                <label class="placeholder">Choose your size</label>
                <div class="arrow-container">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="dropdown-arrow-icon">
                    <path d="M19 9L12 16L5 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                </div>
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
        const colorOptionInfo = product.options.find(opt => opt.name.toLowerCase() === 'color');
        const sizeOptionInfo = product.options.find(opt => opt.name.toLowerCase() === 'size');
    
        const optionsByColor = {};
        product.variants.forEach(variant => {
            const color = colorOptionInfo ? variant[`option${colorOptionInfo.position}`] : 'Default'; // this  first finds the positionof the color option and then dynamically accesses the correct property on the variant
            const size = sizeOptionInfo ? variant[`option${sizeOptionInfo.position}`] : null;
    
            if (!optionsByColor[color]) optionsByColor[color] = [];
            if (size) optionsByColor[color].push({ size: size, id: variant.id, available: variant.available });
        });
    
        const availableColors = Object.keys(optionsByColor);
        
        if (colorOptionInfo && availableColors.length > 0 && availableColors[0] !== 'Default') {
            cardBody.querySelector('.colors-label').style.display = 'block';
            colorContainer.style.display = 'flex';
            availableColors.forEach(color => {
                const btn = document.createElement('button');
                btn.textContent = color;
                btn.style.borderLeft = `7px solid ${getHexColor(color)}`;
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.color-btns button').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    updateSizes(optionsByColor[color], optionsList, placeholder, sizeDropdown);
                });
                colorContainer.appendChild(btn);
            });
            if (colorContainer.children.length > 0) {
                //colorContainer.children[0].click();
            }
        } else {
            cardBody.querySelector('.colors-label').style.display = 'none';
            colorContainer.style.display = 'none';
            updateSizes(optionsByColor['Default'], optionsList, placeholder, sizeDropdown);
        }
        
        if (!sizeOptionInfo) {
            cardBody.querySelector('.sizes-label').style.display = 'none';
            sizeDropdown.style.display = 'none';
        }
    
        sizeDropdown.querySelector('.selected').addEventListener('click', () => {
            sizeDropdown.classList.toggle('open');
        });

        //add to cart
        const addToCartBtn = cardBody.querySelector('.add-to-cart-btn')
        addToCartBtn.addEventListener('click',()=>{
            if(!selectedVariantId){
                alert('please select a size')
                 return  
             }
            addToCartBtn.textContent = "Adding..."
            const formData ={
                'items':[{
                    'id':selectedVariantId,
                    'quantity':1
                }]
            }
            fetch('/cart/add.js',{
                method :'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(data => {
                alert('Added to cart!')
                console.log(data)
                addToCartBtn.textContent='Added!'
            })
            .catch((error)=>{
                console.error('error',error)
                addToCartBtn.textContent = 'Error'
            })
        })
    
        card.style.display = "block";
        overlay.style.display = "block";
        document.body.style.overflow = "hidden";
    }

    function updateSizes(sizes, list, placeholder, sizeDropdown) { //called whenever a new color is selected
        list.innerHTML = '';
        placeholder.textContent = 'Choose your size';
        selectedVariantId = null
        
        if (sizes && sizes.length > 0) {
            sizes.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item.size;
                li.dataset.variantId = item.id;
                    li.addEventListener('click', () => {
                        placeholder.textContent = item.size;
                        selectedVariantId = item.id
                        sizeDropdown.classList.remove('open');
                    });
                list.appendChild(li);
            });
        }
    }

    function closeCard() {
        card.style.display = 'none';
        overlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    closeButton?.addEventListener('click', closeCard);
    overlay?.addEventListener('click', closeCard);

    grid.innerHTML = ''; 
    allProducts.forEach(product => { //create element, set innerHTML, add listener
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
function getHexColor(colorNames) {
    const colorPalette = { 'Blue':'#1656AD','Black':'#000', 'White':'#fff', 'Red':'#FF0000', 'Green':'#008000',  'Gray':'#808080', 'Brown':'#401e12', 'Navy':'#000080' };
    return colorPalette[colorNames] || '#ccc';
}