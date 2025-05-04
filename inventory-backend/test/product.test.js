import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js'; // Make sure your Express app is exported from here
import Product from '../models/Product.js';

beforeAll(async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1/test_products';
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe('Product API', () => {
  let productId;

  it('should create a new product', async () => {
    const res = await request(app).post('/api/products').send({
      name: 'Test Product',
      quantity: 10,
      category: 'Electronics',
      description: 'Test Description',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.product).toHaveProperty('_id');
    productId = res.body.product._id;
  });

  it('should fetch all products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(res.body.products.length).toBeGreaterThan(0);
  });

  it('should fetch a product by ID', async () => {
    const res = await request(app).get(`/api/products/${productId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.product._id).toBe(productId);
  });

  it('should update a product', async () => {
    const res = await request(app).put(`/api/products/${productId}`).send({
      name: 'Updated Product',
      quantity: 20,
      category: 'Electronics',
      description: 'Updated Description',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.product.name).toBe('Updated Product');
  });

  it('should delete a product', async () => {
    const res = await request(app).delete(`/api/products/${productId}`);
    expect(res.statusCode).toBe(200);
  });

  it('should return 404 for deleted product', async () => {
    const res = await request(app).get(`/api/products/${productId}`);
    expect(res.statusCode).toBe(404);
  });
});
