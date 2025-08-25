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
        cardBody.innerHTML = `
        <img src="${product.featured_image.src}" alt="${product.title}" class="card-image" />
        <div class=""card-info>
            <h3 class="card-title">${product.title}</h3>
            <p class="card-price">$${(firstVariant.price / 100).toFixed(2)}</p>
            <p class="card-description">${product.description}</p>

            <div class="variant-selectors">
                <div class="selector-group">
                    <label>color</label>
                    <div class="color-options"></div>
                </div>
                <div class="selector-group">
                     <label>size</label>
                     <select class="size-select"><option value="">choose size</option></select>
                </div>
            </div>
            <button class="add-to-cart-btn">Add to cart <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="svg-icon">
            <path d="M5 12H19M19 12L12 19M19 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg></button>
        </div>
        `
        const colorOptions = cardBody.querySelector('.color-options')
        const sizeSelect = cardBody.querySelector('.size-select')

        //EXTRACT COLORS
        const colors = [...new Set(product.variants.map(v => v.title.split('/')[0] || v.title))]
        colors.forEach(color => {
            const el = document.createElement('div')
            el.className = 'color-option'
            el.textContent = color
            el.dataset.color = color
            el.addEventListener('click', ()=>{
                document.querySelectorAll('.color-option').forEach(x =>x.classList.remove('active'))
                el.classList.add('active')
                updateSizes(product.variants, color, sizeSelect)
            })
            colorOptions.appendChild(el)
        })

        // default select first color
        if(colors.length>0){
            colorOptions.children[0].click()
        }
        
    }


    //update sizes
    function updateSizes(variants, color, selectEl){
        selectEl.innerHTML = '<option value="">choose size</option>'
        variants.filter(v=>v.title.startsWith(color)).forEach(variant=>{
            const size = variant.title.split('/')[1] || ''
            if(size){
                const option = document.createElement('option')
                option.value = variant.id
                option.textContent = size
                selectEl.appendChild(option)
            }
        })
    }
         
   // Close card
  closeButton?.addEventListener('click', () => card.style.display = 'none');
  window.addEventListener('click', e => e.target === card && (card.style.display = 'none'));

})