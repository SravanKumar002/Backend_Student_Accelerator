import mongoose from 'mongoose';

const studentDataSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        profile: {
            name: { type: String, required: true },
            year: {
                type: String,
                enum: ['1st', '2nd', '3rd', '4th'],
                required: true,
            },
            languageComfort: {
                type: String,
                enum: ['telugu', 'english', 'other'],
                required: true,
            },
            hasBacklogs: { type: Boolean, required: true, default: false },
        },
        goals: {
            primaryGoal: {
                type: String,
                enum: ['placement', 'internship', 'skill-upgrade'],
                required: true,
            },
            targetStack: {
                type: String,
                enum: ['frontend', 'backend', 'fullstack', 'ai-ml', 'dsa', 'sql', 'python'],
                required: true,
            },
            currentSkillLevel: {
                type: Number,
                min: 1,
                max: 5,
                required: true,
            },
        },
        availability: {
            weekdayHours: { type: Number, required: true },
            weekendHours: { type: Number, required: true },
            preferredWindow: {
                type: String,
                enum: ['morning', 'afternoon', 'late-night'],
                required: true,
            },
            planDuration: {
                type: String,
                enum: ['1-week', '2-week', '3-week', '4-week', '1-month', '2-month'],
                required: true,
            },
        },
    },
    {
        timestamps: true,
    }
);

const StudentData = mongoose.model('StudentData', studentDataSchema);
export default StudentData;
