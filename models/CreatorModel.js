module.exports = {
    fields: {
        id : "uuid",
        name: "text",
        username: "text",
        email: "text",
        tagline: "text",
        overview: "text",
        password: "varchar",
        video: "text",
        paypal_address: "text",
        profile: "text",
        cover_picture: "text",
        funding_amount: "int",
        monthly_income: "int",
        sponsors: "int",
        category_id: "text",
        created_at: "timestamp",
        updated_at: "timestamp"
    },
    key: ["id"]
}