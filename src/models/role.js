const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const permissionSchema = new Schema({
    read: {
        type: Boolean,
        default: false,
    },
    create: {
        type: Boolean,
        default: false,
    },
    update: {
        type: Boolean,
        default: false,
    },
    delete: {
        type: Boolean,
        default: false,
    },
}, { _id: false });

const roleSchema = new Schema({
    _id: Number,
    userId: {
        type: String,
        required: true,
        unique: true,
    },
    permissions: {
        type: Map,
        of: permissionSchema,
        default: {},
    },
    createdAt: Date,
    createdBy: String,
    updatedAt: Date,
    updatedBy: String,
}, { versionKey: false });

const sequenceSchema = new Schema({
    _id: String,
    number: Number,
}, { versionKey: false });

const sequences = mongoose.models.sequences
    ? mongoose.models.sequences
    : mongoose.model('sequences', sequenceSchema);

roleSchema.pre('save', function (next) {
    if (this._id) {
        sequences.findById('roles')
        .then(sequence => {
            if (sequence) {
                if (this._id > sequence.number) {
                    sequence.number = this._id;
                    sequence.save();
                }
            } else {
                sequence.create({
                    _id: 'roles',
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
        { _id: 'roles' },
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

module.exports = mongoose.model('roles', roleSchema);