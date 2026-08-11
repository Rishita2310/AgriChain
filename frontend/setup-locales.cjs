const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'i18n', 'locales');
if (!fs.existsSync(localesDir)) {
    fs.mkdirSync(localesDir, { recursive: true });
}

const languages = ['en', 'hi', 'gu', 'es', 'fr', 'ar', 'zh', 'ja', 'de', 'ru'];
const baseDict = {
    "nav": {
        "home": "Home",
        "features": "Features",
        "how_it_works": "How It Works",
        "testimonials": "Testimonials",
        "faq": "FAQ",
        "contact": "Contact",
        "wallet": "Wallet",
        "login": "Login",
        "get_started": "Get Started"
    },
    "hero": {
        "headline": "Empowering Farmers Through Blockchain",
        "subtitle": "Connect directly with trusted buyers, eliminate unnecessary middlemen, receive transparent payments, and trade securely using blockchain technology.",
        "stats_farmers": "Farmers",
        "stats_buyers": "Buyers",
        "stats_markets": "Markets",
        "stats_countries": "Countries",
        "learn_more": "Learn More"
    },
    "cta": {
        "headline": "Ready to Transform Agriculture?",
        "create_account": "Create Free Account",
        "explore_marketplace": "Explore Marketplace"
    }
};

languages.forEach(lang => {
    fs.writeFileSync(
        path.join(localesDir, `${lang}.json`),
        JSON.stringify(baseDict, null, 2)
    );
});
console.log("Locales created");
