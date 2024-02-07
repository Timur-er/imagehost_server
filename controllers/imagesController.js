const {Image, CroppingSettings, User, Team, } = require('../models/models');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const {Op} = require("sequelize");
const crypto = require('crypto')

// Set up Multer
const cacheDir = path.join(__dirname, '../cache')

function generateHash(imageName) {
    const hash = crypto.createHash('sha512');
    hash.update(imageName);
    return hash.digest('hex');
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, '/server/uploads/'), // set the destination
    filename: (req, file, cb) => {

        // change to hash name
        const hashName = generateHash(file.originalname);
        const extension = path.extname(file.originalname);
        cb(null, hashName + extension);
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
                const imageId = path.basename(req.file.filename, path.extname(req.file.filename));
                const newImage = await Image.create({
                    id: imageId,
                    imageName: req.file.originalname,
                    fileName: req.file.filename,
                    filePath: req.file.path,
                    userId: req.user.id
                });

                const cropData = JSON.parse(req.body.crops);
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
            let {teamName} = req.params
            let { limit, page, searchQuery } = req.query;
            page = page || 1;
            limit = limit || 8;
            let offset = page * limit - limit;

            let searchCondition = {};
            if (searchQuery) {
                searchCondition.imageName = { [Op.like]: `%${searchQuery}%` };
            }

            // Find the team by name
            const team = await Team.findOne({ where: { name: teamName } });
            if (!team) {
                return res.status(404).send('Team not found');
            }

            // Find all users in the team
            const users = await User.findAll({ where: { teamId: team.id } });
            const userIds = users.map(user => user.id);

            // Find and count all images for these users
            let images = await Image.findAndCountAll({
                limit,
                offset,
                where: {
                    ...searchCondition,
                    userId: { [Op.in]: userIds } // Select images where userId is in the list of team user IDs
                },
            });

            return res.json(images);
        } catch (error) {
            console.error('Error fetching images from team:', error);
            throw error;
        }
    }

    async scriptAddImage (req, res) {
        try {
            // Decode the base64 image and write to a temporary file
            const imageBuffer = Buffer.from(req.body.image, 'base64');
            const tempImageName = `temp_${Date.now()}.jpg`; // Temporary filename
            const tempImagePath = path.join(__dirname, 'uploads', tempImageName); // Temporary file path
            fs.writeFileSync(tempImagePath, imageBuffer);

            // Add the temp file information to req.file so Multer can process it
            req.file = {
                originalname: tempImageName,
                path: tempImagePath,
                // Add other required Multer fields if necessary
            };

            // Now let Multer process the temp file as if it was a regular file upload
            upload.single('image')(req, {}, async (err) => {
                if (err) {
                    // Cleanup temp file in case of error
                    fs.unlinkSync(tempImagePath);
                    return res.status(500).json({ message: err.message });
                }
                if (!req.file) {
                    fs.unlinkSync(tempImagePath);
                    return res.status(400).send('No image file provided.');
                }

                const imageId = path.basename(req.file.filename, path.extname(req.file.filename));
                const newImage = await Image.create({
                    id: imageId,
                    imageName: req.file.originalname,
                    fileName: req.file.filename,
                    filePath: req.file.path,
                    userId: 2
                });

                const cropData = JSON.parse(req.body.crops);
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

                // Cleanup temp file after processing
                fs.unlinkSync(tempImagePath);

                res.status(200).json({ message: 'Image and crop data saved successfully' });
            });
        } catch (e) {
            console.log(e);
            res.status(500).json({ message: e.message });
        }
    }
}

module.exports = new ImagesController()
