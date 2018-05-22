module.exports = {
    fields: {
        id : "uuid",
        name: "text",
        email: "text",
        img_src: "text",
        description: "text",
        password: "varchar",
        welcome_video: "text",
        paypal_address: "text",
        funding_amount: "text",
        category_id: "text",
        created_at: "timestamp",
        updated_at: "timestamp"
    },
    key: ["id"]
}