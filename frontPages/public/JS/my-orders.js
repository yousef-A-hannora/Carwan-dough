document.addEventListener("DOMContentLoaded", () => {
  const activeContainer = document.getElementById("active-orders");
  const pastContainer = document.getElementById("past-orders");

  function formatDate(dateStr) {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatStatus(status) {
    if (!status) return "";
    return status.replace("_", " ").toLowerCase();
  }

  function renderOrders(list, container, isActiveSection) {
    container.innerHTML = "";

    if (!list || list.length === 0) {
      const p = document.createElement("p");
      p.className = "empty-text";
      p.textContent = isActiveSection
        ? "You have no active orders."
        : "You have no past orders yet.";
      container.appendChild(p);
      return;
    }

    list.forEach((order) => {
      const card = document.createElement("div");
      card.className = "order-card";

      const header = document.createElement("div");
      header.className = "order-card-header";
      const left = document.createElement("div");
      left.innerHTML = `<strong>Order #${order.id}</strong><br><span class="order-meta">Delivery: ${formatDate(
        order.deliveryDate
      )}</span>`;

      const status = document.createElement("span");
      const statusLower = (order.orderStatus || "").toLowerCase();
      status.className = "order-status-badge";
      if (statusLower === "completed") status.classList.add("status-completed");
      else if (statusLower === "canceled") status.classList.add("status-canceled");
      else if (statusLower === "pending_delivery")
        status.classList.add("status-pending_delivery");
      else status.classList.add("status-pending");
      status.textContent = formatStatus(order.orderStatus);

      header.appendChild(left);
      header.appendChild(status);

      const itemsList = document.createElement("ul");
      itemsList.className = "order-items";
      if (order.orderItems && Array.isArray(order.orderItems)) {
        order.orderItems.forEach((item) => {
          const li = document.createElement("li");
          const name = item.product ? item.product.name : "Item";
          li.textContent = `${name} x${item.quantity} - ${item.price} E£`;
          itemsList.appendChild(li);
        });
      }

      const meta = document.createElement("div");
      meta.className = "order-meta";
      meta.textContent = `Total: ${order.totalPrice || 0} E£`;

      card.appendChild(header);
      card.appendChild(itemsList);
      card.appendChild(meta);

      if (isActiveSection) {
        const canCancel =
          order.orderStatus === "PENDING" ||
          order.orderStatus === "PENDING_DELIVERY";
        const actions = document.createElement("div");
        actions.className = "order-actions";

        if (canCancel) {
          const btn = document.createElement("button");
          btn.className = "cancel-order-btn";
          btn.textContent = "Cancel Order";
          btn.dataset.orderId = order.id;
          actions.appendChild(btn);
        }

        card.appendChild(actions);
      }

      container.appendChild(card);
    });
  }

  function loadOrders() {
    fetch("/api/user/order/my-orders")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load orders");
        return res.json();
      })
      .then((data) => {
        renderOrders(data.activeOrders || [], activeContainer, true);
        renderOrders(data.pastOrders || [], pastContainer, false);
      })
      .catch(() => {
        activeContainer.innerHTML =
          '<p class="empty-text">Could not load your orders. Please try again later.</p>';
        pastContainer.innerHTML = "";
      });
  }

  document.body.addEventListener("click", (e) => {
    if (e.target.classList.contains("cancel-order-btn")) {
      const orderId = e.target.dataset.orderId;
      if (!orderId) return;

      Swal.fire({
        title: "Cancel this order?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, cancel it",
        cancelButtonText: "Keep it",
      }).then((result) => {
        if (!result.isConfirmed) return;

        fetch(`/api/user/order/cancelMyOrder/${orderId}`, {
          method: "PATCH",
        })
          .then((res) => {
            if (!res.ok) {
              return res.text().then((msg) => {
                throw new Error(msg || "Failed to cancel order");
              });
            }
            Swal.fire({
              icon: "success",
              title: "Order cancelled",
              confirmButtonColor: "#c01836",
            }).then(() => {
              loadOrders();
            });
          })
          .catch((err) => {
            Swal.fire({
              icon: "error",
              title: "Cannot cancel order",
              text: err.message || "Please try again later",
              confirmButtonColor: "#c01836",
            });
          });
      });
    }
  });

  loadOrders();
});


