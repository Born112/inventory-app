const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "/";
}

// Загрузка товаров и отрисовка таблицы
async function loadProducts() {
  const res = await fetch("/products", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  const data = await res.json();
  const tbody = document.querySelector("#product-table tbody");
  tbody.innerHTML = "";

  data.forEach(p => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td>${p.quantity}</td>
      <td>${p.price}</td>
      <td>${p.description || ""}</td>
      <td>
        <button onclick="deleteProduct(${p.id})">Delete</button>
        <button onclick='showEditForm(${JSON.stringify(p)})'>Edit</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Удаление товара
async function deleteProduct(id) {
  await fetch(`/products/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  loadProducts();
}

// Показать форму редактирования с заполненными полями
function showEditForm(product) {
  document.getElementById("edit-product-form").style.display = "block";
  document.getElementById("edit-id").value = product.id;
  document.getElementById("edit-name").value = product.name;
  document.getElementById("edit-quantity").value = product.quantity;
  document.getElementById("edit-price").value = product.price;
  document.getElementById("edit-description").value = product.description || "";
}

// Обработка отправки формы редактирования
document.getElementById("edit-product-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("edit-id").value;
  const name = document.getElementById("edit-name").value;
  const quantity = parseInt(document.getElementById("edit-quantity").value, 10);
  const price = parseFloat(document.getElementById("edit-price").value);
  const description = document.getElementById("edit-description").value;

  const updatedProduct = { name, quantity, price, description };

  const res = await fetch(`/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(updatedProduct)
  });

  if (res.ok) {
    document.getElementById("edit-product-form").style.display = "none";
    loadProducts();
  } else {
    const error = await res.json();
    alert("Error updating product: " + (error.error || res.statusText));
  }
});

// Обработка добавления нового товара
document.getElementById("add-product-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const quantity = parseInt(document.getElementById("quantity").value, 10);
  const price = parseFloat(document.getElementById("price").value);
  const description = document.getElementById("description").value;

  const newProduct = { name, quantity, price, description };

  const res = await fetch("/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(newProduct)
  });

  if (res.ok) {
    // Очистить форму после успешного добавления
    document.getElementById("add-product-form").reset();
    loadProducts();
  } else {
    const error = await res.json();
    alert("Error adding product: " + (error.error || res.statusText));
  }
});

// Обработка логаута
document.getElementById("logout").addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "/";
});

// Загрузка товаров при загрузке страницы
loadProducts();