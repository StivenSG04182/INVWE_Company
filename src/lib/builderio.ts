export async function createBuilderPage({
    name,
    model = 'page',
    data = {},
}: {
    name: string;
    model?: string;
    data?: any;
}) {
    const apiKey = process.env.BUILDER_API_KEY;
    if (!apiKey) {
        throw new Error('BUILDER_API_KEY no está definida en las variables de entorno.');
    }

    const response = await fetch(`https://builder.io/api/v1/write/${model}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            name,
            data,
            published: false,
        }),
    });

    const json = await response.json();

    if (!response.ok) {
        console.error('❌ Error al crear la página en Builder.io:', json);
        throw new Error(`Error de Builder.io API: ${json?.message || response.statusText}`);
    }

    if (!json.id) {
        throw new Error('La respuesta de Builder.io no contiene un ID válido.');
    }

    console.log('✅ Página creada en Builder.io:', json);
    return json;
}
