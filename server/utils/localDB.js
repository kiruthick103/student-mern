const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/db.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, '../data'))) {
    fs.mkdirSync(path.join(__dirname, '../data'));
}

// Initial structure
const initialData = {
    users: [],
    studentProfiles: [],
    subjects: [],
    attendance: [],
    marks: [],
    assignments: [],
    announcements: [],
    studyMaterials: [],
    studyPlans: []
};

if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
}

const readDB = () => {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
};

const writeDB = (data) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

const db = {
    // Generic methods
    find: (collection, query = {}) => {
        const data = readDB()[collection];
        return data.filter(item => {
            for (let key in query) {
                if (item[key] !== query[key]) return false;
            }
            return true;
        });
    },

    findOne: (collection, query = {}) => {
        const data = readDB()[collection];
        return data.find(item => {
            for (let key in query) {
                if (item[key] !== query[key]) return false;
            }
            return true;
        });
    },

    findById: (collection, id) => {
        const data = readDB()[collection];
        return data.find(item => item._id === id);
    },

    insertOne: (collection, item) => {
        const data = readDB();
        const newItem = { ...item, _id: item._id || Date.now().toString() + Math.random().toString(36).substr(2, 9) };
        data[collection].push(newItem);
        writeDB(data);
        return newItem;
    },

    updateOne: (collection, query, update) => {
        const data = readDB();
        const index = data[collection].findIndex(item => {
            for (let key in query) {
                if (item[key] !== query[key]) return false;
            }
            return true;
        });
        if (index === -1) return null;
        data[collection][index] = { ...data[collection][index], ...update };
        writeDB(data);
        return data[collection][index];
    },

    findByIdAndUpdate: (collection, id, update) => {
        const data = readDB();
        const index = data[collection].findIndex(item => item._id === id);
        if (index === -1) return null;
        data[collection][index] = { ...data[collection][index], ...update };
        writeDB(data);
        return data[collection][index];
    },

    deleteOne: (collection, query) => {
        const data = readDB();
        const index = data[collection].findIndex(item => {
            for (let key in query) {
                if (item[key] !== query[key]) return false;
            }
            return true;
        });
        if (index === -1) return false;
        data[collection].splice(index, 1);
        writeDB(data);
        return true;
    },

    deleteById: (collection, id) => {
        const data = readDB();
        const index = data[collection].findIndex(item => item._id === id);
        if (index === -1) return false;
        data[collection].splice(index, 1);
        writeDB(data);
        return true;
    }
};

module.exports = db;
