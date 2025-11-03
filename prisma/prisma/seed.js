// prisma/seed.js
import { PrismaClient } from "@prisma/client";
import fs from "fs/promises";
const prisma = new PrismaClient();

const read = async (p) => JSON.parse(await fs.readFile(p, "utf8"));

const asISO = (v) => {
    if (!v) return null;
    if (typeof v === "string") return v;
    if (v.$date) return new Date(v.$date).toISOString();
    return null;
};
const asId = (v) => {
    if (!v) return null;
    if (typeof v === "string") return v;
    if (v.$oid) return v.$oid;
    return String(v);
};

(async () => {
    const users = await read("./data/events.users.json");
    const eventos = await read("./data/events.eventos.json");
    const comments = await read("./data/events.comments.json");
    const categories = await read("./data/events.categories.json");

    // Categories
    for (const c of categories) {
        await prisma.category.upsert({
            where: { slug: c.slug },
            update: {
                nombre: c.nombre,
                descripcion: c.descripcion ?? null,
                image: c.image?.[0] ?? null,
                status: "PUBLISHED",
                isActive: true,
            },
            create: {
                id: asId(c._id),
                nombre: c.nombre,
                descripcion: c.descripcion ?? null,
                slug: c.slug,
                image: c.image?.[0] ?? null,
                status: "PUBLISHED",
                isActive: true,
            },
        });
    }

    // Users
    for (const u of users) {
        await prisma.user.upsert({
            where: { email: u.email },
            update: {
                username: u.username,
                image: u.image ?? null,
                followersCount: u.followersCount ?? 0,
                followingCount: u.followingCount ?? 0,
                followingUsers: u.followingUsers ?? [],
                favouriteEvento: (u.favouriteEvento || []).map(asId),
                refreshTokens: u.refreshTokens ?? [],
                status: "PUBLISHED",
                isActive: true,
            },
            create: {
                id: asId(u._id),
                username: u.username,
                email: u.email,
                password: u.password, // hash existente
                image: u.image ?? null,
                followersCount: u.followersCount ?? 0,
                followingCount: u.followingCount ?? 0,
                followingUsers: u.followingUsers ?? [],
                favouriteEvento: (u.favouriteEvento || []).map(asId),
                refreshTokens: u.refreshTokens ?? [],
                status: "PUBLISHED",
                isActive: true,
                createdAt: new Date(asISO(u.createdAt) ?? Date.now()),
            },
        });
    }

    // Eventos
    for (const e of eventos) {
        await prisma.evento.upsert({
            where: { slug: e.slug },
            update: {
                nombre: e.nombre,
                ciudad: e.ciudad ?? null,
                image: e.image ?? [],
                category: e.category ?? null,
                price: e.price ?? null,
                startDate: asISO(e.startDate),
                endDate: asISO(e.endDate),
                authorId: e.author ?? null,
                status: "PUBLISHED",
                isActive: true,
            },
            create: {
                id: asId(e._id),
                nombre: e.nombre,
                slug: e.slug,
                ciudad: e.ciudad ?? null,
                image: e.image ?? [],
                category: e.category ?? null,
                price: e.price ?? null,
                startDate: asISO(e.startDate),
                endDate: asISO(e.endDate),
                authorId: e.author ?? null,
                status: "PUBLISHED",
                isActive: true,
                createdAt: new Date(asISO(e.createdAt) ?? Date.now()),
            },
        });

        // Vincula slug_category -> Category
        const slugs = e.slug_category || [];
        for (const slug of slugs) {
            const cat = await prisma.category.findUnique({ where: { slug } });
            if (!cat) continue;
            await prisma.eventoCategory.upsert({
                where: { eventoId_categoryId: { eventoId: asId(e._id), categoryId: cat.id } },
                update: {},
                create: { eventoId: asId(e._id), categoryId: cat.id },
            });
        }
    }

    // Comments
    for (const c of comments) {
        await prisma.comment.upsert({
            where: { id: asId(c._id) },
            update: {},
            create: {
                id: asId(c._id),
                body: c.body,
                authorId: c.author,
                eventoId: asId(c.evento),
                status: "PUBLISHED",
                isActive: true,
                createdAt: new Date(asISO(c.createdAt) ?? Date.now()),
            },
        });
    }

    console.log("Seed completo");
    process.exit(0);
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
