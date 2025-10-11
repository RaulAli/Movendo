export class Filters {
    limit?: number;
    offset?: number;
    price_min?: number;
    price_max?: number;
    cateogries?: string;
    nombre?: string;

    constructor(
        limit?: number,
        offset?: number,
        price_min?: number,
        price_max?: number,
        cateogries?: string,
        nombre?: string,
    ) {
        this.limit = limit || 10;
        this.offset = offset || 0;
        this.price_min = price_min;
        this.price_max = price_max;
        this.cateogries = cateogries;
        this.nombre = nombre;
    }

    public length(): number {
        let count: number = 0;
        if (this.price_min) count++;
        if (this.price_max) count++;
        if (this.cateogries) count++;
        if (this.nombre) count++;
        return count;
    }
}