const mongoose = require('mongoose');
const PRODUCT = require('./product');

const db = mongoose.connection;
// connect with local mongodb
mongoose.connect('mongodb://localhost:27017/products', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// create a new product
const product = new PRODUCT();
product.name = '';
product.category = 'Computers';
product.code = '123';
product.quantity = '-5';
// Save Product to Database
product.save((error, document) => {
  // check for errors
  const errors = getErrors(error);
  // Send Errors to browser
  console.log(errors);
});
function getErrors(error) {
  const errorArray = [];
  if (error) {
    if (error.errors.category) {
      console.log(error.errors.category.message);
      errorArray.push('category');
    }
    if (error.errors.name) {
      console.log(error.errors.name.message);
      errorArray.push('name');
    }
    if (error.errors.code) {
      console.log(error.errors.code.message);
      errorArray.push('code');
    }
    if (error.errors.quantity) {
      console.log(error.errors.quantity.message);
      errorArray.push('quantity');
    }
  } else {
    console.log('No Errors Product Saved Succefully');
  }
  return errorArray;
}
