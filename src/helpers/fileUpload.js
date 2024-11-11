
export const fileUpload = async (file) => {

    if (!file) return null;

    const cloudUrl = 'https://api.cloudinary.com/v1_1/dqslkmm64/upload';

    const formData = new FormData();
    formData.append('upload_preset', 'react-journal');
    formData.append('file', file);

    const fetchOptions = {
        method: 'POST',
        body: formData
    }

    try {

        const resp = await fetch(cloudUrl, fetchOptions);

        if (!resp.ok) throw new Error('No se pudo subir la imagen');

        const cloudResp = await resp.json();

        return cloudResp.secure_url;

    } catch (error) {
        /*  console.log(error);
         throw new Error(error.message); */
        return null;
    }
}
