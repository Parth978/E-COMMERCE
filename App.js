let cart = [];
const clearCart = document.querySelector(".clear-cart");
const cartBtn = document.querySelector('.cart-btn')
const cartDOM = document.querySelector(".cart");
const cartContent = document.querySelector(".cart-content")
const productsDOM = document.querySelector('.products-center');
const cartTotal = document.querySelector(".cart-total");
const cartItems = document.querySelector(".cart-items");
const cartOverlay = document.querySelector(".cart-overlay");
const closeCartBtn = document.querySelector(".close-cart");
let btnsDOM = document.querySelectorAll('.bag-btn');
class Products {
    async getProducts() {
        try {
            let result = await fetch('Products.json');
            let data = await result.json();
            let products = data.items;
            products = products.map(item => {
                const { title, price } = item.fields;
                const { id } = item.sys;
                const image = item.fields.image.fields.file.url;
                return { title, price, id, image }
            })
            return products
        } catch (error) {
            console.log(error);
        }

    }
}

class UI {
    displayProducts(products) {
        let result = ' ';
        products.forEach(products => {
            result +=
                `<article class="product">
            <div class="img-container">
                <img src=${products.image}>
            <button class="bag-btn" data-id=${products.id}>
                <i class="fas fa-shopping-cart"></i>
                Add To Bag
            </button>
            </div>
            <h3>${products.title}</h3>
            <h4>$${products.price}</h4>
            </article>`
        });
        productsDOM.innerHTML = result;
    }

    getBagButtons() {
        const btns = [...document.querySelectorAll(".bag-btn")];
        btnsDOM = btns;
        btns.forEach(btn => {
            let id = btn.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if (inCart) {
                btn.innerText = "In Cart";
                btn.disabled = true;
            }
            else {
                btn.addEventListener('click', (e) => {
                    e.target.innerText = "In Cart";
                    e.target.disabled = true;
                    let cartItem = { ...Storage.getProduct(id), amount: 1 };
                    console.log(cartItem);
                    cart = [...cart, cartItem];
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    this.addCartItem(cartItem);
                    this.showCart();
                })
            }
        })   
    }
    setCartValues(cart){
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(items => {
            tempTotal += items.price * items.amount;
            itemsTotal += items.amount;
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
        console.log(cartItems);
    }


    addCartItem(item) {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `<img src=${item.image} alt="cartProduct">
        <div>
            <h4>${item.title}</h4>
            <h5>$${item.price}</h5>
            <span class="remove-item" data-id = {item.id}>remove</span>
        </div>
        <div>
            <i class="fas fa-chevron-up" data-id = {item.id}></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fas fa-chevron-down" data-id = {item.id}></i>
        </div>`
        cartContent.appendChild(div);
    }
     

    showCart(){
        cartOverlay.classList.add("transparentBcg");
        cartDOM.classList.add("showCart");
    }

    populate(cart){
        cart.forEach(item => {
            this.addCartItem(item);
        })
    }

    hideCart(){
        cartOverlay.classList.remove("transparentBcg");
        cartDOM.classList.remove("showCart");
    }
    setupApp( ){
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populate(cart);
        cartBtn.addEventListener('click',this.showCart);
        closeCartBtn.addEventListener('click',this.hideCart);
    }
    clearCart(){
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        while(cartContent.children.length > 0){
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();
    }

    removeItem(id){
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>
        Add To Bag`;
    } 

    getSingleButton(id){
        return btnsDOM.find(btn => btn.dataset.id === id);
    }
    cartLogic(){
        clearCart.addEventListener('click', () => {
            this.clearCart();
        });
        cartContent.addEventListener('click', e => {
            if(e.target.classList.contains("remove-item")){
                let removeItem = e.target;
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(removeItem.dataset.id);
            }
        })
    }

    
}

class Storage {
    static saveProducts(products) {
        localStorage.setItem('products', JSON.stringify(products));
    }
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id);
    }
    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    static getCart(){
        return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')) : [];
    }
}
document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    ui.setupApp();
    const products = new Products();
    products.getProducts().then(products => { ui.displayProducts(products); Storage.saveProducts(products) }).then(() => {
        ui.getBagButtons()
        ui.cartLogic()
    });

})
