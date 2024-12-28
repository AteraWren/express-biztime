// filepath: tests/invoices.test.js
const request = require("supertest");
const app = require("../app");
const db = require("../db");

jest.setTimeout(30000); // Increase timeout to 30 seconds

beforeAll(async () => {
	await db.query("BEGIN");
	try {
		await db.query("DELETE FROM invoices");
		await db.query("DELETE FROM companies");
		await db.query(`
      INSERT INTO companies (code, name, description)
      VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
             ('ibm', 'IBM', 'Big blue.');
    `);
		await db.query(`
      INSERT INTO invoices (id, comp_code, amt, paid, paid_date)
      VALUES (1, 'apple', 100, false, null),
             (2, 'apple', 200, false, null),
             (3, 'apple', 300, true, '2018-01-01'),
             (4, 'ibm', 400, false, null);
    `);
		await db.query("COMMIT");
	} catch (e) {
		await db.query("ROLLBACK");
		throw e;
	}
});

afterAll(async () => {
	await db.end();
});

describe("PUT /invoices/:id", () => {
	test("It should update an existing invoice and set paid_date if paid", async () => {
		const response = await request(app)
			.put("/invoices/1")
			.send({ amt: 150, paid: true });
		expect(response.statusCode).toBe(200);
		expect(response.body.invoice).toEqual({
			id: 1,
			comp_code: "apple",
			amt: 150,
			paid: true,
			add_date: expect.any(String),
			paid_date: expect.any(String),
		});
	});

	test("It should update an existing invoice and set paid_date to null if unpaid", async () => {
		const response = await request(app)
			.put("/invoices/1")
			.send({ amt: 150, paid: false });
		expect(response.statusCode).toBe(200);
		expect(response.body.invoice).toEqual({
			id: 1,
			comp_code: "apple",
			amt: 150,
			paid: false,
			add_date: expect.any(String),
			paid_date: null,
		});
	});

	test("It should return 404 for a non-existent invoice", async () => {
		const response = await request(app)
			.put("/invoices/999")
			.send({ amt: 150, paid: true });
		expect(response.statusCode).toBe(404);
	});
});

// Other tests...
