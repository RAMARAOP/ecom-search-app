import mongoose from "mongoose";
import Product from "../models/product.model.js";
export const getProducts = async (req, res) => {
	try {
		// ✅ One-time fix using native MongoDB driver through Mongoose
		await Product.collection.updateMany(
			{ price: { $type: "string" } },
			[{ $set: { price: { $toDouble: "$price" } } }]
		);

		// Proceed as usual
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const sortOrder = req.query.sortBy; // 'asc' or 'desc'
		const search = req.query.search || "";

		let sortByObj = {};
		if (sortOrder === 'asc') {
			sortByObj.price = 1;
		} else if (sortOrder === 'desc') {
			sortByObj.price = -1;
		}

		const query = {};
		if (search.trim() !== "") {
			query.$or = [
				{ name: { $regex: search, $options: "i" } },
				{ description: { $regex: search, $options: "i" } },
				{ image: { $regex: search, $options: "i" } },
			];

			if (!isNaN(search)) {
				query.$or.push({ price: parseFloat(search) });
			}
		}

		const products = await Product.find(query)
			.sort(sortByObj)
			.skip((page - 1) * limit)
			.limit(limit);

		const totalCount = await Product.countDocuments(query);
		const hasMore = page * limit < totalCount;

		res.status(200).json({
			success: true,
			products,
			hasMore,
		});
	} catch (error) {
		console.error("Error in fetching products:", error.message);
		res.status(500).json({ success: false, message: "Server Error" });
	}
};




export const createProduct = async (req, res) => {
	const product = req.body; // user will send this data
	console.log(req)

	if (!product.name || !product.price || !product.image) {
		return res.status(400).json({ success: false, message: "Please provide all fields" });
	}

	const newProduct = new Product(product);

	try {
		await newProduct.save();
		res.status(201).json({ success: true, data: newProduct });
	} catch (error) {
		console.error("Error in Create product:", error.message);
		res.status(500).json({ success: false, message: "Server Error" });
	}
};

export const updateProduct = async (req, res) => {
	const { id } = req.params;

	const product = req.body;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(404).json({ success: false, message: "Invalid Product Id" });
	}

	try {
		const updatedProduct = await Product.findByIdAndUpdate(id, product, { new: true });
		res.status(200).json({ success: true, data: updatedProduct });
	} catch (error) {
		res.status(500).json({ success: false, message: "Server Error" });
	}
};

export const deleteProduct = async (req, res) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(404).json({ success: false, message: "Invalid Product Id" });
	}

	try {
		await Product.findByIdAndDelete(id);
		res.status(200).json({ success: true, message: "Product deleted" });
	} catch (error) {
		console.log("error in deleting product:", error.message);
		res.status(500).json({ success: false, message: "Server Error" });
	}
};
