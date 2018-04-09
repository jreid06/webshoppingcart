
$(document).ready(function(){

    let materialIcon = {
        data: function(){
            return {

            }
        },
        template: '<i class="material-icons">{{icon}}</i>',
        props: ["icon"]
    }

    let productCard = {
        components:{
            'material-icon': materialIcon,
        },
        data: function(){
            return{
                itemadd_alert: false,
                id: '#item-add-alert-'+this.count
            }
        },
        watch: {
            itemadd_alert: function(value){
                let vm = this;
                if (value) {
                    $(vm.id).fadeIn();

                    setTimeout(function(){
                        $(vm.id).fadeOut();
                        vm.itemadd_alert = false;
                    }, 3000);
                }
            }
        },
        props: {
            product:{
                type: Object
            },
            addicon: {
                type: String
            },
            count: {
                type: Number
            }
        },
        template: '<div class="col-12 col-md-4 col-lg-3"> <div class="card product-card" style="width: 100%"> <div class="product-image-bg" :style="product.image_styles"> </div> <div class="card-body"> <h5 class="card-title">{{product.name}}</h5> <p class="card-title"><span class="font-italic text-capitalize">{{product.genre}}</span></p><p class="card-title">£{{product.price}}</p> <p class="card-text d-inline-block text-truncate" style="width: 100%">{{product.description}}</p><template v-if="product.add_ons"> <hr> <p class="text-info">Game has {{product.extras.packages.length}} add on(s)</p> <hr> </template><template v-else><hr> <p class="text-info">Game has NO add ons</p> <hr></template> <div class="product-controls"> <a href="#" class="btn btn-primary">View</a> <a href="#" class="btn btn-primary" @click.stop.prevent="addToBasket">  <span><sup>+</sup></span>  <material-icon :icon="addicon"></material-icon> </a> </div> </div> <div class="alert alert-success item-add-alert" :id="\'item-add-alert-\'+count" style="display: none" role="alert"> Item added to basket successfully !! </div></div> </div>',
        methods: {
            addToBasket: function(e){
                let vm = this,
                    exists = [false];

                main_vue.basket.items.filter(function(item, index){
                    if (item.id === vm.product.id) {
                        exists[0] = true;
                        exists[1] = index;
                    }
                })

                vm.addBasketItem(exists);

            },
            addBasketItem: function(exists){
                let vm = this;

                if (exists[0]) {
                    // add to the quantity of the item that exists
                    let pos = exists[1];
                    main_vue.basket.items[pos].quantity += 1;
                    main_vue.basket.items[pos].calculateTotal();

                    main_vue.recalculateBasketTotal();

                }else {
                    // **new item added**

                    vm.product.quantity += 1;
                    vm.product.calculateTotal();

                    main_vue.basket.items.push(vm.product);
                }

                vm.itemadd_alert = true;
            }
        }
    }

    let basketTable = {
        props: {
            basketitems: {
                type: Array,
                required: true
            }
        },
        template: '<table class="table"> <thead class="thead-dark"> <tr> <th scope="col" colspan="6">Basket items</th> </tr> </thead> <tbody> <tr v-for="(item, index) in basketitems"><th scope="row">{{item.id}}</th> <td>{{item.name}}</td> <td>{{item.genre}}</td> <td>£ {{item.price}}</td><td>{{item.quantity}}</td><td class="text-success">£ {{item.total.toFixed(2)}}</td> </tr> </tbody> </table>'
    }

    Vue.component('nav-main',{
        components: {
            'material-icon': materialIcon
        },
        data:function(){
            return {
                links: [
                    {
                        title: 'home',
                        href: 'index.html',
                        active: true,
                        styles:{
                            paddingLeft: "10px",
                            paddingRight: "10px"
                        }
                    },
                    {
                        title: 'all products',
                        href: 'all-products.html',
                        active: false,
                        styles:{
                            paddingLeft: "10px",
                            paddingRight: "10px"
                        }
                    },
                    {
                        title: 'basket',
                        icon: 'shopping_basket',
                        href: 'basket.html',
                        active: false,
                        styles:{
                            paddingLeft: "15px"
                        }
                    }
                ],
                stylesObj: {
                    justifyContent: 'right',
                    width: '100%'
                }
            }
        },
        props: {
            basketdata: {
                type: Array,
                required: true
            }
        },
        template:'<nav class="navbar navbar-expand-md navbar-light fixed-top"> <a class="navbar-brand" href="index.html"><i class="material-icons">shop</i></a> <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation"> <span class="navbar-toggler-icon"></span> </button> <div class="collapse navbar-collapse" id="navbarNav"> <ul class="navbar-nav" :style="stylesObj"> <li v-for="(nav, index) in links" class="nav-item" :class="{active: nav.active}" :style="nav.styles"> <a class="nav-link" :href="nav.href"> <template v-if="nav.icon"> <material-icon :icon="nav.icon"></material-icon> {{basketdata.length}} </template> <template v-else> {{nav.title | capitalize}} </template></a> </li> </ul> </div> </nav>'
    })

    let main_vue = new Vue({
        el:'#home',
        components: {
            'material-icon': materialIcon,
            'product-card': productCard,
            'basket-table': basketTable
        },
        data:{
            status: 'connected to Vue js',
            loaded: false,
            pathname: window.location.pathname,
            basket: {
                hasItems: false,
                items: [],
                total: 0,
                sub_total: 0,
                discount_amount: 19,
                discounted_total: 0,
                discount_status: false
            },
            test: false,
            products: []
        },
        watch:{
            loaded: function(value){
                if (value) {
                    $('.loader').fadeOut();
                }
            },
            'basket.items': function(item){
                let vm = this;

                vm.recalculateBasketTotal();
            }
        },
        computed: {
            calculateDiscount: function(){
                let vm = this;

                if (vm.basket.items.length > 3) {
                    let basket_subtotal = vm.basket.sub_total,
                        temp_discount_total = (basket_subtotal / 100) * vm.basket.discount_amount;

                    let n = Math.floor(temp_discount_total.toFixed(2).split('.').join('')),
                        discount_total = n / 100;

                    // console.log(typeof discount_total);
                    vm.basket.discounted_total = discount_total;
                }

            }
        },
        methods:{
            recalculateBasketTotal(){
                let vm = this,
                    basket_length = vm.basket.items.length,
                    basket_subtotal = 0;

                // filter through each item adding item total to sub_total variable
                vm.basket.items.filter(function(item, index){
                    item.calculateTotal();
                    basket_subtotal += item.total;
                })

                // assign the sub total & total basket amount
                vm.basket.sub_total = basket_subtotal;
                vm.basket.total = vm.basket.sub_total;

                // save basket in session storage
                sessionStorage.setItem('GAMEHUB_basket', JSON.stringify(vm.basket.items));

                // check if discount should be applied
                if (basket_length > 3) {
                    vm.calculateDiscount;
                    let total = vm.basket.sub_total - vm.basket.discounted_total;
                    vm.basket.total = total.toFixed(2);

                    if (!vm.basket.discount_status) {
                        vm.basket.discount_status = true;
                    }

                }

            },
            getProducts: function(){
                let vm = this;
                // console.log('GET PRODUCTS AJAX');
                $.getJSON('products/catalogue.json', function(response){
                    for (var i = 0; i < response.length; i++) {
                        let product = new Product(response[i].id, response[i].name, response[i].genre, response[i].platforms, response[i].price, response[i].description, response[i].pegi, response[i].main_image, response[i].images, response[i].add_ons, response[i].extras);

                        vm.products.push(product);
                    }

                    setTimeout(function(){
                        vm.loaded = true;
                    }, 600);

                })
            },
            resetBasket: function(){
                sessionStorage.removeItem('GAMEHUB_basket');

                window.location.reload();
            },
            addBasketData: function(items){
                let vm = this;
                for (var i = 0; i < items.length; i++) {
                    items[i].calculateTotal = function(){
                        this.total = this.price * this.quantity;
                    }

                    vm.basket.items.push(items[i]);
                }

            },
            getBasketData: function(){
                let vm = this;
                if (sessionStorage.getItem('GAMEHUB_basket')) {
                    let basket_items = JSON.parse(sessionStorage.getItem('GAMEHUB_basket'));
                    vm.addBasketData(basket_items);
                }else {
                    // console.log('NO BASKET SESSION EXISTS');
                }

                setTimeout(function(){
                    vm.loaded = true;
                }, 600);
            }
        },
        mounted: function(){
            let vm = this;
            vm.getBasketData();
            vm.getProducts();

        }

    })


})
