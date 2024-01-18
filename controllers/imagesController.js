const {Image, CroppingSettings, User, } = require('../models/models');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const {Op} = require("sequelize");

// Set up Multer
const cacheDir = path.join(__dirname, '../cache')

// storage = multer.diskStorage({
//     destination: (req, file, cb) => cb(null, uploadDir),
//     filename: (req, file, cb) => {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//     }
// });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'), // set the destination
    filename: (req, file, cb) => {
        // Create a unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const filename = file.fieldname + '-' + uniqueSuffix + extension;
        cb(null, filename);
    }
});

const upload = multer({ storage: storage });

class ImagesController {
    async addImage(req, res){
        try {
            upload.single('image')(req, res, async (err) => {
                if (err) {
                    return res.status(500).json({ message: err.message });
                }
                if (!req.file) {
                    return res.status(400).send('No image file provided.');
                }

                const newImage = await Image.create({
                    imageName: req.file.originalname,
                    fileName: req.file.filename,
                    filePath: req.file.path,
                    userId: req.user.id
                });

                const cropData = JSON.parse(req.body.crops); // Assuming crops data is in req.body
                for (const crop of cropData) {
                    await CroppingSettings.create({
                        imageId: newImage.id,
                        aspectRatio: crop.format,
                        width: crop.width,
                        height: crop.height,
                        left: crop.left,
                        top: crop.top
                    });
                }

                res.status(200).json({ message: 'Image and crop data saved successfully' });
            });
        } catch (e) {
            console.log(e);
        }
    }

    async getAllImages(req, res) {
        try {
            let {limit, page, searchQuery} = req.query
            page = page || 1
            limit = limit || 8
            let offset = page * limit - limit

            let searchCondition = {};
            if (searchQuery) {
                searchCondition = {
                    imageName: { [Op.like]: `%${searchQuery}%` }
                };
            }


            let images = await Image.findAndCountAll({limit, offset, where: searchCondition});
            res.json(images);
        } catch (e) {
            console.log(e);
        }
    }

    async getCroppedImage(req, res) {
        try {
            const { imageId, aspectRatio, width } = req.params;

            // path to the cached image
            const cachedImagePath = path.join(cacheDir, `${imageId}_${aspectRatio}_${width}.jpg`)

            // if image exists - return this image
            if (fs.existsSync(cachedImagePath)) {
                console.log('image exist and returned to the front successfully!');
                return res.sendFile(cachedImagePath)
            }

            const image = await Image.findByPk(imageId);
            const crop = await CroppingSettings.findOne({ where: { imageId, aspectRatio }});

            if (!image || !crop) {
                return res.status(404).send('Image or crop not found');
            }

            const processedImage = await sharp(image.filePath)
                .extract({ left: crop.left, top: crop.top, width: crop.width, height: crop.height })
                .resize(parseInt(width))
                .toBuffer();

            // save image
            console.log('image not exist so we cahched it');
            fs.writeFileSync(cachedImagePath, processedImage);

            res.type('jpg').send(processedImage); // Adjust MIME type based on your image format
        } catch (error) {
            console.error(error);
            res.status(500).send('Server error');
        }
    }

    async getTeamImages (req, res) {
        try {
            let {teamId} = req.params
            let { limit, page, searchQuery } = req.query;
            console.log('request query', req.query);
            console.log('request params', req.params);
            page = page || 1;
            limit = limit || 8;
            let offset = page * limit - limit;

            let searchCondition = {};
            if (searchQuery) {
                searchCondition.imageName = { [Op.like]: `%${searchQuery}%` };
            }

            // Adding condition for teamId if provided
            let userCondition = {};
            if (teamId) {
                userCondition.teamId = teamId;
            }

            let images = await Image.findAndCountAll({
                limit,
                offset,
                where: searchCondition,
                include: [{
                    model: User,
                    where: userCondition,
                    attributes: [] // Not selecting any user attributes
                }],
            });

            return res.json(images);



            // const {teamId} = req.params;
            // console.log('team id - ', teamId);
            //
            // const users = await User.findAll({
            //     where: { teamId: teamId },
            //     include: [{
            //         model: Image,
            //         attributes: ['imageName', 'fileName', 'filePath'] // Adjust attributes as needed
            //     }]
            // });
            //
            // let images = [];
            // users.forEach(user => {
            //     images = images.concat(user.Images);
            // });
            //
            // return res.json(images);
        } catch (error) {
            console.error('Error fetching images from team:', error);
            throw error;
        }
    }
}

module.exports = new ImagesController()
