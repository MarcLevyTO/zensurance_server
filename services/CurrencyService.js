const axios = require('axios');
const mcache = require('memory-cache');

exports.getRate = async rateKey => {
  const rate = mcache.get(rateKey);
  if (rate === null) {
    const response = await axios.get(
      `https://api.exchangeratesapi.io/latest?base=CAD`
    );
    Object.keys(response.data.rates).forEach(key => {
      mcache.put(key, response.data.rates[key], 36000000);
    });
    return mcache.get(rateKey);
  }
  return rate;
};

// Used to convert orders to a users local currency
exports.getExchangedOrder = async (rateKey, order) => {
  const rate = await this.getRate(rateKey);
  const newOrder = JSON.parse(JSON.stringify(order));
  newOrder.products.forEach(product => {
    product.localPrice = (rate * product.productPrice).toFixed(2);
    if (product.customizationPrice) {
      product.localCustomizationPrice = (
        rate * product.customizationPrice
      ).toFixed(2);
    }
  });
  newOrder.localTotalPrice = (rate * newOrder.total).toFixed(2);
  return newOrder;
};
