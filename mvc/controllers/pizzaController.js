import Pizza from "../models/pizzaSchema.js"

export const createPizza = async (req, res, next) => {

    const { name, description, category, variants, price, image } = req.body
    try {
        const pizza = await Pizza.create({ name, description, category, variants, price, image })
        res.status(201).json({ message: "pizza created successfully", success: true, pizza })
    } catch (error) {
        res.status(404).json({ message: "failed to create pizza", success: false, error: error.message })
    }

}

export const getAllPizzas = async (req, res, next) => {
    try {
        const pizza = await Pizza.find().exec();
        res.status(201).json({ message: "pizza fetched successfully", success: true, pizza })

    } catch (error) {
        res.status(404).json({ message: "failed to fetch pizza", success: false, error: error.message })

    }

}

export const getPizzaById = async (req, res) => {
    const { id } = req.params;
    try {

        const pizza = await Pizza.findById(id);
        if(!pizza){
            return res.status(404).json({ message: "failed to fetch pizza", success: false, error: error.message })

        }
        res.status(201).json({ message: "Single pizza fetched successfully", success: true, pizza })

    } catch (error) {
        res.status(404).json({ message: "failed to fetch pizza", success: false, error: error.message })

    }
}