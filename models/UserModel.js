module.exports = {
    fields: {
        name: "text",
        email: "text",
        phone: "text",
        password: "varchar",
        created_at: "timestamp",
        updated_at: "timestamp"
    },
    key: ["email"]
}