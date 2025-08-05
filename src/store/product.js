import { create } from "zustand";
import axios from "axios";

export const useProductStore = create((set, get) => ({
	products: [],
	loading: false,
	hasMore: true,
	page: 1,

	// Reset the product list
	resetProducts: () => set({ products: [], page: 1, hasMore: true }),

	// Set products directly (used in UI sometimes)
	setProducts: (products) => set({ products }),

	// Create product
	createProduct: async (newProduct) => {
		if (!newProduct.name || !newProduct.image || !newProduct.price) {
			return { success: false, message: "Please fill in all fields." };
		}

		try {
			const res = await axios.post("/api/products", newProduct);
			set((state) => ({ products: [...state.products, res.data.data] }));
			return { success: true, message: "Product created successfully" };
		} catch (err) {
			console.error(err);
			return { success: false, message: "Error creating product." };
		}
	},

	// Fetch products with optional pagination and search
	fetchProducts: async ({ page = 1, search = "", sortBy = '' } = {}) => {
		set({ loading: true });
		try {
			const res = await axios.get("/api/products", {
				params: { page, search, sortBy },
			});
			const newProducts = res.data.products || res.data.data || [];

			set((state) => ({
				products: page === 1 ? newProducts : [...state.products, ...newProducts],
				hasMore: newProducts.length > 0,
				page,
			}));
		} catch (err) {
			console.error("Failed to fetch products:", err);
			set({ hasMore: false });
		} finally {
			set({ loading: false });
		}
	},

	// Delete product
	deleteProduct: async (pid) => {
		try {
			const res = await axios.delete(`/api/products/${pid}`);
			if (!res.data.success) return { success: false, message: res.data.message };

			set((state) => ({
				products: state.products.filter((product) => product._id !== pid),
			}));

			return { success: true, message: res.data.message };
		} catch (err) {
			console.error(err);
			return { success: false, message: "Error deleting product." };
		}
	},

	// Update product
	updateProduct: async (pid, updatedProduct) => {
		try {
			const res = await axios.put(`/api/products/${pid}`, updatedProduct);
			if (!res.data.success) return { success: false, message: res.data.message };

			set((state) => ({
				products: state.products.map((product) =>
					product._id === pid ? res.data.data : product
				),
			}));

			return { success: true, message: res.data.message };
		} catch (err) {
			console.error(err);
			return { success: false, message: "Error updating product." };
		}
	},
}));
