const router = require("express").Router();
const faker = require("faker");
const { Product, Review } = require("../models/product");

// Generate fake data for the DB
// router.get("/generate-fake-data", (req, res, next) => {
//   for (let i = 0; i < 90; i++) {
//     let product = new Product();

//     product.category = faker.commerce.department();
//     product.name = faker.commerce.productName();
//     product.price = faker.commerce.price();
//     product.image = "https://via.placeholder.com/250?text=Product+Image";
//     product.reviews = [];

//     product.save();
//   }  
//   res.end();
// });

// GET all products and limit them to 9 products per page
router.get("/products", async (req, res, next) => {
  const perPage = 9;

  // return the first page by default
  const page = req.query.page || 1;

  const category = req.query.category || null;

  const setCategory = () =>{

  }

  try {
    const products = await Product.find()
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();

    res.send(products);
  } catch (err) {
    if (err) return next(err);
  };

  res.end();
});

// GET Specific product by its ID
router.get("/products/:product", async (req, res, next) => {
  try {
    const product = await Product.find({ _id: req.params.product }).exec();

    res.send(product[0]);

  } catch (err) {
    if (err) return next(err);
  };
});

// GET All reviews for a product, limited to 4 at a time
router.get("/products/:product/reviews", async (req, res, next) => {
  // Limit 4 reviews per page and return first page by default
  const perPage = 4;
  const page = req.query.page || 1;

  try {
    // let product = await Product.find({ _id: req.params.product }).populate("reviews").exec();

    const reviews = await Review.find({ productId: req.params.product }).skip(perPage * page - perPage).limit(perPage);

    res.send(reviews);

  } catch (err) {
    if (err) return next(err);
  };
  res.end();
});

// GET all reviews and limit them to 9 reviews per page
router.get("/reviews", async (req, res, next) => {
  const perPage = 9;

  // return the first page by default
  const page = req.query.page || 1;

  try {
    const reviews = await Review.find().skip(perPage * page - perPage).limit(perPage).exec();

    res.send(reviews);
  } catch (err) {
    if (err) return next(err);
  };

  res.end();
});

// GET Specific review by its ID
router.get("/reviews/:review", async (req, res, next) => {
  try {
    const review = await Review.find({ _id: req.params.review }).exec();

    res.send(review[0]);

  } catch (err) {
    if (err) return next(err);
  };
});

// POST Creates a new product in the database
router.post("/products", async (req, res, next) => {
  try {
    const newProduct = new Product();
    newProduct.category = req.body.category;
    newProduct.name = req.body.name;
    newProduct.price = req.body.price;
    newProduct.image = req.body.image;
    newProduct.reviews = [];

    newProduct.save();
    res.send(newProduct);
  } catch (err) {
    if (err) return next(err);
  };
  res.end();
});

// POST Creates a new review in the database by adding it to the correct product's 'reviews' array
router.post("/products/:product/reviews", async (req, res, next) => {
  try {
    // Create newReview
    const newReview = new Review();
    // add userName to newReview
    newReview.userName = req.body.userName;
    // add reviewText to newReview
    newReview.reviewText = req.body.reviewText;
    // set productId to product id given in the path
    newReview.productId = req.params.product;
    // save newReview
    newReview.save();

    // find product object product that the review is being added to
    const reviewedProduct = await Product.find({ _id: req.params.product }).exec();
    // push newReview to the reviewedProduct's review's array
    reviewedProduct[0].reviews.push(newReview);
    // save reviewedProduct
    reviewedProduct[0].save();

    res.send(newReview);

  } catch (err) {
    if (err) return next(err);
  };
  res.end();
});

// DELETE A product by ID
router.delete("/products/:product", async (req, res, next) => {
  try{
    const deletedProduct = await Product.findByIdAndDelete(req.params.product).exec();

    res.send(deletedProduct);
  } catch (err) {
    if (err) return next(err);
  };
  res.end();
});

// DELETE A review by ID
router.delete("/reviews/:review", async (req, res, next) => {
  try {
    // find review by Id and remove it from reviews
    const deletedReview = await Review.findByIdAndDelete(req.params.review).exec();

    // grabbing the productId from the review doc
    const productId = deletedReview.productId;

    // grabbing the product
    const reviewedProduct = await Product.find({_id: productId}).exec();

    // if product still exists, reviewId needs to be removed from product's reviews array
    if (reviewedProduct[0]) {
      // finding index of reviewId in product's reviews array and splicing to remove value from array
      const index = reviewedProduct[0].reviews.indexOf(req.params.review);
      reviewedProduct[0].reviews.splice(index, 1);

      reviewedProduct[0].save();
    };

    

    res.send(deletedReview);
   
  } catch (err) {
    if (err) return next(err);
  };
  res.end();
});


module.exports = router;