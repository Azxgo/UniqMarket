import express from 'express'
import cors from 'cors';
import connection from './database.js'
import { productModel } from './database.js';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import path from 'path';
import { register, login, deleteUser, updateUser, getUser } from './controllers/authController.js';
import isAdmin from './middlewares/verification.js'; 
import cookieParser from 'cookie-parser';



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración Express
const app = express()

const port = process.env.port ?? 3000

// MiddleWares
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(process.cwd() + '/public'))
app.use(express.static(process.cwd() + '/public/css'))
app.use(express.static(process.cwd() + '/public/js'))

// Config Cors !Importante cuando se hostee en un servidor añadir el enlace
app.use(cors({
    origin: ["http://127.0.0.1:3000", "http://localhost:3000", "https://uniqmarket-production.up.railway.app"] // Añadir todos los orígenes necesarios
}));

app.post('/api/auth/register', register);
app.post('/api/auth/login', login); 

// Rutas
app.get("/", (req, res) => res.sendFile(process.cwd() + '/public/index.html'))
app.get("/shop", (req, res) => res.sendFile(process.cwd() + '/public/shop.html'))
app.get('/admin', isAdmin, (req,res) => res.sendFile(process.cwd() + '/admin.html'));
app.delete('/api/auth/delete', deleteUser);
app.put('/api/auth/update', updateUser);
app.get('/api/auth/user', getUser);


app.get('/products', async (req, res) => {
    try {
        const search = req.query.search || ''; // Capturamos el término de búsqueda
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const order = req.query.order || '';
        const brands = req.query.brand ? req.query.brand.split(',') : [];
        const minPrice = parseFloat(req.query.minPrice) || null;
        const maxPrice = parseFloat(req.query.maxPrice) || null;
        const categoryId = parseInt(req.query.category_id) || null;

        let orderBy = '';
        if (order === 'az') orderBy = 'ORDER BY p.name ASC';
        else if (order === 'price_desc') orderBy = 'ORDER BY p.price DESC';
        else if (order === 'price_asc') orderBy = 'ORDER BY p.price ASC';

        // Inicializar filtros
        let filters = '';
        let params = [];

        // Filtro de categoría
        if (categoryId) {
            filters += 'WHERE p.category_id = ?';
            params.push(categoryId);
        }

        // Filtro de marca
        if (brands.length > 0) {
            filters += `${filters ? ' AND' : ' WHERE'} p.brand IN (?)`;
            params.push(brands);
        }

        // Filtro de precio
        if (minPrice !== null && maxPrice !== null) {
            filters += `${filters ? ' AND' : ' WHERE'} (p.price BETWEEN ? AND ?)`
            params.push(minPrice, maxPrice);
        }

        // Filtro de búsqueda
        if (search) {
            filters += `${filters ? ' AND' : ' WHERE'} p.name LIKE ?`;
            params.push(`%${search}%`);
        }

        // Llamar al modelo con todos los filtros
        const { products, total } = await productModel.getAll(page, limit, orderBy, filters, params, '', '', search);

        // Obtener la lista de marcas para la categoría seleccionada
        let brandsListQuery = 'SELECT brand, COUNT(*) AS total FROM products p';
        if (categoryId) {
            brandsListQuery += ' WHERE p.category_id = ?';
        }
        brandsListQuery += ' GROUP BY brand';

        const [brandsList] = await connection.query(brandsListQuery, categoryId ? [categoryId] : []);

        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            products,
            totalPages,
            currentPage: page,
            brands: brandsList,
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Error fetching products' });
    }
});

//Obtener producto por id
app.get('/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const [[product]] = await connection.query(
            `
            SELECT p.product_id, p.brand, p.name, p.description, p.sku, p.price, image_url, v.name_vendor AS vendor_name
            FROM products p
            LEFT JOIN vendors v ON p.sold_by = v.vendor_id
            WHERE p.product_id = ?;
            `,
            [productId]
        );

        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.status(200).json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Error fetching product' });
    }
});

app.get('/adminProd', async (req, res) => {
    try {
      const [results] = await connection.query('SELECT * FROM products'); // Usando promesas
      res.json(results); // Devuelve el resultado como un array de objetos
    } catch (err) {
      console.error('Error fetching products:', err);
      res.status(500).json({ error: 'Failed to fetch products.' });
    }
  });

  app.get('/adminProd/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const [results] = await connection.query('SELECT * FROM products WHERE product_id = ?', [id]);
  
      if (results.length === 0) {
        res.status(404).json({ error: 'Product not found.' });
      } else {
        res.json(results[0]);
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      res.status(500).json({ error: 'Failed to fetch product.' });
    }
  });

  app.post('/adminProd', async (req, res) => {
    try {
      const { brand, name, description, sku, price, stock, category_id, sold_by, image_url } = req.body;
      const query = `
        INSERT INTO products 
        (brand, name, description, sku, price, stock, category_id, sold_by, image_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await connection.query(query, [brand, name, description, sku, price, stock, category_id, sold_by, image_url]);
      res.status(201).send('Product created successfully.');
    } catch (err) {
      console.error('Error creating product:', err);
      res.status(500).json({ error: 'Failed to create product.' });
    }
  });
  
  app.put('/adminProd/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { brand, name, description, sku, price, stock, category_id, sold_by, image_url } = req.body;
  
      const query = `
        UPDATE products 
        SET brand = ?, name = ?, description = ?, sku = ?, price = ?, stock = ?, category_id = ?, sold_by = ?, image_url = ? 
        WHERE product_id = ?
      `;
      await connection.query(query, [brand, name, description, sku, price, stock, category_id, sold_by, image_url, id]);
  
      res.send('Product updated successfully.');
    } catch (err) {
      console.error('Error updating product:', err);
      res.status(500).json({ error: 'Failed to update product.' });
    }
  });
  
  app.delete('/adminProd/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const query = 'DELETE FROM products WHERE product_id = ?';
      await connection.query(query, [id]);
      res.send('Product deleted successfully.');
    } catch (err) {
      console.error('Error deleting product:', err);
      res.status(500).json({ error: 'Failed to delete product.' });
    }
  });


app.listen(port,() => {
    console.log(`server listening on port http://localhost:${port}`)
})


