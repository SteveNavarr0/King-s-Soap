import {Link} from "react-router-dom";


const AdminProductTile = ({ product }) => { //Pass product as a prop to the AdminProductTile component
    return (

        <Link to={`/AdminUpdateProduct/${product.id}`}
            className="block"
        >
            <div className= "mb-6 w-full h-18 md:h-25 rounded-lg bg-white/15 backdrop-blur-lg border border-white/30 shadow-sm text-white text-md md:text-2xl flex items-center justify-center hover:scale-102 cursor-pointer transition">
                {product.name} {/* Display the product name */}
            </div>
        
        </Link>

    );
};

export default AdminProductTile;