const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

// Crear una instancia de Express
const app = express();

// Configurar el puerto
const PORT = process.env.PORT || 3000;

// Middleware para habilitar CORS
app.use(cors());

// Middleware para recibir datos JSON
app.use(express.json());

// Configurar Multer para el almacenamiento de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Guardar en la carpeta 'uploads'
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nombre único de archivo
  }
});

const upload = multer({ storage: storage });

// Conectar a MongoDB Atlas (Asegúrate de usar tu propia URI de MongoDB)
mongoose.connect('mongodb+srv://grijalvauve:bh4e23´`+`3@cluster0.n9xhl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error de conexión:', err));

// Definir el esquema del producto
const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  quantity: Number,
  price: Number,
  image: String
});

// Crear el modelo de producto
const Product = mongoose.model('Product', productSchema);

// Middleware para servir archivos estáticos (como imágenes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta para obtener los productos
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ruta para agregar un nuevo producto
app.post('/api/products', upload.single('image'), async (req, res) => {
  const { name, category, quantity, price } = req.body;
  const image = req.file ? req.file.filename : null;

  const newProduct = new Product({
    name,
    category,
    quantity,
    price,
    image
  });

  try {
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Ruta para eliminar un producto
app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).send('Producto eliminado');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ruta para editar un producto
app.put('/api/products/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

