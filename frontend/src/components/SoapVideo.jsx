import supabase from '../supabaseClient';

const getVideoUrl = (videoPath) => {
  const { data } = supabase.storage.from('Product Images').getPublicUrl(videoPath);
  return data.publicUrl;
};

function SoapVideo() {
  const videoUrl = getVideoUrl('images/about-page/soapVideo.mp4');

  return (
    <div className="w-full overflow-hidden bg-[#cbb9a6] leading-none">
      <video
        className="block w-full h-auto"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src={videoUrl} type="video/mp4" />
      </video>
    </div>
  );
}

export default SoapVideo;