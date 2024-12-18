/**
 *
 * @param {File} file
 * @returns
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
 */
async function uploadMultiple(files) {
	// for each uploadSingle
}
