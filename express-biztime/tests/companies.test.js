// filepath: tests/companies.test.js
const request = require("supertest");
const app = require("../app");
const db = require("../db");

jest.setTimeout(30000); // Increase timeout to 30 seconds

beforeAll(async () => {
	await db.query("BEGIN");
	try {
		await db.query("DELETE FROM invoices");
		await db.query("DELETE FROM companies");
		await db.query("DELETE FROM industries");
		await db.query("DELETE FROM companies_industries");
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
		await db.query(`
      INSERT INTO industries (code, industry) VALUES
      ('acct', 'Accounting'),
      ('tech', 'Technology'),
      ('fin', 'Finance');
    `);
		await db.query(`
      INSERT INTO companies_industries (company_code, industry_code) VALUES
      ('apple', 'tech'),
      ('ibm', 'tech'),
      ('ibm', 'acct');
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

describe("GET /companies", () => {
	test("It should respond with an array of companies", async () => {
		const response = await request(app).get("/companies");
		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			companies: [
				{ code: "apple", name: "Apple Computer" },
				{ code: "ibm", name: "IBM" },
			],
		});
	});
});

describe("GET /companies/:code", () => {
	test("It should respond with a single company", async () => {
		const response = await request(app).get("/companies/apple");
		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			company: {
				code: "apple",
				name: "Apple Computer",
				description: "Maker of OSX.",
				invoices: [1, 2, 3],
				industries: ["Technology"],
			},
		});
	});

	test("It should return 404 for a non-existent company", async () => {
		const response = await request(app).get("/companies/nonexistent");
		expect(response.statusCode).toBe(404);
	});
});

describe("POST /companies", () => {
	test("It should create a new company", async () => {
		const response = await request(app)
			.post("/companies")
			.send({
				code: "microsoft",
				name: "Microsoft",
				description: "Maker of Windows.",
			});
		expect(response.statusCode).toBe(201);
		expect(response.body).toEqual({
			company: {
				code: "microsoft",
				name: "Microsoft",
				description: "Maker of Windows.",
			},
		});
	});
});

describe("PUT /companies/:code", () => {
	test("It should update an existing company", async () => {
		const response = await request(app)
			.put("/companies/apple")
			.send({ name: "Apple Inc.", description: "Maker of iPhones." });
		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			company: {
				code: "apple",
				name: "Apple Inc.",
				description: "Maker of iPhones.",
			},
		});
	});

	test("It should return 404 for a non-existent company", async () => {
		const response = await request(app)
			.put("/companies/nonexistent")
			.send({ name: "Nonexistent", description: "Does not exist." });
		expect(response.statusCode).toBe(404);
	});
});

describe("DELETE /companies/:code", () => {
	test("It should delete an existing company", async () => {
		const response = await request(app).delete("/companies/apple");
		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({ status: "deleted" });
	});

	test("It should return 404 for a non-existent company", async () => {
		const response = await request(app).delete("/companies/nonexistent");
		expect(response.statusCode).toBe(404);
	});
});
