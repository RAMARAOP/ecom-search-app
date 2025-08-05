import {
	Container,
	SimpleGrid,
	Text,
	VStack,
	Input,
	Box,
	Spinner,
} from "@chakra-ui/react";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useProductStore } from "../store/product";
import ProductCard from "../components/ProductCard";
import { useInView } from "react-intersection-observer";

const HomePage = () => {
	const { fetchProducts, products, hasMore, loading, resetProducts } = useProductStore();

	const [page, setPage] = useState(1);
	const [searchTerm, setSearchTerm] = useState("");
	const [searchInput, setSearchInput] = useState("");

	const { ref, inView } = useInView({ threshold: 0 });

	// Fetch on initial load or search term change
	useEffect(() => {
		resetProducts(); // Clear existing list
		setPage(1);
		fetchProducts({ page: 1, search: searchTerm });
	}, [searchTerm]);

	// Fetch more when scrolling near bottom
	useEffect(() => {
		if (inView && hasMore && !loading) {
			fetchProducts({ page: page + 1, search: searchTerm });
			setPage((prev) => prev + 1);
		}
	}, [inView]);

	const handleSearch = (e) => {
		e.preventDefault();
		setSearchTerm(searchInput);
	};

	return (
		<Container maxW='container.xl' py={12}>
			<VStack spacing={8}>
				<Text
					fontSize={"30"}
					fontWeight={"bold"}
					bgGradient={"linear(to-r, cyan.400, blue.500)"}
					bgClip={"text"}
					textAlign={"center"}
				>
					Current Products 🚀
				</Text>

				<Box as='form' onSubmit={handleSearch} w={"full"}>
					<Input
						placeholder='Search by name, description, price, or image...'
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						size='lg'
					/>
				</Box>

				<SimpleGrid
					columns={{ base: 1, md: 2, lg: 3 }}
					spacing={10}
					w={"full"}
				>
					{products.map((product, idx) => (
						<ProductCard key={product._id || idx} product={product} />
					))}
				</SimpleGrid>

				{loading && (
					<Spinner size='xl' color='blue.500' />
				)}

				{/* Infinite Scroll Trigger */}
				<Box ref={ref} h='20px' />

				{!loading && products.length === 0 && (
					<Text fontSize='xl' textAlign={"center"} fontWeight='bold' color='gray.500'>
						No products found 😢{" "}
						<Link to={"/create"}>
							<Text as='span' color='blue.500' _hover={{ textDecoration: "underline" }}>
								Create a product
							</Text>
						</Link>
					</Text>
				)}
			</VStack>
		</Container>
	);
};

export default HomePage;
