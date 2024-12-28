// filepath: routes/industries.js
const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

// GET /industries
router.get("/", async (req, res, next) => {
	try {
		const result = await db.query(
			`SELECT i.code, i.industry, array_agg(ci.company_code) AS companies
       FROM industries AS i
       LEFT JOIN companies_industries AS ci ON i.code = ci.industry_code
       GROUP BY i.code`
		);
		return res.json({ industries: result.rows });
	} catch (err) {
		return next(err);
	}
});

// POST /industries
router.post("/", async (req, res, next) => {
	try {
		const { code, industry } = req.body;
		const result = await db.query(
			"INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry",
			[code, industry]
		);
		return res.status(201).json({ industry: result.rows[0] });
	} catch (err) {
		return next(err);
	}
});

// POST /industries/:industry_code/companies/:company_code
router.post(
	"/:industry_code/companies/:company_code",
	async (req, res, next) => {
		try {
			const { industry_code, company_code } = req.params;
			const result = await db.query(
				"INSERT INTO companies_industries (industry_code, company_code) VALUES ($1, $2) RETURNING industry_code, company_code",
				[industry_code, company_code]
			);
			return res.status(201).json({ association: result.rows[0] });
		} catch (err) {
			return next(err);
		}
	}
);

module.exports = router;
