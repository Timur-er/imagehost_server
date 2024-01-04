require('dotenv').config()
const multer = require('multer')
const cookieParser = require('cookie-parser');
const express = require('express')
const path = require('path');
const sharp = require('sharp')
const cors = require('cors');
const fs = require('fs')
const sequelize = require('./db')
const router = require('./routes/index')

const PORT = process.env.PORT || 8000;

const options = {
    origin: process.env.CLIENT_URL,
    credentials: true,
    exposedHeaders: ['Content-Disposition']
}

const app = express()
app.use(cors(options))
app.use(express.json())
app.use(cookieParser());
app.use('/api', router)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'Images')
//     },
//     filename: (req, file, cb) => {
//         console.log(file);
//         cb(null, Date.now() + path.extname(file.originalname))
//     }
// })
//
// const upload = multer({storage: multer.memoryStorage()})
//
// const uploadDir = path.join(__dirname, 'uploads');
// const cacheDir = path.join(__dirname, 'cache')
//
// app.post('/upload', upload.single('image'), async (req, res) => {
//     try {
//         const imageBuffer = req.file.buffer;
//         const crops = JSON.parse(req.body.crops);
//         const width = JSON.parse(req.body.width);
//         const height = JSON.parse(req.body.height);
//         console.log('crops - ', crops);
//
//         await Promise.all(crops.map(crop => processAndSaveImage(imageBuffer, crop, uploadDir)));
//
//         res.status(200).json({ message: 'Images processed and saved' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Error processing images');
//     }
//
// })
//
//
// // Function to process and save each cropped image
// async function processAndSaveImage(imageBuffer, crop, outputDir) {
//     const outputPath = path.join(outputDir, `${crop.format}.jpg`);
//
//     await sharp(imageBuffer)
//         .extract({ left: crop.left, top: crop.top, width: crop.width, height: crop.height })
//         .toFile(outputPath);
// }
//
//
// app.get('/image/:image_id/:format/:width', async (req, res) => {
//     const { image_id, format, width } = req.params;
//
//     // Путь к кэшированному изображению
//     const cachedImagePath = path.join(cacheDir, `${image_id}_${format}_${width}.jpg`);
//
//     // Если кэшированное изображение существует, отправляем его
//     if (fs.existsSync(cachedImagePath)) {
//         return res.sendFile(cachedImagePath);
//     }
//
//     // Путь к исходному изображению
//     const originalImagePath = path.join(uploadDir, `${image_id}.jpg`);
//
//     // Проверяем, существует ли исходное изображение
//     if (!fs.existsSync(originalImagePath)) {
//         return res.status(404).send('Image not found');
//     }
//
//     try {
//         // Обработка и кэширование изображения
//         const processedImage = await sharp(originalImagePath)
//             .resize(parseInt(width))
//             // .toFormat(format)
//             .toBuffer();
//
//         // Сохраняем кэшированное изображение
//         fs.writeFileSync(cachedImagePath, processedImage);
//
//         // Отправляем изображение в ответ
//         res.type('jpg'); // Установка Content-Type для jpg изображения
//         res.end(processedImage, 'binary');
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Error processing image');
//     }
// });



const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()

        app.listen(PORT, () => {
            console.log('server started on port: ',  PORT)
        })
    } catch (e) {
        console.log(e)
    }
}

start()

