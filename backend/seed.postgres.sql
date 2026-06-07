INSERT INTO categories (slug, name, sort_order) VALUES
    ('fresh', 'Охлажденная рыба', 10),
    ('frozen', 'Замороженная рыба', 20),
    ('seafood', 'Морепродукты', 30),
    ('fillets', 'Филе и стейки', 40)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    sort_order = EXCLUDED.sort_order;

INSERT INTO users (id, full_name, email, initials, role) VALUES
    (1, 'Ольга Ивановна', 'olga@example.com', 'ОИ', 'customer'),
    (2, 'Администратор Морские Дары', 'admin@fishsite.local', 'АД', 'admin')
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    initials = EXCLUDED.initials,
    role = EXCLUDED.role;

INSERT INTO products (
    id,
    category_slug,
    name,
    price_rub,
    stock_quantity,
    popularity,
    image_path,
    image_symbol,
    is_popular,
    description,
    weight,
    shelf_life,
    origin,
    storage
) VALUES
    (1, 'fresh', 'Сёмга охлажденная', 1200, 18, 98, 'assets/images/product-01-salmon.png', '•', true, 'Свежая охлажденная сёмга высшего качества. Идеально подходит для засолки, приготовления на гриле или в духовке. Доставка осуществляется в термокоробах для сохранения свежести.', '1 кг', '5 дней', 'Норвегия', '0°C до +2°C'),
    (2, 'fresh', 'Форель радужная', 900, 22, 88, 'assets/images/product-02-trout.png', '•', true, 'Радужная форель, выращенная в экологически чистых условиях. Нежное мясо с минимальным количеством костей. Отлично подходит для ухи, запекания и приготовления на пару.', '1 кг', '5 дней', 'Карелия', '0°C до +2°C'),
    (3, 'seafood', 'Креветки тигровые', 1800, 14, 92, 'assets/images/product-03-tiger-shrimp.png', '•', false, 'Крупные тигровые креветки, замороженные свежими. Идеальны для гриля, пасты, салатов и азиатской кухни. Размер: 16-20 шт/кг.', '1 кг', '12 месяцев', 'Вьетнам', '-18°C и ниже'),
    (4, 'frozen', 'Кальмар замороженный', 700, 30, 74, 'assets/images/product-04-squid.png', '•', true, 'Филе кальмара, очищенное от кожи и внутренностей. Быстрая заморозка позволяет сохранить все полезные свойства. Подходит для жарки, салатов и фарширования.', '1 кг', '18 месяцев', 'Перу', '-18°C и ниже'),
    (5, 'fillets', 'Филе трески', 650, 35, 66, 'assets/images/product-05-cod-fillet.png', '•', false, 'Филе трески без кожи и костей. Диетический продукт с высоким содержанием белка. Отлично подходит для детского и диетического питания.', '1 кг', '12 месяцев', 'Баренцево море', '-18°C и ниже'),
    (6, 'seafood', 'Мидии в раковинах', 850, 28, 78, 'assets/images/product-06-mussels.png', '•', true, 'Мидии в раковинах, приготовленные на пару и замороженные. Уже готовы к употреблению после разморозки. Идеальны для пасты, супов и самостоятельных блюд.', '1 кг', '12 месяцев', 'Чили', '-18°C и ниже'),
    (7, 'fillets', 'Стейки лосося', 1100, 16, 84, 'assets/images/product-07-salmon-steaks.png', '•', false, 'Стейки лосося нарезанные поперек тушки. Идеальная толщина для приготовления на гриле или сковороде. Каждый стейк упакован индивидуально.', '1 шт (~200г)', '12 месяцев', 'Норвегия', '-18°C и ниже'),
    (8, 'seafood', 'Осьминог', 2200, 8, 70, 'assets/images/product-08-octopus.png', '•', false, 'Осьминог средиземноморский, предварительно очищенный. Нежное мясо, которое становится мягким при правильном приготовлении. Деликатес для истинных гурманов.', '1 кг', '12 месяцев', 'Марокко', '-18°C и ниже'),
    (9, 'fresh', 'Дорадо', 950, 20, 86, 'assets/images/product-09-dorado.png', '•', true, 'Свежая дорадо (морской карась). Мясо белое, нежное, с минимальным количеством костей. Идеальна для запекания целиком с травами и лимоном.', '1 кг', '5 дней', 'Греция', '0°C до +2°C'),
    (10, 'frozen', 'Камбала', 750, 24, 62, 'assets/images/product-10-flounder.png', '•', false, 'Камбала дальневосточная. Нежное диетическое мясо с уникальным вкусом. Отлично подходит для жарки и запекания. Поставляется в потрошеном виде.', '1 кг', '12 месяцев', 'Дальний Восток', '-18°C и ниже'),
    (11, 'seafood', 'Икра лососевая', 2500, 9, 96, 'assets/images/product-11-salmon-caviar.png', '•', true, 'Икра лососевая зернистая. Натуральный продукт без искусственных красителей. Идеальна для бутербродов, блинчиков и украшения блюд.', '100 г', '6 месяцев', 'Камчатка', '0°C до +4°C'),
    (12, 'fillets', 'Филе пангасиуса', 450, 40, 58, 'assets/images/product-12-pangasius-fillet.png', '•', false, 'Филе пангасиуса без кожи и костей. Экономичный вариант для ежедневного питания. Подходит для жарки, запекания и приготовления котлет.', '1 кг', '12 месяцев', 'Вьетнам', '-18°C и ниже')
ON CONFLICT (id) DO UPDATE SET
    category_slug = EXCLUDED.category_slug,
    name = EXCLUDED.name,
    price_rub = EXCLUDED.price_rub,
    stock_quantity = GREATEST(products.stock_quantity, EXCLUDED.stock_quantity),
    popularity = EXCLUDED.popularity,
    image_path = EXCLUDED.image_path,
    image_symbol = EXCLUDED.image_symbol,
    is_popular = EXCLUDED.is_popular,
    description = EXCLUDED.description,
    weight = EXCLUDED.weight,
    shelf_life = EXCLUDED.shelf_life,
    origin = EXCLUDED.origin,
    storage = EXCLUDED.storage,
    is_active = true,
    updated_at = now();
