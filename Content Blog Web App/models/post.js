const mongoose = require('mongoose');
const slug = require('slugify');

const postSchema = new mongoose.Schema({
    heading: { type: String, required: true },
    slug: { type: String, unique: true, required: true },
    createdOn: { type: Date, default: Date.now, required: true },
    metadata: { type: String, required: true },
    body: { type: String, required: true }
});

postSchema.pre("validate", function(next){
    if(this.heading) {
        this.slug = slug(this.heading, { lower: true, strict: true });
    }

    next();
});

module.exports = mongoose.model("Post", postSchema);