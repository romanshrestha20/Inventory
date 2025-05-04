// test/app.test.js
import request from 'supertest'; 
import { expect } from 'chai';  // <-- Import only expect from Chai
import app from '../app.js';  // Import your app

describe('GET /api/hello', () => {
  it('should return Hello, World!', async () => {
    const response = await request(app).get('/api/hello');
    
    // Assert that the response status is 200
    expect(response.status).to.equal(200);  // Use .to.equal() in Chai
    
    // Assert that the response body matches the expected message
    expect(response.body.message).to.equal('Hello, World!');  // Use .to.equal() in Chai
  });
});

describe('GET /api/products', function() {
  this.timeout(5000);  // Increase timeout to 5 seconds for this test

  it('should return all products', async () => {
    const response = await request(app).get('/api/products');
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
  });
});
describe('GET /api/products/:id', () => {
  it('should return a product by ID', async () => {
    const productId = 'some-valid-product-id'; // Replace with a valid ID in your DB
    
    const response = await request(app).get(`/api/products/${productId}`);
    
    // Assert that the response status is 200
    expect(response.status).to.equal(200);
    
    // Assert that the response body contains the expected product details
    expect(response.body).to.have.property('id', productId);
  });
});


