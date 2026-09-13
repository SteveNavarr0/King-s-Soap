import { FiX } from "react-icons/fi";


const AdminImageManager = ({
    existingImages = [],
    newImages,
    setNewImages,
    onDeleteExisting,
}) => {
    return (
        <div>

            {/*Display existing images*/}
            {existingImages.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                    
                    {/*Creates a thumbnail for each image*/}
                    {existingImages.map((existingImage) => ( 
                        
                        <div
                            key={existingImage.id}
                            className="relative"
                        >

                        <img
                            
                            src={existingImage.image_url}
                            alt="Existing product"
                            className="w-full h-24 object-cover rounded-lg"
                        />

                        <button
                            type="button"
                            onClick={() => onDeleteExisting(existingImage)}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer hover:bg-black transition"
                            aria-label="Delete image"
                        >
                            <FiX className="w-4 h-4" />
                        </button>
                    </div>

                    ))}
                </div>
            )}




            <label className = "w-full bg-white rounded-lg px-3 py-2 text-[#8B6B4A] cursor-pointer flex items-center justify-center text-center">
                Upload Images
                <input
                    type="file" //Open file picker
                    accept="image/*" //Only allow images
                    multiple //Allow multiple selections
                    onChange={(e) => setNewImages(Array.from(e.target.files))} //Converts into an array and saves in setNewImages. e is the selection event
                    className="hidden" //Hides default prompts
                />
            </label>


            {newImages.length > 0 && (
                <p className="mt-2 text-md text-white text-center">
                    {newImages.length} new image{newImages.length !== 1 ? "s" : ""} selected
                </p>


            )}
               
        </div>
    );
};

export default AdminImageManager;