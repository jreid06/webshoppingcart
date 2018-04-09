function Product(id, name, genre, platform, price, description, pegi, main_image, all_images, add_ons, extras) {
    this.id = id;
    this.name = name;
    this.genre = genre;
    this.platforms = platform;
    this.price = price;
    this.description = description;
    this.pegi = pegi;
    this.quantity = 0;
    this.total = 0;
    this.image_styles = {
        background: 'url('+main_image+')',
        backgroundSize: 'cover',
        bckgroundPosition: 'center'
    },
    this.images = all_images;
    this.add_ons = add_ons;
    this.extras = extras;
}

Product.prototype.calculateTotal = function(){
    this.total = this.price * this.quantity;
}
