// defintion de la classe cashRegister et ses methodes 
export default class cashRegister {
  constructor(productsToSell, shoppingCart) {
    this.productsToSell = productsToSell; // pour garder les elements valable pour le vendre
    this.shoppingCart = shoppingCart; // pour garder les elements choisis pour les payer apres
  }

  addItem(itemName) { // ajouter un element dans la shopping cart
    const product = this.productsToSell.find(
      (elem) => elem.productName === itemName
    );
    if (!product) {
      window.alert("we don’t sell that item");
      return { ok: false, message: "we don’t sell that item" };
    }
    this.shoppingCart.push(itemName);
    const cartCount = this.shoppingCart.length;
    const message = `The item ${itemName} was successfully added to the cart (items: ${cartCount}).`;
    console.log(message);
    window.alert(`Your products in cart are: ${this.shoppingCart.join(", ")}`);
    return { ok: true, message };
  }

  calculateTotalPrice() { // pour calculer le prix total
    let totalPrice = 0;
    this.shoppingCart.forEach((itemName) => {
      const product = this.productsToSell.find(
        (product) => product.productName === itemName
      );
      if (product) {
        totalPrice += product.productPrice;
      }
    });
    return totalPrice;
  }

  pay(paymentAmount) { // pour verfier et gerer le processus de paiment
    const total = this.calculateTotalPrice();
    const discountApplied = total > 400;
    const finalAmount = discountApplied ? total - 0.1 * total : total;
    console.log(`Total: ${total}`);
    console.log(`Final (after discount if any): ${finalAmount}`);

    if (paymentAmount >= finalAmount) {
      const change = Number((paymentAmount - finalAmount).toFixed(2));
      const successMessage =
        change > 0
          ? `Thank you for your purchase! Change: $${change}`
          : "Thank you for your purchase! Exact amount received.";
      window.alert(successMessage);
      return {
        ok: true,
        message: successMessage,
        total,
        finalAmount,
        discountApplied,
        change,
      };
    }

    const failMessage ="The customer does not have enough money to purchase the items.";
    window.alert(failMessage);
    return { ok: false, message: failMessage, total, finalAmount };
  }
}
