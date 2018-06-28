module.exports = {
    fields: {
        id: "uuid",
        category_id: "int",        
        name: "text",
        img: "text",
        description: "text",
        created_at: "timestamp",
        updated_at: "timestamp"
    },
    key: ["name"]
}