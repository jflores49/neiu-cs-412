const mongoose = require('mongoose')

const WeightSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
    },
    pounds: {
        type: Number,
        required: [true, 'Number is required'],
        minLength: 1
    },
    body: {
        type: String,
        require: false
    }
})

WeightSchema.set('toObject', { getters: true, virtuals: true})

exports.Weight = mongoose.model('weight', WeightSchema)