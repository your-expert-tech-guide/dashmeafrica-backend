const mongoose = require("mongoose");

// const productSchema = mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//     },
//     description: {
//       type: String,
//     },
//     category: {
//       type: String,
//       required: true,
//     },
//     price: {
//       type: Number,
//       required: function () {
//         return this.tag !== 'donate';
//       },
//     },
//     priceCategory: {
//       type: String,
//       required: function () {
//         return this.tag !== 'donate';
//       },
//     },
//     image: {
//       type: String,
//     },
//     location: {
//       type: String,
//     },
//     tag: {
//       type: String,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const Product = mongoose.model('Product', productSchema);

// module.exports = Product;

const productSchema = mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
		},
		category: {
			type: String,
			required: true,
		},
		price: {
			type: Number,
			required: function () {
				return this.tag !== "donate";
			},
		},
		priceCategory: {
			type: String,
			required: function () {
				return this.tag !== "donate";
			},
		},
		image: {
			type: String,
		},
		featureImages: {
			type: [String],
		},
		location: {
			type: String,
		},
		tag: {
			type: String,
		},
		uploader: {
			type: mongoose.Schema.Types.ObjectId, // Assuming users are stored as ObjectIds
			ref: "User", // Reference to the User model
			required: true, // Make this mandatory
		},
		availability: {
			type: Boolean,
			default: true, // Default to available
		},
	},
	{
		timestamps: true,
	}
);

const Product = mongoose.model("Product", productSchema);

Product.update({}, { $set });

module.exports = Product;
