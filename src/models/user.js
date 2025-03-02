const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    _id: Number,
    id : {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        unique: true,
    },
    email: String,
    password: {
        type: String,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isGuest: {
        type: Boolean,
        default: false,
    },
    expiryDate: Date,
    createdAt: Date,
    createdBy: String,
    createdById: String,
    updatedAt: Date,
    updatedBy: String,
    updatedById: String,
}, { versionKey: false });

const sequenceSchema = new Schema({
    _id: String,
    number: Number,
}, { versionKey: false });

const sequences = mongoose.models.sequences
    ? mongoose.models.sequences
    : mongoose.model('sequences', sequenceSchema);

userSchema.pre('save', function (next) {
    if (this._id) {
        sequences.findById('users')
        .then(sequence => {
            if (sequence) {
                if (this._id > sequence.number) {
                    sequence.number = this._id;
                    sequence.save();
                }
            } else {
                sequence.create({
                   _id: 'users',
                   number: this._id,
                });
            }
        })
        .catch(err => {
            throw err;
        });
        return next();
    }
    sequences.findByIdAndUpdate(
        { _id: 'users' },
        { $inc: { number: 1 }},
        { new: true, upsert: true },
    )
    .then(sequence => {
        this._id = sequence.number;
        next();
    })
    .catch(err => {
        throw err;
    });
});

module.exports = mongoose.model('user', userSchema);