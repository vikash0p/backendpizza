import mongoose from 'mongoose'

const pizzaSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
    },
    variants: [],
    price: [],
    image: {
        type: String,
        required: true
    },


}, {
    timestamps: true,
})
const Pizza = mongoose.model("Pizza", pizzaSchema);
export default Pizza