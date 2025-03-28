export default function NotFound() {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50'>
      <div className='max-w-md px-4 py-8 text-center'>
        <h1 className='text-4xl font-bold text-red-600 mb-4'>404 - Página no encontrada</h1>
        <p className='text-gray-600 mb-8'>
          El inventario solicitado no existe o no tienes permisos para acceder.
        </p>
        <a
          href='/'
          className='inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
        >
          Volver al inicio
        </a>
      </div>
    </div>
  );
}