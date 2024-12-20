const cloudinary = require("cloudinary").v2;

/**
 *
 * @param {File} file
 * @returns {}
 */
async function uploadSingle(file) {
	const uploadPromise = new Promise((resolve, reject) => {
		const stream = cloudinary.uploader.upload_stream(
			{ resource_type: "image" },
			(error, result) => {
				if (error) {
					reject(error);
				}
				resolve(result);
			}
		);

		require("streamifier").createReadStream(file.buffer).pipe(stream);
	});

	return await uploadPromise;
}

/**
 *
 * @param {File[]} files
 * @returns {Promise<[string[],import("cloudinary").UploadApiResponse[]]>}
 */
async function uploadMultiple(files) {
	// for each uploadSingle

	const uploadPromises = files.map(async (file) => {
		return uploadSingle(file);
	});

	const cloudinaryResult = await Promise.all(uploadPromises).catch();
	const cloudinaryUrls = cloudinaryResult.map((result) => result.secure_url);

	return [cloudinaryUrls, cloudinaryResult];
}

module.exports = { uploadMultiple, uploadSingle };
