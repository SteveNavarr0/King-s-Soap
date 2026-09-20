import { FiX } from "react-icons/fi";
import { useEffect, useState } from "react";


//Convert image order number to readable label
const getPositionLabel = (position) => {
    const positionLabels = {
        1:"Main",
        2:"Second",
        3:"Third",
        4:"Fourth",
        5:"Fifth",
        6:"Sixth",
    };

    return positionLabels[position] || `Position ${position}`;
};



const AdminImageManager = ({
    existingImages = [],
    setExistingImages,
    newImages,
    setNewImages,
    newImageOrders = [],
    setNewImageOrders,
    onDeleteExisting,
}) => {


    //Store temp URLs use to preview newly selected images
    const [newImagePreviews, setNewImagePreviews] = useState([]);



    //Temp preview URL for every image
    useEffect(() => {
        const previewUrls = newImages.map((image) =>
        URL.createObjectURL(image) //Give each a temp browser URL
    );

        setNewImagePreviews(previewUrls);

        //Delete the temp URLs when no longer in use
        return () => {
            previewUrls.forEach((previewUrl) =>
            URL.revokeObjectURL(previewUrl)
            );
        };
    },

    [newImages]);



    //Remove a newly selected image from the newly selected previewUrl array
    const removeNewImage = (indexToRemove) => {
        //Remove the actual file
        setNewImages(
            newImages.filter(
                (_, index) => index !== indexToRemove
            )
        );

        //AdminUpdateProduct order array update
        if (setNewImageOrders) {
            setNewImageOrders((currentOrders) => {
                const remainingOrders = currentOrders.filter(
                    (_, index) => index !== indexToRemove
                );

                //Close any position gap left by removed image
                return remainingOrders.map(
                    (_, index) =>
                        existingImages.length + index + 1
                );
            });
        }
    };


    //Save selected files and assign their initial positions
    const handleNewImagesSelected = (event) => {
        //Convert the browser's fileList into a normal array
        const selectedFiles = Array.from(event.target.files);

        //Store the actual image files
        setNewImages(selectedFiles);

        //Setter provided by AdminUpdateProduct
        if (setNewImageOrders) {
            setNewImageOrders(
                selectedFiles.map(
                    (_,index) =>
                        existingImages.length + index + 1
                )
            );
        }
    };



    //Move a newly selected iamge anywhere in the complete image order
    const changeNewImageOrder = (currentIndex, newOrder) => {
        //Combine saved images and unsaved files into one temp list
        const combinedImages = [
            ...existingImages.map((image) => ({
                type: "existing",
                image,
                display_order: image.display_order,

            })),

            ...newImages.map((file, index) => ({
                type: "new",
                file,
                originalIndex: index,
                display_order:
                    newImageOrders[index] ??
                    existingImages.length + index + 1,
            })),
        ].sort(
            (firstImage, secondImage) =>
                firstImage.display_order -
                secondImage.display_order
            );

        //Find the selected new image inside the combined list
        const selectedImageIndex = combinedImages.findIndex(
            (image) =>
                image.type === "new" &&
            image.originalIndex === currentIndex
        );

       //Convert the selected order into an array index
       const targetIndex = newOrder - 1;

       //Store the image currently occupying the requested position
       const imageBeingReplaced = combinedImages[targetIndex];

       //Put the selected mage into its requested pos
       combinedImages[targetIndex] =
        combinedImages[selectedImageIndex];

        //Put the replaced image into the selected iamge's old pos
        combinedImages[selectedImageIndex] = 
            imageBeingReplaced;
        

        //Renumber the complete list
        const reorderedImages = combinedImages.map(
            (image, index) => ({
                ...image,
                display_order: index + 1,
            })
        );

        //Update the saved images with their new positions
        if (setExistingImages) {
            setExistingImages(
                reorderedImages
                    .filter((image) => image.type === "existing")
                    .map((image) => ({
                        ...image.image,
                        display_order: image.display_order,
                    }))
            );
        }

        //Keep the new files in their newly selected order
        const reorderedNewImages = reorderedImages.filter(
            (image) => image.type === "new"
        );

        setNewImages(
            reorderedNewImages.map((image) => image.file)
        );

        if (setNewImageOrders) {
            setNewImageOrders(
                reorderedNewImages.map(
                    (image) => image.display_order
                )
            );
        }
    };



    //Move an existing image anywhere in the complete image order
    const changeExistingImageOrder = (imageId, newOrder) => {
         //Combine saved images and unsaved files into one temp list
        const combinedImages = [
            ...existingImages.map((image) => ({
                type: "existing",
                image,
                display_order: image.display_order,

            })),

            ...newImages.map((file, index) => ({
                type: "new",
                file,
                originalIndex: index,
                display_order:
                    newImageOrders[index] ??
                    existingImages.length + index + 1,
            })),
        ].sort(
            (firstImage, secondImage) =>
                firstImage.display_order -
                secondImage.display_order
            );

        //Find the selected existing image
        const selectedImageIndex = combinedImages.findIndex(
            (image) =>
                image.type === "existing" &&
            image.image.id === imageId
        );

        //Convert the selected order into an array index
        const targetIndex = newOrder - 1;

        //Temp store the image in the requested pos
        const imageBeingReplaced = combinedImages[targetIndex];

        //Swap the selected image with the image in the requested pos
        combinedImages[targetIndex] = 
            combinedImages[selectedImageIndex];

        combinedImages[selectedImageIndex] =
            imageBeingReplaced;



        //Renumber the complete list
        const reorderedImages = combinedImages.map(
            (image, index) => ({
                ...image,
                display_order: index + 1,
            })
        );

        //Update existing images
        setExistingImages(
            reorderedImages
                .filter((image) => image.type === "existing")
                .map((image) => ({
                    ...image.image,
                    display_order: image.display_order,
                }))
        );
        

        //Update newly selected files
        const reorderedNewImages = reorderedImages.filter(
            (image) => image.type === "new"
        );

        setNewImages(
            reorderedNewImages.map((image) => image.file)
        );

        if (setNewImageOrders) {
            setNewImageOrders(
                reorderedNewImages.map(
                    (image) => image.display_order
                )
            );
        }
    };


    //Combine existing and new images into one visually ordered list
    const orderedImagePreviews = [
        ...existingImages.map((image) => ({
            type: "existing",
            key: `existing-${image.id}`,
            image,
            previewUrl: image.image_url,
            display_order: image.display_order,

        })),

        ...newImagePreviews.map((previewUrl, index) => ({
            type: "new",
            key: `new-${previewUrl}`,
            previewUrl,
            newImageIndex: index,
            display_order:
                newImageOrders[index] ??
                existingImages.length + index + 1,
        })),
    ].sort(
        (firstImage, secondImage) =>
            firstImage.display_order -
            secondImage.display_order
    );
    


    return (
        <div>

            {/*Display existing images and new images in their selected order*/}
            {orderedImagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                    
                    {/*Creates a thumbnail for each image*/}
                    {orderedImagePreviews.map((displayImage) => ( 
                        
                        <div
                            key={displayImage.key}
                            className="relative"
                        >

                        <img
                            
                            src={displayImage.previewUrl}
                            alt={
                                displayImage.type === "existing"
                                    ? "Existing product"
                                    : `New product preview ${displayImage.newImageIndex + 1}`
                            }
                            className="w-full h-24 object-cover rounded-lg"
                        />


                        {/*Display Order Dropdown*/}
                        <select
                            value={displayImage.display_order} //Image's curent position
                            onChange={(event) => {
                                const newOrder = Number(
                                    event.target.value
                                );

                                if (displayImage.type === "existing") {
                                    changeExistingImageOrder(
                                        displayImage.image.id,
                                        newOrder
                                    );
                                } else {
                                    changeNewImageOrder(
                                        displayImage.newImageIndex,
                                        newOrder
                                    );
                                }
                            }}

                            className="absolute top-1 left-1 max-w-[70%] rounded-md bg-black/70 px-1 py-1 text-xs text-white outline-none cursor-pointer"
                            aria-label="Change image position"
                        >


                            {Array.from(
                                {
                                    length:
                                    existingImages.length +
                                    newImages.length,
                                },
                                (_, positionIndex) => {
                                    const position = positionIndex + 1; //Position at 1 instead of 0



                                    return (
                                        <option key = {position} value = {position}>
                                            {getPositionLabel(position)}
                                        </option>
                                    );
                                }
                             )}  

                        </select>


                         {/*Delete Image Button*/}
                        <button
                            type="button"
                            onClick={() => {
                                if (displayImage.type === "existing") {
                                    onDeleteExisting(displayImage.image);
                                } else {
                                    removeNewImage(
                                        displayImage.newImageIndex
                                    );
                                }
                            }}
                            
                            
                            
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer hover:bg-black transition"
                            aria-label="Delete image"
                        >
                            <FiX className="w-4 h-4" />
                        </button>
                    </div>

                    ))}

                </div>
            )}





            {/*Upload Images Button*/}
            <label className = "w-full bg-white rounded-lg px-3 py-2 text-[#8B6B4A] cursor-pointer flex items-center justify-center text-center">
                Upload Images
                <input
                    type="file" //Open file picker
                    accept="image/*" //Only allow images
                    multiple //Allow multiple selections
                    onChange={handleNewImagesSelected}
                    className="hidden" //Hides default prompts
                />
            </label>

             {/*Message for how many images were selected*/}
            {newImages.length > 0 && (
                <p className="mt-2 text-md text-white text-center">
                    {newImages.length} new image{newImages.length !== 1 ? "s" : ""} selected
                </p>


            )}
               
        </div>
    );
};

export default AdminImageManager;