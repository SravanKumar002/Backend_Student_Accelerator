import mongoose from 'mongoose';

const curriculumSchema = new mongoose.Schema({
    courseName: { type: String },
    courseId: { type: String, required: true },
    topic: { type: String },
    topicId: { type: String },
    sessionName: { type: String },
    setType: { type: String },
    unitId: { type: String },
    duration: { type: String },
    languages: { type: String },
    sessionLink: { type: String },
    outcomes: { type: String },
    prerequisites: { type: String },
    techNonTech: { type: String },
    sequenceNumber: { type: Number, index: true }  // Preserves CSV row order for proper curriculum sequence
}, {
    timestamps: true
});

const Curriculum = mongoose.model('Curriculum', curriculumSchema);
export default Curriculum;
