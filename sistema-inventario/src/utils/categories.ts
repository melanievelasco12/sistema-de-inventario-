export function normalizeLabel(value: string): string {
    return value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
}

export function categorySlug(value: string): string {
    return normalizeLabel(value).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
