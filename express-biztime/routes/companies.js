// filepath: routes/companies.js
const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

// GET /companies
router.get("/", async (req, res, next) => {
	try {
		const result = await db.query("SELECT code, name FROM companies");
		return res.json({ companies: result.rows });
	} catch (err) {
		return next(err);
	}
});

// GET /companies/[code]
router.get("/:code", async (req, res, next) => {
	try {
		const { code } = req.params;
		const companyResult = await db.query(
			"SELECT code, name, description FROM companies WHERE code = $1",
			[code]
		);

		if (companyResult.rows.length === 0) {
			throw new ExpressError(`Company with code ${code} not found`, 404);
		}

		const invoicesResult = await db.query(
			"SELECT id FROM invoices WHERE comp_code = $1",
			[code]
		);

		const industriesResult = await db.query(
			`SELECT i.industry
       FROM industries AS i
       JOIN companies_industries AS ci ON i.code = ci.industry_code
       WHERE ci.company_code = $1`,
			[code]
		);

		const company = companyResult.rows[0];
		company.invoices = invoicesResult.rows.map((inv) => inv.id);
		company.industries = industriesResult.rows.map((ind) => ind.industry);

		return res.json({ company });
	} catch (err) {
		return next(err);
	}
});

// POST /companies
router.post("/", async (req, res, next) => {
	try {
		const { code, name, description } = req.body;
		const result = await db.query(
			"INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description",
			[code, name, description]
		);
		return res.status(201).json({ company: result.rows[0] });
	} catch (err) {
		return next(err);
	}
});

// PUT /companies/[code]
router.put("/:code", async (req, res, next) => {
	try {
		const { code } = req.params;
		const { name, description } = req.body;
		const result = await db.query(
			"UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description",
			[name, description, code]
		);

		if (result.rows.length === 0) {
			throw new ExpressError(`Company with code ${code} not found`, 404);
		}

		return res.json({ company: result.rows[0] });
	} catch (err) {
		return next(err);
	}
});

// DELETE /companies/[code]
router.delete("/:code", async (req, res, next) => {
	try {
		const { code } = req.params;
		const result = await db.query(
			"DELETE FROM companies WHERE code = $1 RETURNING code",
			[code]
		);

		if (result.rows.length === 0) {
			throw new ExpressError(`Company with code ${code} not found`, 404);
		}

		return res.json({ status: "deleted" });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
