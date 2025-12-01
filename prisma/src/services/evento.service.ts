import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const GATEWAY_URL = process.env.GATEWAY_URL || '';
const JWT_SECRET = process.env.JWT_SECRET || 'Dani porfavor empieza a hacer cosas en casa o tu madre te va a vender a un africano por 1 camello';

export const getAllCiudades = async () => {
  return prisma.ciudades.findMany();
};

export const getAllEventos = async () => {
  return prisma.eventos.findMany();
};

export const updateEvento = async (slug: string, data: any) => {
  const existingEvento = await prisma.eventos.findUnique({
    where: { slug },
    select: { nombre: true }
  });

  if (data.nombre && existingEvento && data.nombre !== existingEvento.nombre) {
    const newSlug = data.nombre.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    data.slug = newSlug;
  }
  return prisma.eventos.update({
    where: { slug },
    data,
  });
};

export const hola = async () => {
  // Generamos un JWT válido


  const token = jwt.sign({ service: 'eventoService', role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

  // Fetch al gateway usando JWT válido
  const res = await fetch(`${GATEWAY_URL}/hola`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gateway responded ${res.status}: ${text}`);
  }

  return res.json();
};

export const createEvento = async (data: any) => {
  const now = new Date();

  // 1) Preparar slug si viene nombre
  const slug = data.nombre
    ? data.nombre.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
    : `evento-${Math.floor(Math.random() * 1000)}`;

  // 2) Crear evento en MongoDB (sin merchants todavía)
  const evento = await prisma.eventos.create({
    data: {
      authorId: data.authorId || null,
      category: data.category || '68d6a71d8a748b542e3f612e',
      ciudad: data.ciudad || 'Spain',
      createdAt: now,
      startDate: data.startDate ? new Date(data.startDate) : now,
      endDate: data.endDate ? new Date(data.endDate) : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      favouritesCount: 0,
      image: Array.isArray(data.image) ? data.image : [],
      isActive: data.isActive ?? true,
      nombre: data.nombre || `Evento Random ${Math.floor(Math.random() * 1000)}`,
      price: data.price || 10,
      slug,
      slug_category: Array.isArray(data.slug_category) ? data.slug_category : ['musica'],
      status: data.status || 'PUBLISHED',
      updatedAt: now,
      id_merchant: [],
    },
  });

  try {
    // timeout con AbortController
    const controller = new AbortController();
    const timeoutMs = 5000;
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const token = jwt.sign({ service: 'eventoService', role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

    const res = await fetch(`${GATEWAY_URL}/hola`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });

    clearTimeout(timer);

    if (!res.ok) {
      const text = await res.text().catch(() => '<no body>');
      console.warn(`Gateway responded ${res.status}: ${text}`);
      return evento; // devolvemos el evento creado sin merchants
    }

    const resData = await res.json().catch(() => ({}));

    const merchants =
      Array.isArray(resData.id_merchant)
        ? resData.id_merchant
        : Array.isArray(resData.merchantIds)
          ? resData.merchantIds
          : [];

    if (merchants.length > 0) {
      const updatedEvento = await prisma.eventos.update({
        where: { id: evento.id },
        data: { id_merchant: merchants },
      });
      return updatedEvento;
    }

    return evento;

  } catch (err: any) {
    if (err?.name === 'AbortError') {
      console.warn('Timeout al conectar con gateway (assignToEvent)');
    } else {
      console.warn('Error al llamar al gateway (assignToEvent):', err?.message ?? err);
    }
    return evento;
  }
};



export const deleteEvento = async (slug: string) => {
  return prisma.eventos.delete({
    where: { slug },
  });
};
