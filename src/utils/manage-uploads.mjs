import path from "path"
import multer from "multer";

const imgsPath = path.join(process.cwd(), '/frontPages/public/products/images'); 
const vidsPath = path.join(process.cwd(), '/frontPages/public/products/videos');


const sanitizeFilename = (filename) => filename.replace(/[^a-z0-9_.-]/gi, '_').toLowerCase();

const fileFilter = (req, file, callback) => {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.avi','.m4v'];
    const fileExt = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(fileExt)) {
        callback(null, true);
    } else {
        callback(new Error('Invalid file type! Only images and videos are allowed.'), false);
    }
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        (file.fieldname === 'product_image' || file.fieldname === 'category_image')
            ? callback(null, imgsPath)
            : callback(null, vidsPath);
    },
    filename: (req, file, callback) => {
        const filename = `${crypto.randomUUID()}_${sanitizeFilename(file.originalname)}`;
        callback(null, filename);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter
});

export default upload