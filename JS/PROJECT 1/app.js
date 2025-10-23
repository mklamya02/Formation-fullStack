import cashRegister from "./main.js"; // pour importer la classe

const products = [ // pour stocker les produits a vendre
  { productName: "Phone", productPrice: 300 },
  { productName: "Smart TV", productPrice: 220 },
  { productName: "Gaming Console", productPrice: 150 },
];

const register1 = new cashRegister(products, []); // creer une instance de la classe cashRegister

// pour recuperer du DOM les elements suivants
const cartList = document.getElementById("cart-list");
const totalOutput = document.getElementById("total-output");
const finalOutput = document.getElementById("final-output");
const cashInput = document.getElementById("cash-input");
const payForm = document.getElementById("pay-form");
const messageBox = document.getElementById("message");

// pour afficher les elements ajoute au carte avec le prix total et la redution
function renderCart() {
  cartList.innerHTML = "";
  register1.shoppingCart.forEach((name) => {
    const li = document.createElement("li");
    li.textContent = name;
    cartList.appendChild(li);
  });

  const total = register1.calculateTotalPrice();
  const final = total > 400 ? total - 0.1 * total : total;
  totalOutput.value = `$${total}`;
  finalOutput.value = `$${final}`;
}

// pour ajouter les elements au shopping cart lors du clicks sur les buttons
document.querySelectorAll(".product-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const res = register1.addItem(btn.value);
    messageBox.textContent = res.message;
    renderCart();
  });
});

// pour gerer le processur de paiement
payForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const amount = Number(cashInput.value || 0);
  const result = register1.pay(amount);
  messageBox.textContent = result.message;
});

renderCart();
