import { test, expect } from '@playwright/test';

test.describe('Simple Grocery Store', () => {

    const baseUrl = 'https://simple-grocery-store-api.glitch.me';

    let accessToken: string; // Authorization: Bearer {{YOUR TOKEN}}

    test.beforeAll(async ({ request }) => {
        const clientEmail = `user_${new Date().getTime().toString()}@mail.biz`;
        const response = await request.post(`${baseUrl}/api-clients`, {
            data: {
                "clientName": "test",
                "clientEmail": clientEmail
            }
        });
        const data = await response.json();
        accessToken = data.accessToken;
        expect(response.status()).toBe(201);
        expect(accessToken).toBeTruthy();
        console.clear();
        // console.log(`Access token: ${accessToken}`);
    });

    test('[GET] Base URL is 200', async ({ request }) => {
        const response = await request.get(baseUrl);
        const data = await response.json();
        expect(response.status()).toBe(200);
        expect(data.message).toContain('Simple Grocery Store API.');

        // console.log(`Response status code: ${response.status()}`);
        // console.log(`Response body: ${await response.body()}`);
        // console.log(`Response json: ${JSON.stringify(data)}`);
    });

    test('Status code is 200', async ({ request }) => {
        const response = await request.get(`${baseUrl}/status`);
        const data = await response.json();
        expect(response.status()).toBe(200);
        expect(data.status).toEqual('UP');

        // console.log(`Response status code: ${response.status()}`);
        // console.log(`Response body: ${await response.body()}`);
        // console.log(`Response json: ${JSON.stringify(await response.json())}`);
    });

    test('Get all products', async ({ request }) => {
        const response = await request.get(`${baseUrl}/products`);
        expect(response.status()).toBe(200);

        // console.log(`Response status code: ${response.status()}`);
        // console.log(`Response body: ${await response.body()}`);
        // console.log(`Response json: ${JSON.stringify(await response.json())}`);
    });

    test('Get all dairy products', async ({ request }) => {
        const response = await request.get(`${baseUrl}/products?category=dairy`);
        const dairyProducts = await response.json();
        const productsCategories = dairyProducts.map((product: any) => product.category);

        expect(productsCategories.every((category: string) => category === 'dairy')).toBe(true);
        expect(response.status()).toBe(200);

        // console.log(`Response status code: ${response.status()}`);
        // console.log(`Response body: ${await response.body()}`);
        // console.log(`Products categories: ${productsCategories}`);
    });

    test('Get the product from the list', async ({ request }) => {
        const response = await request.get(`${baseUrl}/products?category=coffee`);
        const products = await response.json();
        const product = products.find((product: any) => product.name === 'Starbucks Coffee Variety Pack, 100% Arabica');

        expect(response).toBeOK();
        console.log(`PRODUCT: ${JSON.stringify(product)}`);

        const responseProduct = await request.get(`${baseUrl}/products/${product.id}?product-label=true`);
        const productDetails = await responseProduct.json();
        expect(responseProduct).toBeOK();
        expect(productDetails).toEqual(expect.objectContaining({ 'product-label': expect.any(String) }));
        expect(productDetails['product-label']).toBeTruthy();
    });

    test('Add a product to the cart', async ({ request }) => {
        let cartId: number;
        let productInCartId: number;

        await test.step('[POST] Create a new cart', async () => {
            // console.clear();
            const createCart = await request.post(`${baseUrl}/carts`);
            const cart = await createCart.json();
            cartId = cart.cartId;
            expect(createCart).toBeOK();
            expect(createCart.status()).toBe(201);
            expect(cartId).toBeTruthy();
            console.log(`Cart ID: ${cartId}`);
        });

        await test.step('[GET] Check the cart is empty', async () => {
            const getCart = await request.get(`${baseUrl}/carts/${cartId}`);
            const cart = await getCart.json();
            expect(getCart).toBeOK();
            expect(cart["items"]).toHaveLength(0);
        });

        await test.step('[POST] Add the product to the cart', async () => {
            const addToCart = await request.post(`${baseUrl}/carts/${cartId}/items`, {
                data:
                {
                    "productId": 4641,
                    "quantity": 1
                }
            });
            expect(addToCart).toBeOK();
            expect(addToCart.status()).toBe(201);
        });

        await test.step('[GET] Check the cart has the product', async () => {
            const getCart = await request.get(`${baseUrl}/carts/${cartId}`);
            const cart = await getCart.json();
            expect(getCart).toBeOK();
            expect(cart["items"]).toHaveLength(1);
            expect(cart["items"][0]["productId"]).toBe(4641);
            console.log(`Cart: ${JSON.stringify(cart)}`);

            productInCartId = cart["items"][0]["id"];
            // console.log(`Product in cart ID: ${productInCartId}`);
        });

        await test.step('[PATCH] Modify the product quantity in the cart', async () => {
            const modifyItem = await request.patch(`${baseUrl}/carts/${cartId}/items/${productInCartId}`, {
                data:
                {
                    "quantity": 2
                }
            });
            expect(modifyItem).toBeOK();
            expect(modifyItem.status()).toBe(204);
        });

        await test.step('[GET] Check the cart has the modified product quantity', async () => {
            const getCart = await request.get(`${baseUrl}/carts/${cartId}`);
            const cart = await getCart.json();
            expect(getCart).toBeOK();
            expect(cart["items"]).toHaveLength(1);
            expect(cart["items"][0]["quantity"]).toBe(2);
            console.log(`Cart: ${JSON.stringify(cart)}`);
        });

        await test.step('[PUT] Replace the product in the cart', async () => {
            const replaceItem = await request.put(`${baseUrl}/carts/${cartId}/items/${productInCartId}`, {
                data:
                {
                    "productId": 4643,
                    "quantity": 1
                }
            });
            expect(replaceItem).toBeOK();
            expect(replaceItem.status()).toBe(204);
        });

        await test.step('[DELETE] Remove the product from the cart', async () => {
            const removeItem = await request.delete(`${baseUrl}/carts/${cartId}/items/${productInCartId}`);
            expect(removeItem).toBeOK();
            expect(removeItem.status()).toBe(204);
        });

        await test.step('[GET] Check the cart is empty', async () => {
            const getCart = await request.get(`${baseUrl}/carts/${cartId}`);
            const cart = await getCart.json();
            expect(getCart).toBeOK();
            expect(cart["items"]).toHaveLength(0);
        });

    });

    test('Make an order', async ({ request }) => {
        let cartId: number;
        let orderId: string;

        await test.step('Create a new cart', async () => {
            const createCart = await request.post(`${baseUrl}/carts`);
            const cart = await createCart.json();
            cartId = cart.cartId;
            expect(createCart).toBeOK();
            expect(createCart.status()).toBe(201);
            expect(cartId).toBeTruthy();
            // console.log(`Cart ID: ${cartId}`);
        });

        await test.step('Add the product to the cart', async () => {
            const addToCart1 = await request.post(`${baseUrl}/carts/${cartId}/items`, {
                data:
                {
                    "productId": 2177,
                    "quantity": 1
                }
            });
            expect(addToCart1).toBeOK();
            expect(addToCart1.status()).toBe(201);

            const addToCart2 = await request.post(`${baseUrl}/carts/${cartId}/items`, {
                data:
                {
                    "productId": 8554,
                    "quantity": 1
                }
            });
            expect(addToCart2).toBeOK();
            expect(addToCart2.status()).toBe(201);
        });

        await test.step('Create an order', async () => {
            const makeOrder = await request.post(`${baseUrl}/orders`, {
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                },
                data: {
                    "cartId": cartId,
                    "customerName": "Random Randon",
                    "comment": "Please deliver as soon as possible",
                }
            });
            expect(makeOrder).toBeOK();
            expect(makeOrder.status()).toBe(201);

            const order = await makeOrder.json();
            orderId = order.orderId;
            expect(orderId).toBeTruthy();
            // console.log(`Order ID: ${orderId}`);
        });

        await test.step('Check the order is created', async () => {
            const getOrder = await request.get(`${baseUrl}/orders/${orderId}`, {
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                }
            });
            const order = await getOrder.json();
            expect(getOrder).toBeOK();
            expect(getOrder.status()).toBe(200);
            // console.log(`Order: ${JSON.stringify(order)}`);
        });

        await test.step('Get all orders', async () => {
            const getOrders = await request.get(`${baseUrl}/orders`, {
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                },
            });
            const orders = await getOrders.json();
            expect(getOrders).toBeOK();
            expect(getOrders.status()).toBe(200);
            // console.log(`Orders: ${JSON.stringify(orders)}`);
        });

        await test.step('Update the order', async () => {
            const updateOrder = await request.patch(`${baseUrl}/orders/${orderId}`, {
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                },
                data: {
                    "comment": "Changed the comment to 'Please deliver as soon as possible'"
                }
            });
            expect(updateOrder).toBeOK();
            expect(updateOrder.status()).toBe(204);
        });

        await test.step('Check the order is changed', async () => {
            const getOrder = await request.get(`${baseUrl}/orders/${orderId}`, {
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                }
            });
            const order = await getOrder.json();
            expect(getOrder).toBeOK();
            expect(getOrder.status()).toBe(200);
            // console.log(`Order Changed to: ${JSON.stringify(order)}`);
        });

        await test.step('Delete the order', async () => {
            const deleteOrder = await request.delete(`${baseUrl}/orders/${orderId}`, {
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                }
            });
            expect(deleteOrder).toBeOK();
            expect(deleteOrder.status()).toBe(204);
        });

        await test.step('Check the order is deleted', async () => {
            const getOrder = await request.get(`${baseUrl}/orders/${orderId}`, {
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                }
            });
            expect(getOrder.status()).toBe(404);
        });
    });

});