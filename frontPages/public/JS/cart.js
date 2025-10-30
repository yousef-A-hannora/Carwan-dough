// // Modal functionality
// const modal = document.getElementById("payment-modal");
// const checkoutBtn = document.getElementById("checkout-btn");
// const closeModal = document.querySelector(".close-btn");
// const creditCardOption = document.getElementById("credit-card-option");
// const creditCardInfo = document.getElementById("credit-card-info");
// const placeOrderBtn = document.querySelector(".place-order-btn");

// // Credit card fields
// const cardNumber = document.getElementById("card-number");
// const expiry = document.getElementById("expiry");
// const cvv = document.getElementById("cvv");

// // Show modal on Checkout button click
// checkoutBtn.addEventListener("click", () => {
//     modal.style.display = "flex";
// });

// // Close modal
// closeModal.addEventListener("click", () => {
//     modal.style.display = "none";
// });

// // Handle payment method selection
// creditCardOption.addEventListener("change", (e) => {
//     if (e.target.checked) {
//         creditCardInfo.classList.remove("hidden");
//         // Add required attribute to card fields
//         cardNumber.setAttribute("required", "required");
//         expiry.setAttribute("required", "required");
//         cvv.setAttribute("required", "required");
//     }
// });

// document.querySelector("input[name='payment-method'][value='cash-on-delivery']")
//     .addEventListener("change", () => {
//         creditCardInfo.classList.add("hidden");
//         // Remove required attribute from card fields
//         cardNumber.removeAttribute("required");
//         expiry.removeAttribute("required");
//         cvv.removeAttribute("required");
//     });

// // Example quantity button functionality
// document.getElementById("plus-btn").addEventListener("click", () => {
//     let quantity = document.querySelector(".quantity");
//     let currentQuantity = parseInt(quantity.innerText);
//     quantity.innerText = currentQuantity + 1;
// });

// document.getElementById("minus-btn").addEventListener("click", () => {
//     let quantity = document.querySelector(".quantity");
//     let currentQuantity = parseInt(quantity.innerText);
//     if (currentQuantity > 1) {
//         quantity.innerText = currentQuantity - 1;
//     }
// });
