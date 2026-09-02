import supabase from '../supabaseClient';

const getImageUrl = (imagePath) => {
    const {data} = supabase.storage.from('Product Images').getPublicUrl(imagePath);
    return data.publicUrl;
};

function AboutImage() {
    const AboutImage = getImageUrl('images/about-page/aboutHeader.png');
    return (
        <div className = 'relative flex justify-between items-center about-page-image'>
            <img src={AboutImage} alt='Image different soaps' className='aboutHeader mx-auto w-full' />
        </div>
    );
}

export default AboutImage;