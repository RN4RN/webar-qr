// Función para cargar los productos
async function loadProducts() {
  try {
    const response = await fetch('http://localhost:3000/api/products');
    const products = await response.json();

    const productList = document.getElementById('productList');
    productList.innerHTML = ''; // Limpiar la lista antes de llenarla

    products.forEach(product => {
      // Crear la tarjeta del producto
      const productCard = document.createElement('div');
      productCard.className = 'product-card';

      productCard.innerHTML = `
        <img src="http://localhost:3000/uploads/${product.image}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>Categoría: ${product.category}</p>
        <p>Stock: ${product.quantity}</p>
        <p>Precio: $${product.price}</p>
        <button onclick="deleteProduct('${product._id}')">Eliminar</button>
        <button onclick="editProduct('${product._id}', '${product.name}', '${product.category}', ${product.quantity}, ${product.price})">Editar</button>
      `;

      // Agregar la tarjeta al contenedor
      productList.appendChild(productCard);
    });
  } catch (error) {
    console.error('Error al cargar los productos:', error);
  }
}


// Función para agregar un producto
document.getElementById('productForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const category = document.getElementById('category').value;
  const quantity = document.getElementById('quantity').value;
  const price = document.getElementById('price').value;
  const image = document.getElementById('image').files[0];  // Obtener la imagen seleccionada

  const formData = new FormData();
  formData.append('name', name);
  formData.append('category', category);
  formData.append('quantity', quantity);
  formData.append('price', price);
  if (image) {
    formData.append('image', image);  // Añadir la imagen al FormData
  }

  try {
    await fetch('http://localhost:3000/api/products', {
      method: 'POST',
      body: formData  // Enviar el FormData al backend
    });

    loadProducts(); // Recargar los productos después de agregar uno nuevo
  } catch (error) {
    console.error('Error al agregar el producto:', error);
  }
});

// Función para eliminar un producto
async function deleteProduct(id) {
  try {
    await fetch(`http://localhost:3000/api/products/${id}`, {
      method: 'DELETE'
    });

    loadProducts(); // Recargar los productos después de eliminar uno
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
  }
}

// Función para editar un producto
async function editProduct(id, name, category, quantity, price) {
  // Mostrar el formulario de edición
  document.getElementById('editForm').style.display = 'block';
  document.getElementById('productForm').style.display = 'none';

  // Rellenar el formulario con los datos del producto
  document.getElementById('editName').value = name;
  document.getElementById('editCategory').value = category;
  document.getElementById('editQuantity').value = quantity;
  document.getElementById('editPrice').value = price;

  // Manejar la actualización del producto
  document.getElementById('editForm').onsubmit = async (e) => {
    e.preventDefault();

    const updatedProduct = {
      name: document.getElementById('editName').value,
      category: document.getElementById('editCategory').value,
      quantity: document.getElementById('editQuantity').value,
      price: document.getElementById('editPrice').value
    };

    try {
      await fetch(`http://localhost:3000/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedProduct)
      });

      loadProducts(); // Recargar los productos después de editar uno
      document.getElementById('editForm').style.display = 'none';
      document.getElementById('productForm').style.display = 'block';
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
    }
  };
}
// Variable para almacenar todos los productos y búsquedas realizadas
let productosGlobales = [];
let busquedasPrevias = [];

// Función para cargar productos y almacenarlos globalmente
async function loadProducts() {
  try {
    const response = await fetch('http://localhost:3000/api/products');
    const products = await response.json();

    productosGlobales = products;

    const productList = document.getElementById('productList');
    productList.innerHTML = ''; // Limpiar la lista antes de llenarla

    products.forEach(product => {
      agregarProductoADom(product);
    });
  } catch (error) {
    console.error('Error al cargar los productos:', error);
  }
}

// Función para buscar productos por nombre en tiempo real
function buscarProductosTiempoReal() {
  const inputBusqueda = document.getElementById('buscarProducto').value.toLowerCase();

  // Filtrar productos por nombre
  const resultados = productosGlobales.filter(product =>
    product.name.toLowerCase().includes(inputBusqueda)
  );

  // Mostrar los resultados en el DOM
  const productList = document.getElementById('productList');
  productList.innerHTML = ''; // Limpiar los productos actuales

  if (resultados.length === 0) {
    productList.innerHTML = `<p>No se encontraron productos con el nombre "${inputBusqueda}".</p>`;
  } else {
    resultados.forEach(product => {
      agregarProductoADom(product);
    });
  }

  // Actualizar las sugerencias de búsqueda
  if (inputBusqueda && !busquedasPrevias.includes(inputBusqueda)) {
    actualizarSugerencias(inputBusqueda);
  }
}

// Función auxiliar para agregar un producto al DOM
function agregarProductoADom(product) {
  const productList = document.getElementById('productList');

  const productCard = document.createElement('div');
  productCard.className = 'product-card';

  productCard.innerHTML = `
    <img src="http://localhost:3000/uploads/${product.image}" alt="${product.name}">
    <h3>${product.name}</h3>
    <p>Categoría: ${product.category}</p>
    <p>Stock: ${product.quantity}</p>
    <p>Precio: S/.${product.price}</p>
    <button onclick="deleteProduct('${product._id}')">Eliminar</button>
    <button onclick="editProduct('${product._id}', '${product.name}', '${product.category}', ${product.quantity}, ${product.price})">Editar</button>
  `;

  productList.appendChild(productCard);
}

// Función para actualizar las sugerencias de búsqueda
function actualizarSugerencias(inputBusqueda) {
  const listaSugerencias = document.getElementById('sugerenciasBusqueda');
  listaSugerencias.innerHTML = ''; // Limpiar las sugerencias actuales

  busquedasPrevias = [...new Set([inputBusqueda, ...busquedasPrevias])]; // Evitar duplicados

  busquedasPrevias.forEach(busqueda => {
    const opcion = document.createElement('div');
    opcion.className = 'sugerencia';
    opcion.textContent = busqueda;
    opcion.onclick = () => {
      document.getElementById('buscarProducto').value = busqueda;
      buscarProductosTiempoReal(); // Ejecutar búsqueda al hacer clic en la sugerencia
    };
    listaSugerencias.appendChild(opcion);
  });
}

// Llamar a cargar productos al cargar la página
loadProducts();

